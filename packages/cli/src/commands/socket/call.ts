import {flags} from '@oclif/command'
import format from 'chalk'
import inquirer from 'inquirer'

import Command, {Socket} from '../../base_command'
import {echon, printCode, printSourceCode} from '../../utils/print-tools'

export default class SocketEndpointCall extends Command {
  static description = 'Execute endpoint'
  static flags = {
    'body-only': flags.boolean()
  }
  static args = [{
    name: 'fullEndpointName',
    required: true,
    description: 'full endpoint name in format: <socket_name>/<endpoint_name>'
  }]

  static validateValue(value) {
    if (!value) {
      return 'We need this!'
    }

    return true
  }

  context: any
  session: any
  Socket: any
  socketList: any
  mainSpinner: any
  cmd: any
  localSockets: any

  promptParamQuestion(params, param) {
    const description = params[param].description || ''
    const paramType = params[param].type
    this.echo(4)(`- ${param} ${format.dim(`(${paramType})`)} ${description}`)
    const question = {
      name: param,
      message: this.p(2)(`Type in value for "${format.green(param)}" parameter`),
      default: params[param].example,
      validate: value => SocketEndpointCall.validateValue(value)
    }
    return question
  }

  formatResponse(res, bodyOnly?) {
    // Callback for the HTTP request response
    const contentType = res.headers['content-type']

    this.echo()
    if (!bodyOnly) {
      this.echo(4)(format.grey('statusCode:'), printCode(res.status))
      this.echo(4)(format.grey('content-type:'), res.headers['content-type'])
      this.echo(4)(format.grey('body:'))
    }

    this.echo()
    this.echo(this.p(bodyOnly ? 0 : 4)(printSourceCode(contentType, res.data)))
    this.echo()
  }

  listParams(endpointObj) {
    const inputs = endpointObj.metadata.inputs
    const params = inputs ? inputs.properties || {} : {}
    const paramsCount = Object.keys(params).length
    const questions = []

    if (!paramsCount) return questions

    this.echo()
    echon(4)(`You can pass ${format.cyan(paramsCount.toString())} `)
    this.echo(`parameter(s) to ${format.cyan(endpointObj.getFullName())} endpoint:`)
    this.echo()

    Object.keys(params).forEach(param => {
      questions.push(this.promptParamQuestion(params, param))
    })
    this.echo()

    return questions
  }

  async run() {
    await this.session.isAuthenticated()
    await this.session.hasProject()

    const {args} = this.parse(SocketEndpointCall)
    const {flags} = this.parse(SocketEndpointCall)

    try {
      const bodyOnly = flags['body-only']
      const [, socketName, endpointName] = args.fullEndpointName.match(/([^/]*)\/(.*)/)
      const socket = await Socket.get(socketName)
      const endpointObj = await socket.getEndpoint(endpointName)

      if (endpointObj && endpointObj.existRemotely) {
        const askQuestions = this.listParams(endpointObj)
        let config = {}
        if (askQuestions.length > 0) {
          config = await inquirer.prompt(askQuestions) || {}
        }
        try {
          const res = await endpointObj.call(config)
          this.formatResponse(res, bodyOnly)
        } catch (err) {
          if (err.response) {
            this.formatResponse(err.response)
          } else {
            this.error(err)
          }
        }
      } else {
        this.error('No such endpoint on the server! Make sure you have synced your socket.')
      }
    } catch (err) {
      this.error(err)
    }
  }
}
