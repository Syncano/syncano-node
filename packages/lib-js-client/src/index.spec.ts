import Syncano from '../src'

const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const mockAxios = new MockAdapter(axios)

const INSTANCE_NAME = 'INSTANCE_NAME'
const URL = 'SOCKET/ENDPOINT'
const TOKEN = 'TOKEN'

let s: Syncano

afterEach(() => {
  mockAxios.reset()
})

beforeEach(() => {
  s = new Syncano(INSTANCE_NAME, {
    transformResponse: (res) => res
  })
})

it('throws error while calling endpoint without instance name', () => {
  s = new Syncano('')

  expect(s.post.bind(s)).toThrowErrorMatchingSnapshot()
})

it('has public instanceName property', () => {
  expect(s.instanceName).toBe(INSTANCE_NAME)
})

it('has public token property', () => {
  expect(s.instanceName).toBe(INSTANCE_NAME)
})

it('can set token', () => {
  s.setToken(TOKEN)

  expect(s.token).toBe(TOKEN)
  mockAxios.onPost(s.url(URL)).reply(200)
  expect(s.post(URL)).resolves.toHaveProperty('config.params.user_key', TOKEN)
})

it('send all requests with user key', () => {
  s.setToken(TOKEN)

  mockAxios.onPost(s.url(URL)).reply(200)
  expect(s.post(URL)).resolves.toHaveProperty('config.params.user_key', TOKEN)

  mockAxios.onGet(s.url(URL)).reply(200)
  expect(s.get(URL)).resolves.toHaveProperty('config.params.user_key', TOKEN)

  mockAxios.onPatch(s.url(URL)).reply(200)
  expect(s.patch(URL)).resolves.toHaveProperty('config.params.user_key', TOKEN)

  mockAxios.onPut(s.url(URL)).reply(200)
  expect(s.put(URL)).resolves.toHaveProperty('config.params.user_key', TOKEN)

  mockAxios.onDelete(s.url(URL)).reply(200)
  expect(s.delete(URL)).resolves.toHaveProperty('config.params.user_key', TOKEN)
})

it('by default send request with "Content-Type: application/json"', () => {
  mockAxios.onPost(s.url(URL)).reply(200)

  expect(s.post(URL)).resolves.toHaveProperty('config.headers.Content-Type', 'application/json')
})

it('can send request with custom header', () => {
  const options = {
    headers: {'X-RATE-LIMIT': 10}
  }

  mockAxios.onPost(s.url(URL)).reply(200)

  expect(s.post(URL, undefined, options)).resolves.toHaveProperty('config.headers.X-RATE-LIMIT', 10)
})

it('unwraps response data', () => {
  s = new Syncano(INSTANCE_NAME)

  mockAxios.onGet(s.url(URL)).reply(200, {hello: 'world'})

  expect(s.get(URL)).resolves.toHaveProperty('hello', 'world')
})

it('can send DELETE request', () => {
  mockAxios.onDelete(s.url(URL)).reply(201)

  expect(s.delete(URL)).resolves.toHaveProperty('status', 201)
})

it('can send PATCH request', () => {
  mockAxios.onPatch(s.url(URL)).reply(200, {hello: 'world'})

  expect(s.patch(URL)).resolves.toHaveProperty('status', 200)
  expect(s.patch(URL)).resolves.toHaveProperty('data.hello', 'world')
})

it('can send POST request', () => {
  mockAxios.onPost(s.url(URL)).reply(200, {hello: 'world'})

  expect(s.post(URL)).resolves.toHaveProperty('status', 200)
  expect(s.post(URL)).resolves.toHaveProperty('data.hello', 'world')
})

it('can send PUT request', () => {
  mockAxios.onPut(s.url(URL)).reply(200, {hello: 'world'})

  expect(s.put(URL)).resolves.toHaveProperty('status', 200)
  expect(s.put(URL)).resolves.toHaveProperty('data.hello', 'world')
})

it('can send GET request', () => {
  const params = {id: 1}

  mockAxios.onGet(s.url(URL)).reply(200, params)
  expect(s.get(URL)).resolves.toHaveProperty('status', 200)
  expect(s.get(URL)).resolves.toHaveProperty('data.id', 1)

  mockAxios.onGet(s.url(URL), {params}).reply(200, params)
  expect(s.get(URL, {id: 1})).resolves.toHaveProperty('config.params', params)
})

it('can init WebSocket connection', () => {
  expect(s.listen(URL)).toBeInstanceOf(WebSocket)
})
