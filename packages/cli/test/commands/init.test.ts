import {expect, test} from '@oclif/test'
import {deleteConfigFile, deleteInstance, testsLocation, uniqueInstance} from '@syncano/test-tools'
import fs from 'fs'
import path from 'path'

describe('init', () => {
  const testInstanceName = uniqueInstance()
  const testDir = path.join(testsLocation, testInstanceName)
  try { fs.mkdirSync(testDir) } catch {}
  afterEach(() => { try { deleteConfigFile() } catch {} })

  test
    .stdout()
    .command(['init'])
    .exit(1)
    .it('runs when not logged in', ctx => {
      expect(ctx.stdout).to.contain('You are not logged in!')
    })

  test
    .stdout()
    .env({SYNCANO_AUTH_KEY: process.env.E2E_CLI_ACCOUNT_KEY})
    .do(() => process.chdir(testDir))
    .finally(async () => {
      await deleteInstance(testInstanceName)
    })
    .command(['init', testInstanceName, '-t', '@syncano/template-project-empty', '-l', 'eu1'])
    .it('creates instance and file structure', ctx => {
      expect(ctx.stdout).to.contain('Project has been created from @syncano/template-project-empty template.')
      expect(ctx.stdout).to.contain(`Your project is now attached to ${testInstanceName} instance!`)
    })
})
