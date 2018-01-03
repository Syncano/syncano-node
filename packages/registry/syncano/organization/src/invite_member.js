import middleware from 'syncano-middleware'
import {checkOrgOwnership} from './helpers'
import {response, data} from 'syncano-server'

const { member_email, organizationId } = ARGS // eslint-disable-line no-undef

middleware([ checkOrgOwnership ])
  .then(data => {
    const [[user, organization]] = data

    console.log(user)
    console.log()
    console.log(organization)
    // db.data.organization.create({
    //   name,
    //   owner_account: user.id
    // })
    // .then((organization) => {
    //   response(JSON.stringify({
    //     name: organization.name,
    //     id: organization.id
    //   }))
    // })
    response('test', 202)
  })
  .catch(err => {
    response(err.message, 400)
  })

// db.data.organization
//   .where('name', 'eq', name)
//   .findOrFail()
//   .then(organization => {
//     return db.data.organization.delete(organization.id)
//   })
//   .then(() => {
//     response({ status: 202 })
//   })
//   .catch(err => {
//     response.error(err)
//   })
