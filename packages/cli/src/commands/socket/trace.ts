import format from 'chalk'
import _ from 'lodash'
import stackTrace from 'stack-trace'

import Command, {Socket} from '../../base_command'
import {GlobalSpinner, SimpleSpinner} from '../../commands_helpers/spinner'
import {currentTime} from '../../utils/date-utils'
import logger from '../../utils/debug'
import {printSourceCode} from '../../utils/print-tools'

const {debug} = logger('cmd-trace')

export default class SocketTrace extends Command {
  static description = 'Trace Socket calls'
  static flags = {}
  static args = [{
    name: 'instanceName',
    required: true,
    description: 'name of the instance',
  }]

  static getFirstTrace(errorMsg: string) {
    const err = new Error(errorMsg)
    return _.find(stackTrace.parse(err), o => o.lineNumber !== null)
  }

  traceTimers: string[]
  scriptWatch: boolean
  lastId: object
  mainSpinner: any
  cmd: any

  printFileLine(params) {
    this.echo(21)([
      `${format.dim('at')} ${params.origFilePath}`,
      `${format.dim('line:')} ${params.lineNumber},`,
      `${format.dim('column:')} ${params.columnNumber}`
    ].join(' '))
    this.echo()
  }

  printTraceLines(params) {
    this.echo()
    params.lines.forEach(line => {
      this.echo(21)(format.dim(line))
    })
    this.echo(21)((format.red(params.errorString)))
  }

  printFullTrace(params) {
    this.printTraceLines({
      lines: params.prettyTrace.lines,
      errorString: params.errorString
    })

    this.printFileLine({
      origFilePath: params.prettyTrace.origFilePath,
      lineNumber: params.prettyTrace.lineNumber,
      columnNumber: params.prettyTrace.columnNumber
    })
  }

  printSimpleError(simpleError) {
    this.echo()
    const err = simpleError.split('\n').join(`\n${this.p(21)()}`)
    this.echo(21)(format.dim.red(err))
    this.echo()
  }

  // Single line with date, id etc.
  printTraceLine(trace, traceEndpointName) {
    const endpointCall = trace.status === 'success' ? format.grey('endpoint call:') : format.red('endpoint call:')
    const endpoint = format.cyan(traceEndpointName)
    const duration = format.dim(`${trace.duration} ms`)
    const remoteAddr = format.dim(`(${trace.meta.REMOTE_ADDR})`)
    const requestMethod = format.dim(trace.meta.REQUEST_METHOD)
    const exitCode = format.cyan(
      trace.result.response ? trace.result.response.status : '200'
    )
    this.echo(6)(`${endpointCall} ${currentTime()} ${endpoint} ${requestMethod} ${exitCode} ${remoteAddr} ${duration}`)
  }

  // Single line with date, id etc.
  printTraceTriggerLine(trace, metadata) {
    const eventName = metadata.event_handler
    const endpointCall = trace.status === 'success' ? format.grey('handler call:') : format.red('handler call:')
    const event = format.cyan(eventName)
    const socketName = format.cyan(metadata.socket)
    const duration = format.dim(`${trace.duration} ms`)
    this.echo(6)(`${endpointCall} ${currentTime()} ${event} handled by ${socketName} ${duration}`)
  }

  printTraceStdout(stdout, title = 'script stdout:') {
    this.echo(6)(format.grey(title))
    this.echo()
    stdout.split('\n').forEach(line => {
      this.echo(14)(format.dim(line))
    })
    this.echo()
  }

  printTraceBody(response) {
    this.echo(8)(format.grey(`script body: (${response.content_type})`))
    this.echo()
    let code = response.content
    try {
      code = printSourceCode(response.content_type, response.content)
    } catch (err) {
      debug(err)
    }
    code.split('\n').forEach(line => {
      this.echo(21)(line)
    })
    this.echo()
  }

