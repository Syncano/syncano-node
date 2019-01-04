import format from 'chalk'
import _ from 'lodash'
import stackTrace from 'stack-trace'

import { GlobalSpinner, SimpleSpinner } from '../../commands_helpers/spinner'
import logger from '../../utils/debug'
import { p, error, warning, echo, printSourceCode } from '../../utils/print-tools'
import { currentTime } from '../../utils/date-utils'

import Command, {Socket} from '../../base_command'

const { debug } = logger('cmd-trace')


export default class SocketTrace extends Command {
  static description = 'Trace Socket calls'
  static flags = {}
  static args = [{
    name: 'instanceName',
    required: true,
    description: 'name of the instance',
  }]

  traceTimers: string[]
  scriptWatch: boolean
  lastId: object
  mainSpinner: any
  cmd: any

  static getFirstTrace (errorMsg: string) {
    const err = new Error(errorMsg)
    return _.find(stackTrace.parse(err), (o) => o.lineNumber !== null)
  }

  async run (mainSpinner?: GlobalSpinner) {
    debug('SocketTrace run')

    this.traceTimers = []
    this.scriptWatch = false
    this.lastId = {}

    const {args} = this.parse(SocketTrace)

    if (mainSpinner) {
      this.mainSpinner = mainSpinner
    } else {
      this.mainSpinner = new GlobalSpinner(p(3)(`${format.grey('waiting...')}`))
    }

    echo(2)(`🔎 ${format.grey(' Tracing Socket calls')} ${format.dim('(Hit Ctrl-C to stop)')}`)
    echo()

    if (args.socketName) {
      const msg = p(3)(`${format.magenta('getting socket:')} ${currentTime()}`)
      const spinner = new SimpleSpinner(msg).start()
      const socket = await Socket.get(args.socketName)
      spinner.stop()
      return this.startCollectingTraces(socket)
    }

    const msg = p(3)(`${format.magenta('getting sockets:')} ${currentTime()}`)
    const spinner = new SimpleSpinner(msg).start()
    const sockets = await Socket.list()
    this.mainSpinner.queueSize += sockets.length
    spinner.stop()

    return Promise.all(sockets.map((socket) => this.startCollectingTraces(socket)))
  }

  async startCollectingTraces (socket) {
    debug('startCollectingTraces')
    this.mainSpinner.start()

    const ws = socket.getTraces()
    ws.on('error', (err) => {
      debug('ws error', err)
      this.mainSpinner.stop()
      ws.terminate()
      error(err.message)
      this.startCollectingTraces(socket)
    })

    ws.on('close', () => {
      debug('ws closed, starting again')
      this.startCollectingTraces(socket)
    })

    ws.on('message', async (data) => {
      debug('ws message')

      const receivedData = JSON.parse(data)
      if (!receivedData.payload && receivedData.detail) {
        this.mainSpinner.stop()
        warning(5)(receivedData.detail)
      } else {
        this.mainSpinner.stop()
        await this.printTrace(socket, JSON.parse(data))
        this.mainSpinner.start()
      }
    })
  }

