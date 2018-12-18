/* global it describe beforeEach */
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as nock from 'nock'
import * as should from 'should'
import {HostingClass} from '../../src/hosting'
import Server from '../../src/server'

chai.use(chaiAsPromised)
chai.should()

describe('Hosting', () => {
  const testUrl = `https://${process.env.SYNCANO_HOST || 'api.syncano.io'}`
  const instanceName = 'testInstance'
  const hostingId = 'testHosting'
  let hosting: HostingClass
  let api: nock.Scope

  beforeEach(() => {
    const server = new Server({
      token: 'testKey',
      instanceName
    })
    hosting = server.hosting
    api = nock(testUrl)
  })

  describe('#listFiles', () => {
    it('should be a method of the model', () => {
      should(hosting)
        .have.property('listFiles')
        .which.is.Function()
    })

    it('should be able to fetch objects list', async () => {
      const objects = [...Array(302).keys()].map((key) => {
        return {path: 'filepath.txt', id: key}
      })
      const first100 = objects.slice(0, 100)
      const first100last = (first100.slice(-1).pop() as any).id
      const second100 = objects.slice(100, 200)
      const second100last = (second100.slice(-1).pop() as any).id
      const third100 = objects.slice(200, 300)
      const third100last = (third100.slice(-1).pop() as any).id
      const fourth100 = objects.slice(300, 302)

      api
        .get(`/v2/instances/${instanceName}/hosting/${hostingId}/files/`)
        .reply(200, {
          objects: first100,
          next: `/v2/instances/${instanceName}/hosting/${hostingId}/files/?direction=1&last_pk=${first100last}`
        })
        .get(`/v2/instances/${instanceName}/hosting/${hostingId}/files/`)
        .query({direction: 1, last_pk: first100last})
        .reply(200, {
          objects: second100,
          next: `/v2/instances/${instanceName}/hosting/${hostingId}/files/?direction=1&last_pk=${second100last}`
        })
        .get(`/v2/instances/${instanceName}/hosting/${hostingId}/files/`)
        .query({direction: 1, last_pk: second100last})
        .reply(200, {
          objects: third100,
          next: `/v2/instances/${instanceName}/hosting/${hostingId}/files/?direction=1&last_pk=${third100last}`
        })
        .get(`/v2/instances/${instanceName}/hosting/${hostingId}/files/`)
        .query({direction: 1, last_pk: third100last})
        .reply(200, {
          objects: fourth100,
          next: null
        })

      const items = await hosting.listFiles(hostingId)

      should(items)
        .be.Array()
        .length(302)
      should(items)
        .have.propertyByPath('0', 'path')
        .which.is.String()
      should(items)
        .have.propertyByPath('0', 'id')
        .which.is.Number()

    })

    it('should return [] when no objects were found', () => {
      api
        .get(`/v2/instances/${instanceName}/hosting/${hostingId}/files/`)
        .reply(200, {objects: [], next: null})
      return hosting
        .listFiles(hostingId)
        .then((objects) => {
          should(objects)
            .be.Array()
            .empty()
        })
    })
  })
})