  async run(mainSpinner?: GlobalSpinner) {
    debug('SocketTrace run')
    await this.session.isAuthenticated()
    await this.session.hasProject()

    this.traceTimers = []
    this.scriptWatch = false
    this.lastId = {}

    const {args} = this.parse(SocketTrace)

    if (mainSpinner) {
      this.mainSpinner = mainSpinner
    } else {
      this.mainSpinner = new GlobalSpinner(this.p(3)(`${format.grey('waiting...')}`))
    }

    this.echo(2)(`🔎 ${format.grey(' Tracing Socket calls')} ${format.dim('(Hit Ctrl-C to stop)')}`)
    this.echo()

    if (args.socketName) {
      const msg = this.p(3)(`${format.magenta('getting socket:')} ${currentTime()}`)
      const spinner = new SimpleSpinner(msg).start()
      const socket = await Socket.get(args.socketName)
      spinner.stop()
      return this.startCollectingTraces(socket)
    }

    const msg = this.p(3)(`${format.magenta('getting sockets:')} ${currentTime()}`)
    const spinner = new SimpleSpinner(msg).start()
    const sockets = await Socket.list()
    this.mainSpinner.queueSize += sockets.length
    spinner.stop()

    return Promise.all(sockets.map(socket => this.startCollectingTraces(socket)))
  }

  async startCollectingTraces(socket) {
    debug('startCollectingTraces')
    this.mainSpinner.start()

    const ws = socket.getTraces()
    ws.on('error', err => {
      debug('ws error', err)
      this.mainSpinner.stop()
      ws.terminate()
      this.error(err.message)
      this.startCollectingTraces(socket)
    })

    ws.on('close', () => {
      debug('ws closed, starting again')
      this.startCollectingTraces(socket)
    })

    ws.on('message', async data => {
      debug('ws message')

      const receivedData = JSON.parse(data)
      if (!receivedData.payload && receivedData.detail) {
        this.mainSpinner.stop()
        this.warn(this.p(5)(receivedData.detail))
      } else {
        this.mainSpinner.stop()
        await this.printTrace(socket, JSON.parse(data))
        this.mainSpinner.start()
      }
    })
  }

  // Decide about how to print trace and which
  async printTrace(socket, trace) {
    if (!trace.payload || trace.payload.status === 'pending' || trace.payload.status === 'processing') return

    const traceUrl = trace.payload.links.self
    const fullTrace = await Socket.getEndpointTraceByUrl(traceUrl)
    const {stdout, stderr, response} = fullTrace.result

    if (trace.metadata.source === 'event_handler') {
      debug(`Event handler trace: ${trace.metadata.event_handler}`)
      const metadata = trace.metadata
      const traceHandlerName = metadata.event_handler
      this.printTraceTriggerLine(fullTrace, metadata)
      if (stdout) this.printTraceStdout(stdout)
      if (stderr) {
        this.echo(6)(format.grey('script stderr:'))
        const errorMsg = fullTrace.result.stderr.trim()

        try {
          const errorString = errorMsg.split('\n')[0]
          const traceData = SocketTrace.getFirstTrace(errorMsg)
          const prettyTrace = socket.getPrettyTrace(traceData, traceHandlerName)
          this.printFullTrace({prettyTrace, errorString})
        } catch (err) {
          this.printSimpleError(errorMsg)
        }
      }
    }

    if (trace.metadata.source === 'endpoint') {
      const traceFullEndpointName = trace.metadata.endpoint
      const traceEndpointName = traceFullEndpointName.split('/')[1]

      this.printTraceLine(fullTrace, traceFullEndpointName)
      if (stdout) this.printTraceStdout(fullTrace.result.stdout)
      if (response && response.content) this.printTraceBody(fullTrace.result.response)
      if (stderr) {
        this.echo(6)(format.grey('script stderr:'))
        const errorMsg = fullTrace.result.stderr.trim()

        try {
          const errorString = errorMsg.split('\n')[0]
          const traceData = SocketTrace.getFirstTrace(errorMsg)

          const prettyTrace = socket.getPrettyTrace(traceData, traceEndpointName)
          this.printFullTrace({prettyTrace, errorString})
        } catch (err) {
          this.printSimpleError(errorMsg)
        }
      }
    }
  }
}
