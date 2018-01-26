/* global it describe afterEach beforeEach */
import dirtyChai from 'dirty-chai'
import chai from 'chai'
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import inquirer from 'inquirer'
import prettyBytes from 'pretty-bytes'
import Table from 'cli-table2'

import { getRandomString } from '@syncano/test-tools'

import { HostingFilesCmd } from '../../src/commands'
import printTools from '../../src/utils/print-tools'
import context from '../../src/utils/context'

sinon.test = sinonTestFactory(sinon)

chai.use(dirtyChai)
const { expect } = chai

describe('[commands] Hosting Files', function () {
  let interEcho = null
  let echo = null
  const files = [
    {
      localPath: '/Users/adam/Syncano/foo/web/foo.html',
      path: 'zindex.html',
      size: 9
    },
    {
      localPath: '/Users/adam/Syncano/foo/web/index.html',
      path: 'index.html',
      size: 4,
      id: 4,
      instanceName: 'white-forest-9445',
      checksum: 'd3b07384d113edec49eaa6238ad5ff00',
      isSynced: true
    }]

  const table = new Table({
    head: ['path', { hAlign: 'right', content: 'size' }, { hAlign: 'right', content: 'synced' }],
    colWidths: [40, 30, 10],
    style: { 'padding-left': 4, 'padding-right': 0 },
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ' '
    }
  })

  beforeEach(function () {
    interEcho = sinon.stub()
    echo = sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
  })

  afterEach(function () {
    printTools.echo.restore()
    interEcho.reset()
  })

  describe('run without socket passed in cmd', function () {
    const hostingFilesCmd = new HostingFilesCmd(context)
    const localSockets = [
      getRandomString('hostingFiles_localSockets[0]'),
      getRandomString('hostingFiles_localSockets[1]')
    ]
    const questions = [{
      name: 'Socket',
      type: 'list',
      message: 'Choose a socket which hosting files you want to see',
      choices: localSockets,
      default: 1
    }]
    let socket = null
    let listLocal = null
    let hosting = null
    let prompt = null
    let exitProcess = null
    let warning = null

    beforeEach(async function () {
      sinon.stub(hostingFilesCmd.session, 'load')
      prompt = sinon.stub(inquirer, 'prompt').returns(Promise.resolve({ Socket: 'hello' }))
      listLocal = sinon.stub(hostingFilesCmd.context.Socket, 'listLocal').returns(localSockets)
      sinon.stub(hostingFilesCmd.context.Socket, 'get').returns(Promise.resolve({
        getHosting: (resp) => resp
      }))
      socket = await hostingFilesCmd.context.Socket.get()
      sinon.stub(socket, 'getHosting').returns(Promise.resolve({ listFiles: (res) => res }))
      hosting = await socket.getHosting()
      sinon.stub(hosting, 'listFiles').returns(Promise.resolve({}))
      sinon.stub(HostingFilesCmd, 'fillTable')
      sinon.stub(HostingFilesCmd, 'echoResponse')
      exitProcess = sinon.stub(process, 'exit')
      warning = sinon.stub(printTools, 'warning')
    })

    afterEach(function () {
      inquirer.prompt.restore()
      hostingFilesCmd.session.load.restore()
      hostingFilesCmd.context.Socket.get.restore()
      socket.getHosting.restore()
      hosting.listFiles.restore()
      hostingFilesCmd.context.Socket.listLocal.restore()
      HostingFilesCmd.fillTable.restore()
      HostingFilesCmd.echoResponse.restore()
      process.exit.restore()
      printTools.warning.restore()
    })

    it.skip('should call listLocal method', async function () {
      await hostingFilesCmd.run([getRandomString('hostingFiles_hostingName[0]'), {}])

      sinon.assert.calledOnce(listLocal)
    })

    it.skip('should print warning and exit process if no sockets specified in config', async function () {
      listLocal.returns([])

      await hostingFilesCmd.run([getRandomString('hostingFiles_hostingName[1]'), {}])

      sinon.assert.calledOnce(exitProcess)
      sinon.assert.calledWith(warning, 'No Sockets were found in your config.')
    })

    it.skip('should call prompt method', async function () {
      await hostingFilesCmd.run([getRandomString('hostingFiles_hostingName[2]'), {}])

      sinon.assert.calledOnce(prompt)
      sinon.assert.calledWith(prompt, questions)
    })

    it.skip('should call listFiles method', async function () {
      await hostingFilesCmd.run([getRandomString('hostingFiles_hostingName[3]'), {}])

      sinon.assert.calledOnce(hosting.listFiles)
    })

    it.skip('should call fillTable method', async function () {
      await hostingFilesCmd.run([getRandomString('hostingFiles_hostingName[4]'), {}])

      sinon.assert.calledOnce(HostingFilesCmd.fillTable)
    })

    it.skip('should call echoResponse method', async function () {
      await hostingFilesCmd.run([getRandomString('hostingFiles_hostingName[5]'), {}])

      sinon.assert.calledOnce(HostingFilesCmd.echoResponse)
    })
  })

  describe('fillTable', function () {
    it('should return a filledTable', function () {
      HostingFilesCmd.fillTable(files, table)

      // expect(table).to.be.an.object // eslint-disable-line
      // expect(table[0]).to.be.an.array // eslint-disable-line
      expect(table[0][0]).to.be.equal('zindex.html')
      expect(table.length).to.be.equal(2)
    })
  })

  describe('echoResponse', function () {
    it('should be called with echo', function () {
      HostingFilesCmd.echoResponse('myLittleHosting', table, files, 666)

      expect(echo.callCount).to.be.equal(6)
      sinon.assert.calledWith(echo, 4)
    })

    it('should echo hosting name, files and total size', function () {
      const echoFirstLine = `Hosting ${format.cyan('myLittleHosting')} has ${format.cyan(files.length)} files:`
      const echoLastLine = `You have ${files.length} files, ${format.cyan(prettyBytes(666))} in total.`

      HostingFilesCmd.echoResponse('myLittleHosting', table, files, 666)

      sinon.assert.calledWith(interEcho, echoFirstLine)
      sinon.assert.calledWith(interEcho, echoLastLine)
    })
  })
})
