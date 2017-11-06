import homeDir from 'home-dir'

const utils = {
  returnTestGlobals () {
    return {
      email: process.env.E2E_CLI_EMAIL,
      password: process.env.E2E_CLI_PASSWORD,
      accountKey: process.env.E2E_CLI_ACCOUNT_KEY,
      syncanoYmlPath: `${homeDir()}/syncano-test.yml`,
      instance: process.env.E2E_CLI_INSTANCE_NAME || 'wandering-pine-7032'
    }
  },

  splitTestBaseEmail (tempEmail) {
    const splittedEmail = {};

    [splittedEmail.emailName, splittedEmail.emailDomain] = tempEmail.split('@')

    return splittedEmail
  },

  createTempEmail (tempEmail, tempPass) {
    const { emailName, emailDomain } = this.splitTestBaseEmail(tempEmail)

    return `${emailName}+${tempPass}@${emailDomain}`
  },

  getRandomString (prefix = 'randomString') {
    return `${prefix}_${Math.random().toString(36).slice(2)}`
  },

  assignTestRegistryEnv () {
    const registryInstanceName = process.env.SYNCANO_SOCKET_REGISTRY
    process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE = registryInstanceName.split('.')[0]
  },

  removeTestRegistryEnv () {
    delete process.env.SYNCANO_SOCKET_REGISTRY_INSTANCE
  }
}

export default utils
