import fs from 'fs-extra'
import path from 'path'
import utils from '../../../utils/test-utils'
import {
  nixt,
  cleanUpAccount,
  cliLocation,
  createInstance,
  setupLocation,
  shutdownLocation
} from '../../utils'

const { email, password, syncanoYmlPath } = utils.returnTestGlobals()
process.env.SYNCANO_ENV = 'test'

process.env.OPENWEATHERMAP_APP_ID = 'test'
process.env['MESSENGER-BOT_FACEBOOK_APP_TOKEN'] = 'test'

// Tests
describe('Building Facebook Weather Bot', function () {
  // let instaceName = null;
  let tutorialLocation = null
  before(function () {
    tutorialLocation = setupLocation('tutorial-wather-bot')
    return createInstance()
      .then((resp) => {
        // instaceName = resp.name;
      })
  })
  after(function () {
    shutdownLocation(tutorialLocation)
    return cleanUpAccount()
    // return deleteInstance(instaceName);
  })

  it('init project', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} init`)
      .on(/Your e-mail/)
      .respond(`${email}\n`)
      .on(/Password/)
      .respond(`${password}\n`)
      .on(/Hello World template/)
      // Choose from dropdown default project template: hello
      .respond('\n')
      .stdout(/Creating Syncano Instance/)
      .stdout(/Project has been created from/)
      .match(syncanoYmlPath, /auth_key/)
      .match(syncanoYmlPath, /instance/)
      .end(done)
  })

  it('search for openweathermap Socket', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} search openweathermap`)
      .stdout(/openweathermap/)
      .code(0)
      .end(done)
  })

  it('add openweathermap Socket', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} add openweathermap`)
      .code(0)
      .end(done)
  })

  it('search for messenger-bot Socket', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} search messenger-bot`)
      .stdout(/messenger-bot/)
      .code(0)
      .end(done)
  })

  it('add messenger-bot Socket', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} add messenger-bot`)
      .code(0)
      .end(done)
  })

  it('add responder socket', function (done) {
    fs.copySync(path.join(__dirname, 'assets/weather-bot/responder'), path.join(tutorialLocation, 'syncano', 'responder'))

    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} deploy responder`)
      .code(0)
      .end(done)
  })

  it('list sockets', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} list`)
      .stdout(/socket: responder/)
      .code(0)
      .end(done)
  })
})
