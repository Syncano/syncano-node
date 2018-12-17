import format from 'chalk'
import { echo } from '../../utils/print-tools'

export const printInstanceInfo = (session, indent=4) => {
  echo(indent)(`${format.grey('instance:')} ${format.yellow(session.project.instance)}`)
  echo(indent)(`${format.grey('location:')} ${format.yellow(session.location)}`)
}


