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

describe('Data', function() {
  let data
  let users
  let run
  let field_string = getRandomString() // eslint-disable-line camelcase
  let field_integer = 182 // eslint-disable-line camelcase
  const testClassName = getRandomString()
  const instanceName = getRandomString()

  before(function() {
    const server = new Server({
      instanceName,
      meta: {
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
    run = data[testClassName]
  })

  after(() => deleteTestInstance(instanceName))

  describe('#create()', () => {
    it('can create single object', () =>
      run
        .create({field_string, field_integer})
        .should.eventually.include({field_string, field_integer}))

    it('can create multiple objects', () =>
      run
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

      return run
        .create(form)
        .should.eventually.have.nested.property('field_file.type', 'file')
    })

    it('should be able to create object from FormData', () => {
      const record = new FormData()

      record.append('field_integer', 987)

      return run
        .create(record)
        .should.eventually.have.deep.property('field_integer', 987)
    })
  })

  describe('#first()', () => {
    it('can fetch single object', () =>
      run
        .where('field_string', field_string)
        .first()
        .should.eventually.have.property('field_string', field_string))

    it('returns null when object was not found', () =>
      run
        .where('field_string', 'lorem-ipsum')
        .first()
        .should.eventually.equal(null))
  })

  describe('#firstOrFail()', () => {
    it('should be able to fetch single object', () =>
      run
        .firstOrFail()
        .should.eventually.have.property('field_string', field_string))

    it('should throw error when object was not found', () =>
      run
        .where('asd', '000111ddd')
        .firstOrFail()
        .should.be.rejectedWith(NotFoundError))
  })

  describe('#firstOrCreate()', () => {
    it('should be able to fetch single existing object', () =>
      run
        .firstOrCreate({field_string}, {field_integer: 999})
        .should.eventually.deep.include({field_string, field_integer, id: 1}))

    it('should create and return object when it was not found', () =>
      run
        .firstOrCreate(
          {field_string, field_integer: 999},
          {field_text: 'test-text'}
        )
        .should.eventually.deep.include({
          field_string,
          field_integer: 999,
          field_text: 'test-text',
          id: 7
        }))
  })

  describe('#updateOrCreate()', () => {
    it('should be able to update existing object', () =>
      run
        .updateOrCreate({id: 5}, {field_string: 'John'})
        .should.eventually.have.property('field_string', 'John'))

    it('should create object when it was not found', () =>
      run
        .updateOrCreate({field_string: 'example-string'}, {field_integer: 242})
        .should.eventually.deep.include({
          id: 8,
          field_string: 'example-string',
          field_integer: 242
        }))
  })

  describe('#find()', () => {
    it('should be able to fetch single object', () =>
      run.find(8).should.eventually.deep.include({
        field_string: 'example-string',
        field_integer: 242
      }))

    it('should be able to fetch objects list', () =>
      run
        .fields('field_string', 'id')
        .find([7, 8])
        .should.become([
          {field_string, id: 7},
          {field_string: 'example-string', id: 8}
        ]))

    it('should return null when object was not found', () =>
      run.find(1000).should.become(null))

    it('should return [] when no objects were found', () =>
      run.find([1000, 1001]).should.become([]))
  })

  describe('#findOrFail()', () => {
    it('should be able to fetch single object', () =>
      run
        .findOrFail(8)
        .should.eventually.have.property('field_string', 'example-string'))

    it('should be able to fetch objects list', () =>
      run
        .fields('field_string', 'id')
        .findOrFail([7, 8])
        .should.become([
          {field_string, id: 7},
          {field_string: 'example-string', id: 8}
        ]))

    it('should throw error when object was not found', () =>
      run
        .where('asd', 'asdasd')
        .findOrFail(1001)
        .should.be.rejectedWith(NotFoundError))
  })

  describe('#take()', () => {
    it('should limit number of results', () =>
      run
        .take(3)
        .list()
        .should.eventually.be.an('array')
        .of.length(3))
  })

  describe('#with()', () => {
    it('should extend reference with object', () =>
      users
        .create({username: 'John', password: 'test'})
        .then(user =>
          run.create({field_string: 'with author', author: user.id})
        )
        .then(field =>
          run
            .with('author')
            .find(field.id)
            .should.eventually.have.nested.property('author.username', 'john')
        ))

    it('should extend relation with array of objects', () =>
      users
        .create([
          {username: 'lou', password: 'test'},
          {username: 'jane', password: 'test'}
        ])
        .then(items =>
          run.create({
            editors: items.map(u => u.id)
          })
        )
        .then(field =>
          run
            .with('editors')
            .find(field.id)
            .should.eventually.have.nested.property(
              'editors.1.username',
              'jane'
            )
        ))

    it('should throw error when extended field has no target', () =>
      run
        .with('created_at')
        .list()
        .should.be.rejectedWith(Error))
  })

  describe('#pluck()', () => {
    it('should be able to take c#olumn values', () =>
      run
        .take(3)
        .pluck('field_string')
        .should.become([field_string, 'String 1', 'String 2'])) // eslint-disable-line camelcase
  })

  describe('#value()', () => {
    it('should be able to take column value of single record', () =>
      run.value('field_string').should.become(field_string))
  })

  describe('#where()', () => {
    it('should be able to filter by column', () =>
      run
        .where('field_string', field_string)
        .list()
        .should.eventually.be.an('array')
        .of.length(2))

    it('should handle array of filters', () =>
      run
        .where([
          ['field_string', '=', field_string], // eslint-disable-line camelcase
          ['field_integer', '>=', 100]
        ])
        .list()
        .should.eventually.be.an('array')
        .of.length(2))

    it('should throw error when trying to filter by non index column', () => {})
  })

  describe('#fields()', () => {
    it('should be able to whitelist fields', () =>
      run
        .fields('field_integer')
        .first()
        .should.become({field_integer: 182}))

    it('should be able to map field names', () =>
      run
        .with('author')
        .fields('id', 'author.username as name')
        .find(10)
        .should.become({id: 10, name: 'john'}))

    it('should be able to whitelist fields passed as array', () =>
      run
        .with('author')
        .fields(['id', 'author.username as name'])
        .find(10)
        .should.become({id: 10, name: 'john'}))

    it('should handle list of records', () =>
      run
        .fields(['field_string'])
        .take(3)
        .list()
        .should.become([
          {field_string},
          {field_string: 'String 1'},
          {field_string: 'String 2'}
        ]))

    it('should work with create method', () =>
      run
        .fields('field_string')
        .create({
          field_string: 'test create method'
        })
        .should.become({field_string: 'test create method'}))

    it('should work with batch create', () =>
      run
        .fields('field_string')
        .create([
          {field_string: 'test batch create method 1'},
          {field_string: 'test batch create method 2'}
        ])
        .should.become([
          {field_string: 'test batch create method 1'},
          {field_string: 'test batch create method 2'}
        ]))

    it('should work with update method', () =>
      run.value('id').then(id =>
        run
          .fields('field_string')
          .update(id, {
            field_string: 'test create method'
          })
          .should.become({field_string: 'test create method'})
      ))

    it('should work with batch update', () =>
      run
        .take(2)
        .pluck('id')
        .then(ids =>
          run
            .fields('field_string')
            .update([
              [ids[0], {field_string: 'test batch update method 1'}],
              [ids[1], {field_string: 'test batch update method 2'}]
            ])
            .should.become([
              {field_string: 'test batch update method 1'},
              {field_string: 'test batch update method 2'}
            ])
        ))
  })

  describe('#update()', () => {
    it('can update single object', () => {
      const input = {field_text: 'Updated', field_integer: 2}

      return run.update(1, input).should.eventually.include(input)
    })

    it('can update multiple objects', () =>
      run
        .update([
          [2, {field_text: 'Updated 1', field_integer: 20}],
          [3, {field_text: 'Updated 2', field_integer: 30}],
          [4, {field_text: 'Updated 3', field_integer: 40}],
          [5, {field_text: 'Updated 4', field_integer: 50}]
        ])
        .should.eventually.have.nested.property('3.field_text', 'Updated 4'))

    it('can update multiple objects by query', () =>
      run
        .where('id', 'gte', 4)
        .update({field_text: 'Query update'})
        .should.eventually.have.nested.property('1.field_text', 'Query update'))

    it('should be able to create object from FormData', () => {
      const record = new FormData()

      record.append('field_string', 'abde')

      return run
        .update(2, record)
        .should.eventually.have.property('field_string', 'abde')
    })
  })

  describe('#list()', () => {
    it('should be able to fetch objects list', () =>
      run
        .list()
        .should.eventually.be.an('array')
        .that.have.nested.property(
          '0.field_string',
          'test batch update method 1'
        ))

    it('should return [] when no objects were not found', () =>
      run
        .where('field_string', 'cant-touch')
        .list()
        .should.eventually.be.an('array')
        .of.length(0))

    it('should resolve custom types', () =>
      run
        .list()
        .should.eventually.have.nested.property('0.created_at')
        .to.be.an('string'))

    it('should load next page', () => {
      const records = '.'
        .repeat(99)
        .split('.')
        .map((a, i) => ({
          field_string: `item ${i}`
        }))

      return run.create(records).then(() =>
        run
          .list()
          .should.eventually.be.an('array')
          .of.length.above(110)
      )
    })
  })

  describe('#delete()', () => {
    it('can delete single object', () => run.delete(1).should.become(undefined))

    it('can delete multiple objects', () =>
      run.delete([2, 3]).should.become([2, 3]))

    it('can delete multiple objects by query', () =>
      run
        .where('id', 'lte', 5)
        .delete()
        .should.become([4, 5]))
  })

  describe('#orderBy()', () => {
    it('can sort records ascending', () =>
      run.delete().then(() =>
        Promise.all([
          run.create({field_string: 'abcdef'}),
          run.create({field_string: 'cdefgh'}),
          run.create({field_string: 'bcdefg'})
        ])
          .then(objects =>
            run
              .orderBy('field_string')
              .fields('field_string')
              .list()
          )
          .should.eventually.be.an('array')
          .that.have.deep.ordered.members([
            {field_string: 'abcdef'},
            {field_string: 'bcdefg'},
            {field_string: 'cdefgh'}
          ])
      ))

    it('can sort records descending', () =>
      run
        .orderBy('field_string', 'desc')
        .fields('field_string')
        .list()
        .should.eventually.be.an('array')
        .that.have.deep.ordered.members([
          {field_string: 'cdefgh'},
          {field_string: 'bcdefg'},
          {field_string: 'abcdef'}
        ]))
  })
})

function getSchema() {
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
