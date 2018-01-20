import {response, data} from 'syncano-server'

const responseObj = {}

const fetch = () => {
  data.organization
    .where('name', 'eq', ARGS.name)  // eslint-disable-line no-undef
    .first()
    .then(organization => {
      responseObj.name = organization.name
      responseObj.owner_account = organization.owner_account
      response.json(responseObj)
    })
}

fetch()
