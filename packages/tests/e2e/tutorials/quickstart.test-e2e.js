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

// Tests
describe('Quickstart', function () {
  let instaceName = null
  let tutorialLocation = null
  before(function () {
    tutorialLocation = setupLocation('tutorial-quickstart')
    return createInstance()
      .then((resp) => {
        instaceName = resp.name
      })
  })
  after(function () {
    shutdownLocation(tutorialLocation)
    return cleanUpAccount()
    // return deleteInstance(instaceName);
  })

  it('clone github repo', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`git clone https://github.com/Syncano-Community/chat-app.git ${tutorialLocation}`)
      .code(0)
      .end(done)
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

  it('search for chat Socket', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} search chat`)
      .stdout(/Realtime Chat Socket/)
      .code(0)
      .end(done)
  })

  it('add chat Socket', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} add chat`)
      .code(0)
      .end(done)
  })

  it('add hosting', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} hosting add ./web`)
      .on(/name \(staging\)/)
      .respond('\n')
      .on(/CNAME/)
      .respond('\n')
      .code(0)
      .end(done)
  })

  it('configure instance name', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`sed -i -e 's/INSTANCE_NAME/${instaceName}/g' ./web/index.html`)
      .code(0)
      .end(done)
  })

  it('sync files', function (done) {
    nixt()
      .cwd(tutorialLocation)
      .run(`${cliLocation} hosting sync staging`)
      .end(done)
  })
})
