import _ from 'lodash'
import crypto from 'crypto'
import {assert} from 'chai'
import {run} from 'syncano-test'


describe('check-name', function() {

  let existingCompany = {
    orgNumber: 915642349,
    name: 'Eyedea AS'
  }

  let nonExistingCompany = {
    orgNumber: 12312312311,
    name: 'Eyeeeedea AS'
  }


  it('check name of existing company', function(done) {
    run('check-name', {args: existingCompany})
      .then(response => {
        assert.propertyVal(response.data, 'exist', true)
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })

  it('check name of non-existing company (but starts with the same chars)', function(done) {
    run('check-name', {args: nonExistingCompany})
      .then(response => {
        assert.propertyVal(response.data, 'exist', false)
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })
})


import faker from 'faker'
import semver from 'semver'
import _ from 'lodash'
import {expect} from 'chai';
import {s, account, generateSocket} from './utils'


describe('Registry', function() {
  let firstAccountObj = {}
  let secondAccountObj = {}
  let firstUserOrgName = faker.company.companyName()
  let secondUserOrgName = faker.company.companyName()
  const orgDescription = faker.lorem.sentence()

  const firstSocket = generateSocket()
  const secondSocket = generateSocket()

  before(function (done) {

    Promise.all([
      account.get(process.env.E2E_USER_ACCOUNT_KEY_1),
      account.get(process.env.E2E_USER_ACCOUNT_KEY_2)
    ])
      .then(data => {
        [firstAccountObj, secondAccountObj] = data
        done()
      })
  })

  it('add', function(done) {
    const params = Object.assign({}, firstSocket);
    s('registry/add', params)
      .then(res => {
        expect(res.status).to.be.equal(200)
        return res.json()
      })
      .then(socket => {
        expect(socket.name).to.be.equal(params.name)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('add as different owner, but same socket name', function(done) {
    const params = Object.assign({}, firstSocket);
    s('registry/add', params, process.env.E2E_USER_ACCOUNT_KEY_2)
      .then(resp => {
        expect(resp.status).to.be.equal(400)
        return resp.text()
      })
      .then(text => {
        expect(text).to.be.equal('{"message":"This socket doesn\'t belong to you!"}')
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('add new socket as different owner', function(done) {
    const params = Object.assign({}, secondSocket);
    s('registry/add', params, process.env.E2E_USER_ACCOUNT_KEY_2)
      .then(res => {
        expect(res.status).to.be.equal(200)
        return res.json()
      })
      .then(socket => {
        expect(socket.name).to.be.equal(params.name)
        done()
      })
      .catch(err => {
        done(err)
      });
  })


  it('add with the same version', function(done) {
    const params = Object.assign({}, firstSocket);
    s('registry/add', params)
      .then(resp => {
        expect(resp.status).to.be.equal(400)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('add one more version', function(done) {
    const params = Object.assign({}, firstSocket);
    params.version = semver.inc(params.version, 'patch')
    s('registry/add', params)
      .then(res => {
        expect(res.status).to.be.equal(200)
        return res.json()
      })
      .then(socket => {
        expect(socket.name).to.be.equal(params.name)
        expect(socket.version).to.be.equal(params.version)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('get', function(done) {
    const params = { name: firstSocket.name}
    s('registry/get', params)
      .then(res => {
        expect(res.status).to.be.equal(200)
        return res.json()
      })
      .then(socket => {
        expect(socket.name).to.be.equal(params.name)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('list', function(done) {
    s('registry/list')
      .then(res => {
        expect(res.status).to.be.equal(200)
        return res.json()
      })
      .then(sockets => {
        expect(sockets).to.be.an('array')
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('list only one version of the socket', function(done) {
    s('registry/list')
      .then(res => {
        expect(res.status).to.be.equal(200)
        return res.json()
      })
      .then(sockets => {
        expect(sockets).to.be.an('array')
        expect(_.uniq(sockets).length).to.be.equal(sockets.length)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  // it('add new version', function(done) {
  //   const params = Object.assign({}, firstSocket);
  //   params.version = semver.inc(params.version, 'patch')
  //   s('registry/add', params)
  //     .then(res => {
  //       console.log('XXX', res.data)
  //       expect(res.status).to.be.equal(200)
  //       return res.json()
  //     })
  //     .then(socket => {
  //       expect(socket.name).to.be.equal(params.name)
  //       expect(socket.version).to.be.equal(params.version)
  //       done()
  //     })
  //     .catch(err => {
  //       done(err)
  //     });
  // })


//   it('add socket as an account', function(done) {
//     s('registry/add', socket)
//       .than(resp => {
//         done()
//       })
//   })
//
//   it('add socket as an account (different one)', function(done) {
//     s('registry/add', socket)
//       .than(resp => {
//         done()
//       })
//   })
//
//   it('add socket with existing name', function(done) {
//     s('registry/add', socket)
//       .catch(resp => {
//         done()
//       })
//   })
//
//   it('add socket with the existing version', function(done) {
//     socket.version = '1.0.2'
//     s('registry/add', socket)
//       .than(resp => {
//         done()
//       })
//   })
//
//   it('add socket with the new version', function(done) {
//     socket.version = '1.0.2'
//     s('registry/add', socket)
//       .than(resp => {
//         done()
//       })
//   })
//
//   it('delete socket which doesn\'t belong to account\'s organizations', function(done) {
//     s('registry/delete', socket)
//       .than(resp => {
//         done()
//       })
//   })
//
//   it('delete socket', function(done) {
//     s('registry/delete', socket)
//       .than(resp => {
//         done()
//       })
//   })
//
})
