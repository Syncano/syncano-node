import middleware from 'syncano-middleware'
import {authUser} from '../../helpers/auth'
import {getOrg} from './helpers'

const { name } = ARGS // eslint-disable-line no-undef

middleware([ authUser, getOrg ])
  .then(data => {
    const [ user, fields ] = data
  })
  .const(err => {
    console.log(err)
  })

// Promise.all([authUser(), getOrg()])
//   .then((data) => {
//     const [user, organization] = data
//
//     if (!organization ) {
//       response.error(400, 'Organization with that name already exist!')
//     } else {
//       db.data.organization.create({
//         name,
//         owner_account: user.id
//       })
//       .then((organization) => {
//         response(JSON.stringify({
//           name: organization.name,
//           id: organization.id
//         }))
//       })
//       .catch(err => {
//         console.log(process.env)
//         console.log(err.response)
//       })
//     }
//   })
//   .catch(err => {
//     console.log(err)
//   })
