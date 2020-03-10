import {expect, test} from '@oclif/test'
import {createBackup, createInstance, deleteBackup, deleteConfigFile, deleteInstance, uniqueInstance} from '@syncano/test-tools'

describe('backup:last', () => {
  beforeEach(() => { try { deleteConfigFile() } catch {} })
  let testInstanceName = uniqueInstance()
  let backupId

  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: undefined})
    .command(['backup:last'])
    .exit(1)
    .it('when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .command(['backup:last'])
    .exit(1)
    .it('when no instance', ctx => {
      expect(ctx.stdout).to.contain('You have to attach this project to one of your instances.')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_PROJECT_INSTANCE: testInstanceName
    })
    .do(async () => createInstance(testInstanceName))
    .command(['backup:last'])
    .exit(2)
    .it('when no backups', ctx => {
      expect(ctx.stdout).to.contain('You don\'t have any backups!')
    })

  test
    .stdout()
    .env({
      SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY,
      SYNCANO_INSTANCE_NAME: testInstanceName,
      SYNCANO_PROJECT_INSTANCE: testInstanceName
    })
    .do(async () => {
      const {id} = await createBackup()
      backupId = id
    })
    .finally(async () => {
      return Promise.all([
        deleteBackup(backupId).then(() => deleteInstance(testInstanceName))
      ])
    })
    .command(['backup:last'])
    .exit(2)
    .it('when there are backups', async ctx => {
      await timeout(5000)
      expect(ctx.stdout).to.contain('id:')
    })
})
