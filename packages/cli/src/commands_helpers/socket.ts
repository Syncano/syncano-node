import format from 'chalk'
import inquirer from 'inquirer'

import logger from '../utils/debug'
import {echo, echon, error, warning} from '../utils/print-tools'

const {debug} = logger('cmd-helpers-socket')

export const askQuestions = configOptions => {
  const questions = []

  Object.keys(configOptions).forEach(paramName => {
    const param = configOptions[paramName]
    const longDesc = param.long_description ? param.long_description.split('\n').join('\n    ') : ' '
    let shortDesc = format.bold(paramName)
    if (param.description) {
      shortDesc = `${format.bold(param.description)} ${format.dim(`(${paramName})`)}`
    }
    questions.push({
      name: paramName,
      message: [
        this.p(2)(shortDesc),
        this.p(4)(format.reset(longDesc)),
        this.p(4)('Type in value:')
      ].join('\n'),
      default: param.default,
      validate: value => {
        if (param.required && !value) {
          return 'This config value is required!'
        }
        return true
      }
    })
  })

  return inquirer.prompt(questions)
}

export const updateSocket = async (socket, config) => {
  debug(`updateSocket: ${socket.name}`)
  const startTime = new Date().getTime()

  try {
    const updateStatus = await socket.update({config})
    const endTime = new Date().getTime()
    if (updateStatus.status === 'ok') {
      echon(4)(`${format.green('✓')} ${format.cyan(socket.name)} `)
      echo(`successfully updated ${format.dim((endTime - startTime).toString(), 'ms')}`)
    } else if (updateStatus.status === 'stopped') {
      echon(4)(`${format.green('✓')} ${format.cyan(socket.name)} `)
      echo(`successfully updated ${format.dim((endTime - startTime).toString(), 'ms')}`)
    } else {
      echon(4)(`${format.red('✗')} ${format.cyan(socket.name)} `)
      echo(`update failed ${format.dim((endTime - startTime).toString(), 'ms')}`)
      const errMsg = updateStatus.message.error
      const lineNo = updateStatus.message.lineno
      echon(4)(format.dim.red(errMsg))
      if (lineNo) {
        echo(format.dim(`line ${lineNo} of socket.yml`))
      } else {
        echo()
      }
      echo()
    }
    return updateStatus
  } catch (err) {
    error(err)
  }
}

export const updateConfig = async (socket, config) => {
  echo()
  echon(4)(`Updating Socket's ${format.cyan(socket.name)} config... `)

  try {
    const updateStatus = await socket.update({config})
    if (updateStatus === 'ok') {
      echo(format.green('Done'))
      echo()
    } else {
      echo()
      error(4)(updateStatus)
      echo()
    }
  } catch (err) {
    if (typeof err === 'object' && err.errorType) {
    } else {
      error(err)
    }
  }
}

export const socketNotFound = () => {
  echo()
  warning(4)('No Socket was found on server nor in config!')
  echo()
}
