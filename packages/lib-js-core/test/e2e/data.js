/* global it describe before after beforeEach afterEach */
import fs from 'fs'
import {join} from 'path'
import FormData from 'form-data'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Server from '../../src'
import {NotFoundError} from '../../src/errors'
import {getRandomString, createTestInstance, deleteTestInstance} from '../utils'

chai.use(chaiAsPromised)
chai.should()

describe('Data', function () {
  let data
  let users
  let run
  let field_string = getRandomString() // eslint-disable-line camelcase
  let field_integer = 182 // eslint-disable-line camelcase
  const testClassName = getRandomString()
  const instanceName = getRandomString()

  before(function () {
    const server = new Server({
      instanceName,
      meta: {
        api_host: process.env.SYNCANO_HOST,
        socket: 'test-socket',
        token: process.env.E2E_ACCOUNT_KEY
      }
    })

    data = server.data
    users = server.users

    return createTestInstance(instanceName).then(() =>
      server._class.create({name: testClassName, schema: getSchema()})
    )
  })

  beforeEach(() => {
    run = () => data[testClassName]
  })

  after(() => deleteTestInstance(instanceName))

  afterEach(() => run().delete())

  describe('#create()', () => {
    it('can create single object', () =>
      run()
        .create({field_string, field_integer})
        .should.eventually.include({field_string, field_integer}))

    it('can create multiple objects', () =>
      run()
        .create([
          {field_string: 'String 1', field_number: 100},
          {field_string: 'String 2', field_number: 200},
          {field_string: 'String 3', field_number: 300}
        ])
        .should.eventually.have.nested.property('2.field_string', 'String 3'))

    it('can create object with file field', () => {
      const form = new FormData()

      form.append(
        'field_file',
        fs.createReadStream(join(__dirname, '/assets/test.jpg'))
      )

      return run()
        .create(form)
        .should.eventually.have.nested.property('field_file')
        .match(/^https/)
    })

    it('should be able to create object from FormData', () => {
      const record = new FormData()

      record.append('field_integer', 987)

      return run()
        .create(record)
        .should.eventually.have.deep.property('field_integer', 987)
    })
  })

  describe('#delete()', () => {
    it('can delete single object', async () => {
      const obj = await run().create({field_string: 'test1'})
      // TODO why undefined here? while in next tests we have ids?
      run().delete(obj.id).should.become(undefined)
    })

    it('can delete multiple objects', async () => {
      const obj1 = await run().create({field_string: 'test1'})
      const obj2 = await run().create({field_string: 'test1'})
      await run().delete([obj1.id, obj2.id]).should.become([obj1.id, obj2.id])
      await run().list().should.become([])
    })

    it('can delete multiple objects by query', async () => {
      const obj1 = await run().create({field_string: 'test1'})
      await run().create({field_string: 'test2'})
      await run().create({field_string: 'test3'})

      run()
        .where('id', 'lte', obj1.id)
        .delete()
        // TODO: should we really respond here with the deleted objects?
        .should.become([obj1.id])
    })
  })

  describe('#count()', () => {
    it('should be able to get number of records', async () => {
      const records = '.'
        .repeat(120)
        .split('.')
        .map((a, i) => ({
          field_string: `item ${i}`
        }))
      await run().create(records)

      run().count().should.eventually.equal(121)
    })
  })

  describe('#fields()', () => {
    it('should be able to whitelist fields', async () => {
      await run().create({'field_integer': 182})

      run()
        .fields('field_integer')
        .first()
        .should.become({field_integer: 182})
    })

    it('should be able to map field names', async () => {
      const username = getRandomString()
      const user = await users.create({username, password: 'test'})
      const obj = await run().create({author: user.id})

      run()
        .with('author')
        .fields('id', 'author.username as name')
        .find(obj.id)
        .should.become({id: obj.id, name: username})
    })

    it('should handle list of records', async () => {
      await run().create({field_string: 'test1'})
      await run().create({field_string: 'test2'})
      await run().create({field_string: 'test3'})

      await run()
        .fields(['field_string'])
        .take(2)
        .list()
        .should.become([
          {field_string: 'test1'},
          {field_string: 'test2'}
        ])
    })

    it('should work with create method', () =>
      run()
        .fields('field_string')
        .create({
          field_string: 'test create method'
        })
        .should.become({field_string: 'test create method'}))

    it('should work with batch create', () =>
      run()
        .fields('field_string')
        .create([
          {field_string: 'test batch create method 1'},
          {field_string: 'test batch create method 2'}
        ])
        .should.become([
          {field_string: 'test batch create method 1'},
          {field_string: 'test batch create method 2'}
        ]))

    it('should work with update method', async () => {
      await run().create({field_string: 'test3'})
      const id = await run().value('id')

      run()
        .fields('field_string')
        .update(id, {
          field_string: 'test create method'
        })
        .should.become({field_string: 'test create method'})
    })

    it('should work with batch update', async () => {
      await run().create({field_string: 'test1'})
      await run().create({field_string: 'test2'})
      const ids = await run().take(2).pluck('id')

      run()
        .fields('field_string')
        .update([
          [ids[0], {field_string: 'test batch update method 1'}],
          [ids[1], {field_string: 'test batch update method 2'}]
        ])
        .should.become([
          {field_string: 'test batch update method 1'},
          {field_string: 'test batch update method 2'}
        ])
    })
  })

  describe('#take()', () => {
    it('should limit number of results', async () => {
      // Adding 3 objects to set limit of listing 2
      await run().create({field_string: 'example-string'})
      await run().create({field_string: 'example-string'})
      await run().create({field_string: 'example-string'})

      await run()
        .take(2)
        .list()
        .should.eventually.be.an('array')
        .of.length(2)
    })
  })

  describe('#with()', () => {
    it('should expand reference with object', () =>
      users
        .create({username: 'John', password: 'test'})
        .then(user =>
          run().create({field_string: 'with author', author: user.id})
        )
        .then(field => {
          run()
            .with('author')
            .find(field.id)
            .should.eventually.have.nested.property('author.username', 'john')
        }))

    it('should expand reference with object after update', async () => {
      const username = getRandomString()
      const user = await users.create({username, password: 'test'})
      const obj = await run()
        .with('author')
        .create({field_string: 'with author', author: user.id})

      await run()
        .with('author')
        .update(obj.id, {field_string: 'with author'})
        .should.eventually.have.nested.property('author.username', username)
    })

    it('should expand reference with object after create', async () => {
      const username = getRandomString()
      const user = await users.create({username, password: 'test'})

      await run()
        .with('author')
        .create({field_string: 'with author', author: user.id})
        .should.eventually.have.nested.property('author.username', username)
    })

    it('should expand relation with array of objects', async () => {
      const usersList = await users
        .create([
          {username: 'lou', password: 'test'},
          {username: 'jane', password: 'test'}
        ])

      const editorObj = await run().create({
        editors: usersList.map(u => u.id)
      })

      const withEditors = await run()
        .with('editors')
        .find(editorObj.id)

      withEditors.should.have.nested.property(
          'editors.1.username',
          'jane'
        )
    })

    it('should throw error when expanded field has no target', async () => {
      await run().create({field_string: 'example-string1'})

      run()
        .with('created_at')
        .list()
        .should.be.rejectedWith(Error)
    })
  })

  describe('#pluck()', () => {
    it('should be able to take column values', async () => {
      await run().create({field_string: 'example-string1'})
      await run().create({field_string: 'example-string2'})
      await run().create({field_string: 'example-string3'})

      run()
        .take(3)
        .pluck('field_string')
        .should.become(['example-string1', 'example-string2', 'example-string3'])
    })
  })

  describe('#value()', () => {
    it('should be able to take column value of single record', async () => {
      await run().create({field_string: 'example-string1'})

      run()
        .value('field_string')
        .should.become('example-string1')
    })
  })

  describe('#first()', () => {
    it('can fetch single object', async () => {
      await run().create({field_string: 'example-string'})
      run()
        .where('field_string', 'example-string')
        .first()
        .should.eventually.have.property('field_string', 'example-string')
    })

    it('returns null when object was not found', async () => {
      await run().create({field_string: 'example-string'})

      run()
        .where('field_string', 'lorem-ipsum')
        .first()
        .should.eventually.equal(null)
    })
  })

  describe('#firstOrFail()', () => {
    it('should be able to fetch single object', async () => {
      await run().create({field_string: 'example-string'})

      run()
        .firstOrFail()
        .should.eventually.have.property('field_string', 'example-string')
    })

    it('should throw error when object was not found', () =>
      run()
        .where('field_string', '000111ddd')
        .firstOrFail()
        .should.be.rejectedWith(NotFoundError))
  })

  describe('#firstOrCreate()', () => {
    it('should be able to fetch single existing object', async () => {
      const obj = await run().create({field_string: 'example-string'})

      run()
        .firstOrCreate({field_string: 'example-string'}, {field_integer: 999})
        .should.eventually.deep.include({field_string: 'example-string', id: obj.id})
    })

    it('should create and return object when it was not found', () =>
      run()
        .firstOrCreate(
          {field_string, field_integer: 999, field_text: 'test-text'}
        )
        .should.eventually.deep.include({
          field_string,
          field_integer: 999,
          field_text: 'test-text'
        }))
  })

  describe('#updateOrCreate()', () => {
    it('should be able to update existing object', () =>
      run()
        .updateOrCreate({id: 5}, {field_string: 'John'})
        .should.eventually.have.property('field_string', 'John'))

    it('should create object when it was not found', () =>
      run()
        .updateOrCreate({field_string: 'example-string'}, {field_integer: 242})
        .should.eventually.deep.include({
          field_string: 'example-string',
          field_integer: 242
        }))
  })

  describe('#find()', () => {
    it('should be able to fetch single object', async () => {
      const fieldString = getRandomString()
      const fieldInteger = Math.floor(Math.random() * 100)

      const object = await run().create({
        field_string: fieldString,
        field_integer: fieldInteger
      })

      run().find(object.id).should.eventually.deep.include({
        field_string: fieldString,
        field_integer: fieldInteger
      })
    })

    it('should be able to fetch objects list', async () => {
      const fieldString = getRandomString()
      const firstObject = await run().create({field_string: fieldString})
      const secondObject = await run().create({field_string: fieldString})

      run()
        .fields('field_string', 'id')
        .find([firstObject.id, secondObject.id])
        .should.become([
          {field_string: fieldString, id: firstObject.id},
          {field_string: fieldString, id: secondObject.id}
        ])
    })

    it('should return null when object was not found', () =>
      run().find(1000).should.become(null))

    it('should return [] when no objects were found', () =>
      run().find([1000, 1001]).should.become([]))
  })

  describe('#findOrFail()', () => {
    it('should be able to fetch single object', async () => {
      const firstObject = await run().create({field_string: 'example-string'})
      run()
        .findOrFail(firstObject.id)
        .should.eventually.have.property('field_string', 'example-string')
    })

    it('should be able to fetch objects list', async () => {
      const firstObject = await run().create({field_string: 'example-string'})
      const secondObject = await run().create({field_string: 'example-string'})

      await run()
        .fields('field_string', 'id')
        .findOrFail([firstObject.id, secondObject.id])
        .should.become([
          {field_string: 'example-string', id: firstObject.id},
          {field_string: 'example-string', id: secondObject.id}
        ])
    })

    it('should throw error when object was not found', () =>
      run()
        .where('field_string', 'asdasd')
        .findOrFail(1001)
        .should.be.rejectedWith(NotFoundError))
  })

  describe('#where()', () => {
    it('should be able to filter by column', async () => {
      await run().create({field_string: 'example-string'})

      run()
        .where('field_string', 'example-string')
        .list()
        .should.eventually.be.an('array')
        .of.length(1)
    })

    it('should handle array of filters', async () => {
      await run().create({field_string: 'example-string'})
      await run().create({
        field_string: 'example-string',
        field_integer: 120
      })

      run()
        .where([
          ['field_string', '=', 'example-string'],
          ['field_integer', '>=', 100]
        ])
        .list()
        .should.eventually.be.an('array')
        .of.length(1)
    })

    it('should handle null as second parameter', async () => {
      await run().create({field_string: 'example-string'})

      run()
        .where('author', null)
        .first()
        .should.eventually.include({author: null})
    })

    it.skip('should throw error when trying to filter by non index column', () => {})
  })

  describe('#orWhere()', () => {
    it('should be able use 2 or more filters', async () => {
      const user = await users.create({username: 'test', password: 'test'})
      await run().create({author: user.id})
      await run().create({field_integer: 130})

      run()
        .where('author', user.id)
        .orWhere('field_integer', 130)
        .list()
        .should.eventually.be.an('array')
        .of.length(2)
    })
  })

  describe('#whereNull()', () => {
    it('should be able to filter columns with value of null', async () => {
      await run().create({'field_string': 'test'})

      run()
        .whereNull('author')
        .pluck('author')
        .should.become([null])
    })
  })

  describe('#whereNotNull()', () => {
    it('should be able to filter records where column value is not null', async () => {
      await run().create({'field_string': 'test'})

      run()
        .whereNotNull('field_string')
        .pluck('field_string')
        .should.become(['test'])
    })
  })

  describe('#whereIn()', () => {
    it('should be able to filter using `in` operator', async () => {
      await run().create({'field_integer': 242})

      run()
        .whereIn('field_integer', [242])
        .first()
        .should.eventually.include({field_integer: 242})
    })
  })

  describe('#whereNotIn()', () => {
    it('should be able to filter using `nin` operator', async () => {
      await run().create({'field_integer': 241})
      await run().create({'field_integer': 242})
      await run().create({'field_integer': 243})

      run()
        .whereNotIn('field_integer', [241])
        .list()
        .should.eventually.be.an('array')
        .of.length(2)
    })
  })

  describe('#whereBetween()', () => {
    it('should be able to filter results using gte and lte', async () => {
      await run().create({'field_integer': 242})
      await run().create({'field_integer': 243})

      run()
        .whereBetween('field_integer', 200, 250)
        .first()
        .should.eventually.include({field_integer: 242})
    })
  })

  describe('#update()', () => {
    it('can update single object', async () => {
      const obj = await run().create({field_string: 'test1'})
      const input = {field_text: 'Updated', field_integer: 2}

      return run().update(obj.id, input).should.eventually.include(input)
    })

    it('can update multiple objects', async () => {
      const obj1 = await run().create({field_string: 'test1'})
      const obj2 = await run().create({field_string: 'test2'})

      await run()
        .update([
          [obj1.id, {field_text: 'Updated 1', field_integer: 20}],
          [obj2.id, {field_text: 'Updated 2', field_integer: 30}]
        ])
        .should.eventually.be.an('array')
        .of.length(2)
    })

    it('can update multiple objects by query', async () => {
      const obj1 = await run().create({field_string: 'test1'})
      await run().create({field_string: 'test2'})
      await run().create({field_string: 'test3'})

      await run()
        .where('id', 'gte', obj1.id)
        .update({field_text: 'Query update'})
        .should.eventually.be.an('array')
        .of.length(3)
    })

    it('should be able to create object from FormData', async () => {
      const obj = await run().create({field_string: 'test1'})
      const record = new FormData()

      record.append('field_string', 'abde')

      return run()
        .update(obj.id, record)
        .should.eventually.have.property('field_string', 'abde')
    })

    it('should be able to update object file field', async () => {
      const obj = await run().create({field_string: 'test1'})
      const form = new FormData()

      form.append(
        'field_file',
        fs.createReadStream(join(__dirname, '/assets/test.jpg'))
      )

      return run()
        .update(obj.id, form)
        .should.eventually.have.nested.property('field_file')
        .match(/^https/)
    })

    it('should be able to update object reference field', async () => {
      const user = await users.create({username: getRandomString(), password: 'test'})
      const obj = await run().create({field_string: 'test1'})

      run()
        .update(obj.id, {author: user.id})
        .should.eventually.have.nested.property('author', user.id)
    })
  })

  describe('#list()', () => {
    it('should be able to fetch objects list', async () => {
      await run().create({field_string: 'test1'})

      run()
        .list()
        .should.eventually.be.an('array')
        .that.have.nested.property('0.field_string', 'test1')
    })

    it('should return [] when no objects were not found', async () => {
      await run().create({field_string: 'test1'})

      run()
        .where('field_string', 'test2')
        .list()
        .should.eventually.be.an('array')
        .of.length(0)
    })

    it('should resolve custom types', async () => {
      await run().create({field_string: 'test1'})

      run()
        .list()
        .should.eventually.have.nested.property('0.created_at')
        .to.be.an('string')
    })

    it('should load next page', async () => {
      const records = '.'
        .repeat(120)
        .split('.')
        .map((a, i) => ({
          field_string: `item ${i}`
        }))
      await run().create(records)

      await run()
        .list()
        .should.eventually.be.an('array')
        .of.length.above(120)
    })
  })

  describe('#orderBy()', () => {
    it('can sort records ascending', async () => {
      await run().create({field_string: 'abcdef'})
      await run().create({field_string: 'cdefgh'})
      await run().create({field_string: 'bcdefg'})

      await run()
        .orderBy('field_string')
        .fields('field_string')
        .list()
        .should.eventually.be.an('array')
        .that.have.deep.ordered.members([
          {field_string: 'abcdef'},
          {field_string: 'bcdefg'},
          {field_string: 'cdefgh'}
        ])
    })

    it('can sort records descending', async () => {
      await run().create({field_string: 'abcdef'})
      await run().create({field_string: 'cdefgh'})
      await run().create({field_string: 'bcdefg'})

      run()
        .orderBy('field_string', 'desc')
        .fields('field_string')
        .list()
        .should.eventually.be.an('array')
        .that.have.deep.ordered.members([
          {field_string: 'cdefgh'},
          {field_string: 'bcdefg'},
          {field_string: 'abcdef'}
        ])
    })
  })
})

function getSchema () {
  return [
    {
      type: 'string',
      name: 'field_string',
      filter_index: true,
      order_index: true
    },
    {type: 'reference', name: 'author', target: 'user', filter_index: true},
    {type: 'relation', name: 'editors', target: 'user'},
    {type: 'text', name: 'field_text'},
    {type: 'integer', name: 'field_integer', filter_index: true},
    {type: 'float', name: 'field_float'},
    {type: 'array', name: 'field_array'},
    {type: 'file', name: 'field_file'}
  ]
}
