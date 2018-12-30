import format from 'chalk'
import program from '../program'
import { echo } from '../utils/print-tools'

function validateCommands (commandsArr = []) {
  // eslint-disable-next-line no-underscore-dangle
  const isCommandFound = program.commands.some((command) => command._name === commandsArr[0])
  const text = 'is not a valid command, you can find valid commands below:'
  const invalidCommand = `\n '${commandsArr[0]}' ${format.red(text)}`

  if (!isCommandFound) {
    echo(invalidCommand)
    program.outputHelp()
  }
}

export default validateCommands