  // Decide about how to print trace and which
  async printTrace (socket, trace) {
    if (!trace.payload || trace.payload.status === 'pending' || trace.payload.status === 'processing') return

    const traceUrl = trace.payload.links.self
    const fullTrace = await Socket.getEndpointTraceByUrl(traceUrl)
    const { stdout, stderr, response } = fullTrace.result

    if (trace.metadata.source === 'event_handler') {
      debug(`Event handler trace: ${trace.metadata.event_handler}`)
      const metadata = trace.metadata
      const traceHandlerName = metadata.event_handler
      SocketTrace.printTraceTriggerLine(fullTrace, metadata)
      if (stdout) SocketTrace.printTraceStdout(stdout)
      if (stderr) {
        echo(6)(format.grey('script stderr:'))
        const errorMsg = fullTrace.result.stderr.trim()

        try {
          const errorString = errorMsg.split('\n')[0]
          const traceData = SocketTrace.getFirstTrace(errorMsg)
          const prettyTrace = socket.getPrettyTrace(traceData, traceHandlerName)
          SocketTrace.printFullTrace({ prettyTrace, errorString })
        } catch (err) {
          SocketTrace.printSimpleError(errorMsg)
        }
      }
    }

    if (trace.metadata.source === 'endpoint') {
      const traceFullEndpointName = trace.metadata.endpoint
      const traceEndpointName = traceFullEndpointName.split('/')[1]

      SocketTrace.printTraceLine(fullTrace, traceFullEndpointName)
      if (stdout) SocketTrace.printTraceStdout(fullTrace.result.stdout)
      if (response && response.content) SocketTrace.printTraceBody(fullTrace.result.response)
      if (stderr) {
        echo(6)(format.grey('script stderr:'))
        const errorMsg = fullTrace.result.stderr.trim()

        try {
          const errorString = errorMsg.split('\n')[0]
          const traceData = SocketTrace.getFirstTrace(errorMsg)

          const prettyTrace = socket.getPrettyTrace(traceData, traceEndpointName)
          SocketTrace.printFullTrace({ prettyTrace, errorString })
        } catch (err) {
          SocketTrace.printSimpleError(errorMsg)
        }
      }
    }
  }

  // Single line with date, id etc.
  static printTraceLine (trace, traceEndpointName) {
    const endpointCall = trace.status === 'success' ? format.grey('endpoint call:') : format.red('endpoint call:')
    const endpoint = format.cyan(traceEndpointName)
    const duration = format.dim(`${trace.duration} ms`)
    const remoteAddr = format.dim(`(${trace.meta.REMOTE_ADDR})`)
    const requestMethod = format.dim(trace.meta.REQUEST_METHOD)
    const exitCode = format.cyan(
      trace.result.response ? trace.result.response.status : '200'
    )
    echo(6)(`${endpointCall} ${currentTime()} ${endpoint} ${requestMethod} ${exitCode} ${remoteAddr} ${duration}`)
  }

  // Single line with date, id etc.
  static printTraceTriggerLine (trace, metadata) {
    const eventName = metadata.event_handler
    const endpointCall = trace.status === 'success' ? format.grey('handler call:') : format.red('handler call:')
    const event = format.cyan(eventName)
    const socketName = format.cyan(metadata.socket)
    const duration = format.dim(`${trace.duration} ms`)
    echo(6)(`${endpointCall} ${currentTime()} ${event} handled by ${socketName} ${duration}`)
  }

  static printTraceStdout (stdout, title = 'script stdout:') {
    echo(6)(format.grey(title))
    echo()
    stdout.split('\n').forEach((line) => {
      echo(14)(format.dim(line))
    })
    echo()
  }

  static printTraceBody (response) {
    echo(8)(format.grey(`script body: (${response.content_type})`))
    echo()
    let code = response.content
    try {
      code = printSourceCode(response.content_type, response.content)
    } catch (err) {
      debug(err)
    }
    code.split('\n').forEach((line) => {
      echo(21)(line)
    })
    echo()
  }

  static printFileLine (params) {
    echo(21)([
      `${format.dim('at')} ${params.origFilePath}`,
      `${format.dim('line:')} ${params.lineNumber},`,
      `${format.dim('column:')} ${params.columnNumber}`
    ].join(' '))
    echo()
  }

  static printTraceLines (params) {
    echo()
    params.lines.forEach((line) => {
      echo(21)(format.dim(line))
    })
    echo(21)((format.red(params.errorString)))
  }

  static printFullTrace (params) {
    SocketTrace.printTraceLines({
      lines: params.prettyTrace.lines,
      errorString: params.errorString
    })

    SocketTrace.printFileLine({
      origFilePath: params.prettyTrace.origFilePath,
      lineNumber: params.prettyTrace.lineNumber,
      columnNumber: params.prettyTrace.columnNumber
    })
  }

  static printSimpleError (simpleError) {
    echo()
    const err = simpleError.split('\n').join(`\n${p(21)()}`)
    echo(21)(format.dim.red(err))
    echo()
  }
}
