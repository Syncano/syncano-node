import middleware from 'syncano-middleware'
import {checkOrgOwnership} from './helpers'
import {response, data} from 'syncano-server'

const { member_email, organizationId } = ARGS // eslint-disable-line no-undef

middleware([ checkOrgOwnership ])
  .then(resp => {
    const [[user, organization]] = resp

    data.organization.update(organization.id, {
      description: ARGS.description
    })
    .then((organization) => {
      response(JSON.stringify({
        name: organization.name,
        description: organization.description
      }))
    })
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
