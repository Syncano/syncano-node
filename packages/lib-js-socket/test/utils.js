import Server from '../src'

const accountConnection = new Server({accountKey: process.env.E2E_ACCOUNT_KEY})

export const getRandomString = (length = 8) => {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let text = 'a'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text.toLowerCase()
}

export const createTestInstance = instanceName => {
  return accountConnection.instance.create({name: instanceName})
}

export const deleteTestInstance = instanceName => {
  return accountConnection.instance.delete(instanceName)
}
