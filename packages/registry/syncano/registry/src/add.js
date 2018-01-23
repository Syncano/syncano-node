import FormData from 'form-data'
import semver from 'semver'

import Syncano from '@syncano/core'

export default async (ctx) => {
  const syncano = new Syncano(ctx)
  const {response, logger, data} = syncano
  const {error, debug} = logger('add')

  try {
    const {
      getSocketLastVersion,
      checkSocketOwentship,
      checkVersion} = require('./helpers/socket').default(ctx, syncano)

    const {authUser} = require('./helpers/auth').default(ctx, syncano)
    const {getOrCreateAuthor} = require('./helpers/author').default(ctx, syncano)
    const {getKeywords} = require('./helpers/keyword').default(ctx, syncano)

    const { name, description, version, icon, url, config } = ctx.args
    const keywords = JSON.parse(ctx.args.keywords || '[]')

    const user = await authUser()
    const socketObj = await getSocketLastVersion()

    if (!semver.valid(version)) {
      debug('invalid version', version)
      const message = `Version "${version}" has a wrong format! Check http://semver.org/ for more info.`
      return response.json({message}, 400)
    }

    if (socketObj) {
      if (!checkSocketOwentship(user, socketObj)) {
        response.json({message: 'This socket doesn\'t belong to you!'}, 400)
        process.exit()
      }
      if (!checkVersion(socketObj.version, version)) {
        return response.json({message: `Wrong version! It should be greater ${socketObj.version}`}, 400)
      }
    }

    const author = await getOrCreateAuthor(user)
    debug('Author found/created:', author)

    // Let's find keywords (or create them if doesn't exist)
    debug('Provided keywords:', keywords)
    const keywordsArray = await getKeywords(keywords)

    debug('Socket keywords:', keywordsArray.map((keyword) => keyword.name))

    const socket = await data.socket.create({
      name,
      description,
      owner_account: user.id,
      version,
      author: author.id,
      private: true,
      url: url,
      config,
      icon,
      keywords: keywordsArray ? keywordsArray.map((keyword) => keyword.id) : []
    })

    // Upload file
    debug('uploading file')
    const form = new FormData()
    form.append('zip_file', ctx.args.file, {filename: 'file.zip', filetype: 'application/zip'})
    await data.socket.update(socket.id, form)

    debug('Socket created:', socket.name)
    response.json({
      name: socket.name,
      version: socket.version,
      author: author.display_name,
      keywords: socket.keywords
        ? socket.keywords.map(keyword => keyword.name) : []
    })
  } catch (err) {
    error(err.message)
    response.json({message: err.message}, 400)
  }
}
