import {response, data} from 'syncano-server'

const { name } = ARGS // eslint-disable-line no-undef

data.organization
  .where('name', 'eq', name)
  .firstOrFail()
  .then(organization => data.organization.delete(organization.id))
  .then(resp => {
    response(' ', 202)
  })
  .catch(err => {
    if (err.name === 'NotFoundError') {
      response(err.message, 404)
    } else {
      response('Error while executing script', 400)
    }
  })
