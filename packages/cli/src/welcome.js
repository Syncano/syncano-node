import format from 'chalk'
import { echo } from './utils/print-tools'

setTimeout(() => {
  echo()
  echo()
  echo(1)(`👍   ${format.green('Congratulations!')}`)
  echo(5)('You are now ready to start your Syncano based projects!')
  echo()
  echo(5)(`Check out our QuickStart guide: ${format.cyan.underline('https://goo.gl/hDQgx0')}`)
  echo(5)('to set up your first scalable app in the cloud in just 45 seconds.')
  echo()
  echo(5)(format.grey('or'))
  echo()
  echo(5)(`Type ${format.cyan('syncano-cli')} to see CLI help screen.`)
  echo()
  echo(5)(format.grey('(Hit Enter to continue)'))
  echo()
}, 500)
