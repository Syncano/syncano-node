/* global describe it before after */
import replace from 'replace'
import path from 'path'

import {
  nixt,
  testsLocation,
  cleanUpAccount,
  createdSocketName,
  randomKey,
  returnTestGlobals,
  createTempEmail,
  getRandomString
} from '@syncano/test-tools'

import uniqueInstance from '../../src/utils/unique-instance'

const cliLocation = path.join(process.cwd(), 'lib/cli.js')
const registrySocketName = 'openweathermap2'
const hostingName = 'tests'
const hostingName2 = 'tests2'
const { email, password, syncanoYmlPath, instance } = returnTestGlobals()
const tempPass = Date.now()
const tempEmail = createTempEmail(process.env.E2E_CLI_TEMP_EMAIL, tempPass)

const linkSyncanoPackages = () => {
  replace({
    regex: '"@syncano/build-es6": "0.4.1"',
    replacement: `"@syncano/build-es6": "${path.join(__dirname, '../../../build-es6')}"`,
    paths: [testsLocation],
    recursive: true,
    silent: true
  })
}

describe('[E2E] CLI User', function () {
  before(cleanUpAccount)
  after(cleanUpAccount)

  it('can run cli command', function (done) {
    nixt()
      .run('node lib/cli.js')
      .stdout(/Usage: cli \[options\] \[command\]/)
      .end(done)
  })

  it('can run cli init with existing account', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} init`)
      .on(/Your e-mail/)
      .respond(`${email}\n`)
      .on(/Password/)
      .respond(`${password}\n`)
      .on(/Hello World/)
      // Choose from dropdown default project template: hello
      .respond('\n')
      .stdout(/Creating Syncano Instance/)
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .end(done)
  })

  // This tests are just checking for proper console output currently
  // and depend on the init from previous test.
  // We should improve it in the future.
  it('can list installed sockets', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} list`)
      .stdout(/description: Hello World Socket/)
      .end(done)
  })

  it('can\'t list non existing Socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} list ${getRandomString()}`)
      .stdout(/No Socket was found on server nor in config!/)
      .end(done)
  })

  it('can deploy hello socket', function (done) {
    nixt()
      .before(linkSyncanoPackages)
      .cwd(testsLocation)
      .run(`${cliLocation} deploy hello`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('can add registry socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} add ${registrySocketName}`)
      .on(/Type in value:/)
      .respond(`${randomKey}\n`)
      .stdout(/socket synced:/)
      .end(done)
  })

  it('can show registry config', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config-show ${registrySocketName}`)
      .stdout(/name: API_KEY \(required\)/)
      .end(done)
  })

  it('can change registry config', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config ${registrySocketName}`)
      .on(/Type in value:/)
      .respond(`${randomKey}\n`)
      .end(done)
  })

  it('can remove registry socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} remove ${registrySocketName}`)
      .on(/Are you sure you want to remove/)
      .respond('y\n')
      .stdout(/removed!/)
      .end(done)
  })

  it('can\'t remove registry socket again', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} remove ${registrySocketName}`)
      .stdout(/No Socket was found on server nor in config/)
      .end(done)
  })

  it('can call hello socket endpoint', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} call hello/hello`)
      .on(/Type in value for "firstname" parameter/)
      .respond('TEST\n')
      .on(/Type in value for "lastname" parameter/)
      .respond('CLI\n')
      .code(0)
      .stdout(/Hello TEST CLI/)
      .end(done)
  })

  it('can set config of socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} config-set hello name test`)
      .end(done)
  })

  it('can create new socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} create ${createdSocketName}`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .stdout(/Your Socket configuration is stored at/)
      .end(done)
  })

  it('can\'t create new socket with the name of existing socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} create ${createdSocketName}`)
      .on(/Choose template for your Socket/)
      .respond('\n')
      .stdout(/Socket with given name already exist!/)
      .end(done)
  })

  it('can submit created socket to registry', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} submit ${createdSocketName}`)
      .stdout(/to make it available for everyone/)
      .end(done)
  })

  it('can bump version of submited socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} submit ${createdSocketName} -b major`)
      .stdout(/\(1\.0\.0\)\.\.\. Done/)
      .end(done)
  })

  it('can publish created socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} publish ${createdSocketName}`)
      .stdout(/now publicly available/)
      .end(done)
  })

  it('can\'t publish socket again', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} publish ${createdSocketName}`)
      .stdout(/This socket is not private/)
      .end(done)
  })

  it('can delete created socket', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} remove ${createdSocketName}`)
      .on(/Are you sure you want to remove/)
      .respond('Y\n')
      .stdout(/has been successfully removed/)
      .end(done)
  })

  it('can run cli sync', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} deploy`)
      .stdout(/socket in sync:/)
      .end(done)
  })

  it('can add hosting', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} hosting add hosting`)
      .on(/Set hosting's name/)
      .respond(`${hostingName}\n`)
      .on(/Set CNAME/)
      .respond('\n')
      .on(/sync files now/)
      .respond('\n')
      .stdout(/sync files use: syncano-cli hosting sync/)
      .end(done)
  })

  it('can add hosting with folder outside of syncano folder', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} hosting add ../tests/e2e/assets/hosting_test`)
      .on(/Set hosting's name/)
      .respond(`${hostingName2}\n`)
      .on(/Set CNAME/)
      .respond('\n')
      .on(/sync files now/)
      .respond('\n')
      .stdout(/sync files use: syncano-cli hosting sync/)
      .end(done)
  })

  it('can list hosting containers', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting list`)
    .on(/Choose socket for which you you want to list hostings/)
    .respond('\n')
    .stdout(/name: tests/)
    .end(done)
  })

  it('can check if there are hosting files', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting files ${hostingName}`)
    .on(/Choose a socket which hosting files you want to see/)
    .respond('\n')
    .stdout(/There are no files in this hosting/)
    .end(done)
  })

  it('can sync local hosting', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting sync ${hostingName}`)
    .on(/Choose socket in which you want to set up hosting/)
    .respond('\n')
    .stdout(/files synchronized/)
    .end(done)
  })

  it('can delete hosting container 1', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting delete ${hostingName}`)
    .on(/Are you sure you/)
    .respond('Y\n')
    .stdout(/has been successfully deleted!/)
    .end(done)
  })

  it('can delete hosting container 2', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting delete ${hostingName2}`)
    .on(/Are you sure you/)
    .respond('Y\n')
    .stdout(/has been successfully deleted!/)
    .end(done)
  })

  it('can see there is not hosting containers', function (done) {
    nixt()
    .cwd(testsLocation)
    .run(`${cliLocation} hosting list`)
    .stdout(/You don't have any hostings/)
    .end(done)
  })

  it('can logout from cli', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} logout`)
      .stdout(/You have been logged out/)
      .unlink(syncanoYmlPath)
      .end(done)
  })
  // This is end of tests dependency

  it('can run cli init --instance with existing account', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} init --instance ${instance}`)
      .on(/Your e-mail/)
      .respond(`${email}\n`)
      .on(/Password/)
      .respond(`${password}\n`)
      .on(/Choose template for your project/)
      .respond('\n')
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .unlink(syncanoYmlPath)
      .end(done)
  })

  it('can run cli init with new account', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} init`)
      .on(/Your e-mail/)
      .respond(`${tempEmail}\n`)
      .on(/Password/)
      .respond(`${tempPass}\n`)
      .on(/This email doesn't exists/)
      .respond('Yes\n')
      .stdout(/New account has been created/)
      .on(/Choose template for your project/)
      .respond('\n')
      .stdout(/Creating Syncano Instance/)
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .unlink(syncanoYmlPath)
      .end(done)
  })

  // For now we don't support create new instance on Syncano with specific name during init project.
  // Unlock this test in CLI-208
  it.skip('can run cli init --instance with new account', function (done) {
    nixt()
      .cwd(testsLocation)
      .run(`${cliLocation} init --instance ${uniqueInstance()}`)
      .on(/Your e-mail/)
      .respond(`${tempEmail}\n`)
      .on(/Password/)
      .respond(`${tempPass}\n`)
      .on(/Choose template for your project/)
      .respond('\n')
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .unlink(syncanoYmlPath)
      .end(done)
  })
})
