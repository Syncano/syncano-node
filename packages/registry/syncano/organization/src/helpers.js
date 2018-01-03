import {data} from 'syncano-server'
import {authUser} from '../../helpers/auth'

export const getOrg = function () {
  return data.organization
    .where('name', 'eq', ARGS.name)  // eslint-disable-line no-undef
    .first()
}

export const findOrganization = function () {
  return new Promise((resolve, reject) => {
    data.organization
      .where('name', 'eq', ARGS.organization_name)  // eslint-disable-line no-undef
      .firstOrFail()
      .then(organization => resolve(organization))
      .catch(err => {
        reject(new Error('Organization doesn\'t exist!'))
      })
  })
}

export const isOrgUniq = function () {
  return new Promise((resolve, reject) => {
    getOrg()
      .then(orgaznization => {
        if (orgaznization) {
          reject(new Error('Organization with that name already exist!'))
        } else {
          resolve(true)
        }
      })
  })
}

export const checkOrgOwnership = function () {
  return new Promise((resolve, reject) => {
    Promise.all([authUser(), findOrganization()])
      .then(data => {
        const [user, organization] = data
        if (user.id === organization.owner_account) {
          return resolve([user, organization])
        }
        return reject(new Error('You are not the owner of this organization!'))
      })
      .catch(err => {
        reject(err)
      })
  })
}
