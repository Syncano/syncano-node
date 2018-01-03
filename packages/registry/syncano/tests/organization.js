import faker from 'faker'
import _ from 'lodash'
import {expect} from 'chai';
import {s, account} from './utils'

describe('Organization', function() {
  let firstAccountObj = {}
  let secondAccountObj = {}
  let firstUserOrgName = faker.company.companyName()
  let secondUserOrgName = faker.company.companyName()
  const orgDescription = faker.lorem.sentence()

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

  it('create', function(done) {
    const params = {
      name: firstUserOrgName,
      description: orgDescription
    }
    s('organization/add', params)
      .then(res => res.json())
      .then(organization => {
        expect(organization.name).to.be.equal(firstUserOrgName)
        expect(organization.id).to.be.an('number')
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('get', function(done) {
    const params = {
      name: firstUserOrgName,
    }
    s('organization/get', params)
      .then(res => {
        expect(res.status).to.be.equal(200)
        return res.json()
      })
      .then(organization => {
        expect(organization.name).to.be.equal(firstUserOrgName)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('update data', function(done) {
    const params = {
      organization_name: firstUserOrgName,
      description: 'New description!'
    }
    s('organization/update', params)
      .then(res => res.json())
      .then(organization => {
        expect(organization.description).to.be.equal(params.description)
        done()
      })
      .catch(err => {
        done(err)
      });
  })


  it('check owner', function(done) {
    const params = {
      name: firstUserOrgName,
    }

    s('organization/get', params)
      .then(res => res.json())
      .then(organization => {
        expect(organization.owner_account).to.be.equal(firstAccountObj.id)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('add with not unique name', function(done) {
    const params = {
      name: firstUserOrgName,
    }
    s('organization/add', params)
      .then(resp => {
        expect(resp.status).to.be.equal(400)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('invite member', function(done) {
    const params = {
      organization_name: firstUserOrgName,
      member_email: process.env.E2E_USER_EMAIL_2
    }
    s('organization/invite_member', params)
      .then(resp => {
        expect(resp.status).to.be.equal(202)
        done()
      })
  })

  it('invite member organization you don\'t own', function(done) {
    const params = {
      organization_name: secondUserOrgName,
      member_email: process.env.E2E_USER_EMAIL_2
    }
    s('organization/invite_member', params)
      .then(resp => {
        expect(resp.status).to.be.equal(400)
        done()
      })
  })

  it('delete', function(done) {
    const params = {
      name: firstUserOrgName,
    }
    s('organization/delete', params)
      .then(res => {
        expect(res.status).to.be.equal(202)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  it('delete not existent', function(done) {
    const params = {
      name: 'Organization which doesn\'t exist',
    }
    s('organization/delete', params)
      .then(res => {
        expect(res.status).to.be.equal(404)
        done()
      })
      .catch(err => {
        done(err)
      });
  })

  // it('add member to organization', function(done) {
  //   const params = {
  //     member_name: secondAccountObj.username
  //   }
  //   s('organization/add_member/', params)
  // })
  //
  // it('remove member from organization', function(done) {
  //   const params = {
  //     member_name: secondAccountObj.username
  //   }
  //   s('organization/remove_member/', params)
  // })
  //
  // it('delete organization with public sockets', function(done) {
  //   const params = {
  //     member_name: secondAccountObj.username
  //   }
  //   s('organization/delete/', params, )
  // })
  //
  // it('delete organization with public sockets', function(done) {
  //   const params = {
  //     member_name: secondAccountObj.username
  //   }
  //   s('organization/delete/', params, )
  // })
  //
  // it('delete organization without public sockets', function(done) {
  //   const params = {
  //     member_name: secondAccountObj.username
  //   }
  //   s('organization/delete/', params, )
  // })


})

// describe('Registry', function() {
//
//   const socket = {
//     // Fake this
//     name: 'Umbrella Inc.',
//     description: 'Some description',
//     version: '1.0.1',
//     url: 'http://my_socket.io',
//     keywords: [
//       'facebook',
//       'social media'
//     ],
//     private: true
//   }
//
//   it('creates socket', function(done) {
//       s('organization/create', socket)
//         .than(resp => {
//           done()
//         })
//   })
//
//   it('creates socket once again', function(done) {
//       s('organization/create', socket)
//         .catch(resp => {
//           done()
//         })
//   })
//
//   it('creates new version of the socket', function(done) {
//       socket.version = '1.0.2'
//       s('organization/create', socket)
//         .than(resp => {
//           done()
//         })
//   })
//
// });
