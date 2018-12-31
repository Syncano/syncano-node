import format from 'chalk'
import { echo } from '../../utils/print-tools'

export const printNoBackupsInfo = () => {
  echo(4)('You don\'t have any backups!')
  echo(4)(`Type ${format.cyan('npx s backups create')} to add backups for your app!`)
}
