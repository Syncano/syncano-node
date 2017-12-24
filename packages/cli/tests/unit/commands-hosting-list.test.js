/* global it describe afterEach beforeEach */
import sinon from 'sinon'
import sinonTestFactory from 'sinon-test'
import format from 'chalk'
import inquirer from 'inquirer'

import { getRandomString } from '@syncano/test-tools'

import { HostingList } from '../../src/commands'
import printTools from '../../src/utils/print-tools'
import context from '../../src/utils/context'

sinon.test = sinonTestFactory(sinon)

describe('[commands] List Hosting', function () {
  const hostingList = new HostingList(context)
  const hostingName = getRandomString('listHosting_hostingName')
  let interEcho = null
  let error = null
  let warning = null

  beforeEach(function () {
    interEcho = sinon.stub()
    error = sinon.stub(printTools, 'error')
    warning = sinon.stub(printTools, 'warning')
    sinon.stub(printTools, 'echo').callsFake((content) => interEcho)
  })

  afterEach(function () {
    interEcho.reset()
    printTools.error.restore()
    printTools.warning.restore()
    printTools.echo.restore()
  })

  describe('run', function () {
    let processExit = null
    let prompt = null
    let listHostings = null
    let socketInstance = null
    const socket = {
      listHostings: () => 'Hosting listed'
    }

    beforeEach(async function () {
      processExit = sinon.stub(process, 'exit')
      prompt = sinon.stub(inquirer, 'prompt')
      sinon.stub(hostingList.Socket, 'get').returns(socket)
      socketInstance = await hostingList.Socket.get()
      listHostings = sinon.stub(socketInstance, 'listHostings').returns(Promise.resolve())
    })

    afterEach(function () {
      process.exit.restore()
      inquirer.prompt.restore()
      hostingList.Socket.get.restore()
      socketInstance.listHostings.restore()
    })

    describe('if not specified socket in command', function () {
      let listLocal = null

      beforeEach(function () {
        listLocal = sinon.stub(hostingList.Socket, 'listLocal')
      })

      afterEach(function () {
        hostingList.Socket.listLocal.restore()
      })

      it.skip('should print warning and exit process if no local hostings specified', async function () {
        listLocal.returns([])

        await hostingList.run([{}])

        sinon.assert.calledWith(warning, 'No Sockets were found in your config.')
      })

      it.skip('should ask prompt with 1 question', async function () {
        const localSockets = [getRandomString('listHosting_localSockets')]
        const question = {
          name: 'Socket',
          type: 'list',
          message: 'Choose socket for which you you want to list hostings',
          choices: localSockets,
          default: 0
        }

        listLocal.returns(localSockets)

        await hostingList.run([{}])

        sinon.assert.calledWith(prompt, [question])
      })
    })

    it.skip('should ask prompt with 0 questions', async function () {
      await hostingList.run([{ socket: getRandomString('listHosting_socket[0]') }])

      sinon.assert.calledWith(prompt, [])
    })

    it.skip('should call socket listHostings method', async function () {
      await hostingList.run([{ socket: getRandomString('listHosting_socket[1]') }])

      sinon.assert.calledOnce(listHostings)
    })

    it.skip('should print no hostings info and exit process if no hostings specified', async function () {
      const printNoHostingsInfo = sinon.stub(HostingList, 'printNoHostingsInfo')
      listHostings.returns(Promise.resolve([]))

      await hostingList.run([{ socket: getRandomString('listHosting_socket[2]') }])

      HostingList.printNoHostingsInfo.restore()

      sinon.assert.calledOnce(printNoHostingsInfo)
      sinon.assert.calledOnce(processExit)
    })

    it.skip('should call printHostings method with proper parameter if some hostings specified', async function () {
      const hostings = [getRandomString('listHosting_hostings[0]'), getRandomString('listHosting_hostings[1]')]
      listHostings.returns(Promise.resolve(hostings))
      const printHostings = sinon.stub(HostingList, 'printHostings')

      await hostingList.run([{ socket: getRandomString('listHosting_socket[3]') }])

      HostingList.printHostings.restore()

      sinon.assert.calledWith(printHostings, hostings)
    })

    it.skip('should print error if listHostings method rejected', async function () {
      const errorMessage = getRandomString('listHosting_errorMessage')
      listHostings.returns(Promise.reject(errorMessage))

      await hostingList.run([{ socket: getRandomString('listHosting_socket[4]') }])

      sinon.assert.calledWith(error, errorMessage)
    })
  })

  describe('printNoHostingsInfo', function () {
    it('should print proper responses', function () {
      HostingList.printNoHostingsInfo()

      sinon.assert.calledWith(interEcho, `Type ${format.cyan('syncano-cli hosting add')} to add hosting for your app!`)
    })
  })

  describe('printHostings', function () {
    it.skip('should print proper responses', function () {
      HostingList.printHostings()

      sinon.assert.calledWith(interEcho, 'Your hostings:')
    })

    it('should printHosting method for each hosting', sinon.test(function () {
      const hostings = [
        {
          name: getRandomString('listHosting_printHostings_hostings_name[0]')
        },
        {
          name: getRandomString('listHosting_printHostings_hostings_name[1]')
        }
      ]
      const printHosting = this.stub(HostingList, 'printHosting')

      HostingList.printHostings(hostings)

      hostings.forEach((hosting) => {
        sinon.assert.calledWith(printHosting, hosting)
      })
    }))
  })

  describe('printHosting', function () {
    const cnameUrl = getRandomString('listHosting_printHosting_cnameUrl')
    const url = getRandomString('listHosting_printHosting_url')
    const hosting = {
      name: hostingName,
      getURL: () => url
    }

    it.skip('should not print cname if not specified in hosting', function () {
      HostingList.printHosting(hosting)

      sinon.assert.neverCalledWith(interEcho, `${format.dim('cname')}: ${format.cyan(cnameUrl)}`)
    })

    it.skip('should not print url if hosting not exists remotely', function () {
      hosting.existRemotely = false

      HostingList.printHosting(hosting)

      sinon.assert.neverCalledWith(interEcho, `${format.dim('url')}: ${format.cyan(hosting.getURL())}`)
    })

    describe.skip('should print', function () {
      it('name', function () {
        HostingList.printHosting(hosting)

        sinon.assert.calledWith(interEcho, `${format.dim('name')}: ${format.cyan(hosting.name)}`)
      })

      it('url', function () {
        hosting.existRemotely = true

        HostingList.printHosting(hosting)

        sinon.assert.calledWith(interEcho, `${format.dim('url')}: ${format.cyan(hosting.getURL())}`)
      })

      it('cname', function () {
        hosting.getCnameURL = () => cnameUrl

        HostingList.printHosting(hosting)

        sinon.assert.calledWith(interEcho, `${format.dim('cname')}: ${format.cyan(cnameUrl)}`)
      })

      it.skip('synced as check mark if hosting exists remotely', function () {
        hosting.existRemotely = true

        HostingList.printHosting(hosting)

        sinon.assert.calledWith(interEcho, `${format.dim('synced')}: ${format.green('✓')}`)
      })

      it.skip('x mark if hosting not synced', function () {
        hosting.existRemotely = false

        HostingList.printHosting(hosting)

        sinon.assert.calledWith(interEcho, `${format.dim('synced')}: ${format.red('x')}`)
      })

      it.skip('info how to sync hosting if error', function () {
        hosting.error = 404

        HostingList.printHosting(hosting)

        sinon.assert.calledWith(interEcho,
          `Type ${format.green(`syncano-cli hosting sync ${hosting.name}`)} to sync your hosting with server.`)
      })
    })
  })
})
