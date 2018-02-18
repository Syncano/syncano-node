import querystring from 'querystring'
import fetch from 'axios'
import FormData from 'form-data'

function SyncanoClient(instanceName = required('instanceName'), options = {}) {
  const host = options.host || 'syncano.space'
  const DEFAULT_HEADERS = {'Content-Type': 'application/json'}

  client.instanceName = instanceName
  client.baseUrl = `https://${instanceName}.${host}/`
  client.loginMethod = options.loginMethod
  client.setTokenCallback = options.setTokenCallback
  client.token = options.token
  client.headers = headers => Object.assign({}, DEFAULT_HEADERS, headers)
  client.post = client

  client.login = function(username, password) {
    const login = client.loginMethod
      ? client.loginMethod
      : (username, password) => {
          const url = `https://api.syncano.io/v2/instances/${
            client.instanceName
          }/users/auth/`
          const data = JSON.stringify({username, password})

          return fetch({url, data}).then(user => {
            client.setToken(user.token)

            return user
          })
        }

    return login(username, password)
  }

  client.url = function(endpoint, data) {
    let url = `${this.baseUrl}${endpoint}/?`

    if (data) {
      url += `${querystring.stringify(data)}&`
    }

    if (client.token) {
      url += `user_key=${client.token}`
    }

    return url
  }

  client.logout = function() {
    this.token = undefined
  }

  client.setToken = function(token) {
    this.token = token

    if (typeof client.setTokenCallback === 'function') {
      client.setTokenCallback(token)
    }
  }

  client.get = function(
    endpoint = required('endpoint'),
    data = {},
    options = {}
  ) {
    return this.post(endpoint, {...data, _method: 'GET'}, options)
  }

  client.delete = function(
    endpoint = required('endpoint'),
    data = {},
    options = {}
  ) {
    return this.post(endpoint, {...data, _method: 'DELETE'}, options)
  }

  client.put = function(
    endpoint = required('endpoint'),
    data = {},
    options = {}
  ) {
    return this.post(endpoint, {...data, _method: 'PUT'}, options)
  }

  client.patch = function(
    endpoint = required('endpoint'),
    data = {},
    options = {}
  ) {
    return this.post(endpoint, {...data, _method: 'PATCH'}, options)
  }

  // Used by the client.subscribe method to start polling from the correct id
  client.setLastId = function(endpoint, data) {
    const url = this.url(`${endpoint}/history`, data)
    // eslint-disable-next-line camelcase
    if (data.last_id) {
      return
    }

    return fetch(url).then(response => {
      const obj = response.data.objects[0]
      return obj ? obj.id : null
    })
  }

  client.subscribe = function(endpoint = required('endpoint'), data, callback) {
    let abort = false
    const hasData = typeof data === 'object' && data !== null

    const bodyParams = data
    const requestData = {}
    delete bodyParams['_method']

    const options = {
      timeout: 1000 * 60 * 5, // 5 minutes
      headers: client.headers(),
      method: 'GET',
      params: bodyParams,
      data: requestData
    }

    let url = client.url(endpoint, data)
    const cb = hasData ? callback : data

    function loop() {
      if (abort) {
        return
      }

      fetch(url, options)
        .then(response => {
          cb(response.data)
          // eslint-disable-next-line camelcase
          data.last_id = response.data.id
          url = client.url(endpoint, data)
          loop()
        })
        .catch(err => {
          const isNetworkError = /(Network Error)|(timeout)/.test(err)
          const isNotAborted = abort === false

          if (isNetworkError && isNotAborted) {
            loop()
          }
        })
    }

    client.setLastId(endpoint, data).then(response => {
      // eslint-disable-next-line camelcase
      data.last_id = response
      url = client.url(endpoint, data)
      loop()
    })

    return {
      stop: () => {
        abort = true
      }
    }
  }

  client.subscribe.once = function(
    endpoint = required('endpoint'),
    data = {},
    callback
  ) {
    const hasData = typeof data === 'object' && data !== null
    const cb = hasData ? callback : data
    const listener = client.subscribe(
      endpoint,
      hasData ? data : {},
      response => {
        listener.stop()
        cb(response)
      }
    )
  }

  return client

  function client(endpoint = required('endpoint'), data = {}, options = {}) {
    const method = data._method || 'POST'
    const headers = client.headers(options.headers)
    let url = client.url(endpoint)

    let bodyParams = {}
    let requestData = data
    delete bodyParams['_method']

    if (method === 'GET') {
      requestData = {}
      bodyParams = data
    }

    const transformRequest = [
      function(data) {
        if (data instanceof FormData) {
          return data
        }
        return JSON.stringify(data)
      }
    ]

    return fetch({
      method: method,
      url,
      params: bodyParams,
      data: requestData,
      headers,
      transformRequest,
      ...options
    }).then(response => response.data)
  }
}

function required(param) {
  throw new Error(`${param} parameter is required by SyncanoClient`)
}

export default SyncanoClient
