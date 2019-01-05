import format from 'chalk'
import inquirer from 'inquirer'
import _ from 'lodash'
import {flags} from '@oclif/command'
import logger from '../../utils/debug'
import {echon, printCode, printSourceCode} from '../../utils/print-tools'
import { p, error, echo } from '../../utils/print-tools'

import Command, {Socket} from '../../base_command'

const { debug } = logger('cmd-socket-compile')


export default class SocketEndpointCall extends Command {
  static description = 'Trace Socket calls'
  static flags = {
    'body-only': flags.boolean()
  }
  static args = [{
    name: 'fullEndpointName',
    required: true,
    description: 'full endpoint name in format: <socket_name>/<endpoint_name>'
  }]

  context: any
  session: any
  Socket: any
  socketList: any
  mainSpinner: any
  cmd: any
  localSockets: any

  async run () {
    const {args} = this.parse(SocketEndpointCall)
    const {flags} = this.parse(SocketEndpointCall)

    try {
      const bodyOnly = flags['body-only']
      const [, socketName, endpointName] = args.fullEndpointName.match(/([^/]*)\/(.*)/)
      const socket = await Socket.get(socketName)
      const endpointObj = await socket.getEndpoint(endpointName)

      if (endpointObj && endpointObj.existRemotely) {
        const askQuestions = SocketEndpointCall.listParams(endpointObj)
        let config = {}
        if (askQuestions.length > 0) {
          config = await inquirer.prompt(askQuestions) || {}
        }
        try {
          const res = await endpointObj.call(config)
          SocketEndpointCall.formatResponse(res, bodyOnly)
        } catch (err) {
          if (err.response) {
            SocketEndpointCall.formatResponse(err.response)
          } else {
            error(err)
          }
        }
      } else {
        error('No such endpoint on the server! Make sure you have synced your socket.')
      }
    } catch (err) {
      error(err)
    }
  }


  static validateValue (value) {
    if (!value) {
      return 'We need this!'
    }

    return true
  }

  static promptParamQuestion (params, param) {
    const description = params[param].description || ''
    const paramType = params[param].type
    echo(4)(`- ${param} ${format.dim(`(${paramType})`)} ${description}`)
    const question = {
      name: param,
      message: p(2)(`Type in value for "${format.green(param)}" parameter`),
      default: params[param].example,
      validate: (value) => SocketEndpointCall.validateValue(value)
    }
    return question
  }

  static listParams (endpointObj) {
    const params = endpointObj.metadata.inputs || {}
    const paramsCount = Object.keys(params).length
    const questions = []

    if (!paramsCount) return questions

    echo()
    echon(4)(`You can pass ${format.cyan(paramsCount.toString())} `)
    echo(`parameter(s) to ${format.cyan(endpointObj.getFullName())} endpoint:`)
    echo()

    Object.keys(params).forEach((param) => {
      questions.push(this.promptParamQuestion(params, param))
    })
    echo()

    return questions
  }

  static formatResponse (res, bodyOnly?) {
    // Callback for the HTTP request response
    const contentType = res.headers['content-type']

    echo()
    if (!bodyOnly) {
      echo(4)(format.grey('statusCode:'), printCode(res.status))
      echo(4)(format.grey('content-type:'), res.headers['content-type'])
      echo(4)(format.grey('body:'))
    }

    echo()
    echo(p(bodyOnly ? 0 : 4)(printSourceCode(contentType, res.data)))
    echo()
  }
}

