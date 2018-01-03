import middleware from 'syncano-middleware'
import {authUser} from '../../helpers/auth'
import {isOrgUniq} from './helpers'
import {response, logger, data} from 'syncano-server'

const { name } = ARGS // eslint-disable-line no-undef

middleware([ authUser, isOrgUniq ])
  .then(resp => {
    const [ user, checkOrgIsUniq ] = resp

    data.organization.create({
      name,
      owner_account: user.id
    })
    .then((organization) => {
      response(JSON.stringify({
        name: organization.name,
        id: organization.id
      }))
    })
  })
  .catch(err => {
    response(err.message, 400)
  })
