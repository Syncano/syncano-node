const {spawn} = require('child_process')
const gitBranch = require('git-branch')

const branch = gitBranch.sync()
const version = branch.match(/^\d/)
const isMaster = branch === 'master'
const name = process.argv.slice(2)[0]

if (version !== null || isMaster) {
  const config = isMaster ? name : `${name}-${version}`

  configureCname(config).then(syncFiles)
}

/* ========================================================================== */

function configureCname (config) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'syncano-cli',
      ['hosting', 'config', config, '--cname', `${config}.syncano.io`]
    )

    child.stdout.on('data', function (data) {
      process.stdout.write(data.toString())
      resolve(config)
    })

    child.stderr.on('data', function (data) {
      process.stdout.write(data.toString())
      reject(data.toString())
    })
  })
}

function syncFiles (config) {
  return new Promise((resolve, reject) => {
    const child = spawn('syncano-cli', ['hosting', 'sync', config])

    child.stdout.on('data', function (data) {
      process.stdout.write(data.toString())
      resolve(data.toString())
    })

    child.stderr.on('data', function (data) {
      process.stdout.write(data.toString())
      reject(data.toString())
    })
  })
}
