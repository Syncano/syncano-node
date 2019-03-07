import ora, { Ora } from 'ora'

class GlobalSpinner {
  spinnerLabel: string
  jobsCounter: number
  queueSize: number
  spinner: Ora

  constructor (spinnerLabel: string) {
    this.spinnerLabel = spinnerLabel
    this.spinner = ora(spinnerLabel)
    this.jobsCounter = 0
    this.queueSize = 0
  }

  label (text: string) {
    this.spinner.text = text
  }

  resetLabel (text: string) {
    this.spinner.text = this.spinnerLabel
  }

  stop () {
    this.spinner.stop()
    this.jobsCounter -= 1
  }

  start () {
    this.jobsCounter += 1
    if (this.jobsCounter === this.queueSize) {
      this.spinner.start()
    }
  }
}

class SimpleSpinner {
  spinner: Ora

  constructor (spinnerLabel: string) {
    this.spinner = ora({text: spinnerLabel, stream: process.stdout})
  }

  start () {
    this.spinner.start()
    return this
  }

  stop () {
    this.spinner.stop()
    return this
  }

  succeed (msg: string) {
    this.spinner.succeed(msg)
    return this
  }

  fail (msg: string) {
    this.spinner.fail(msg)
    return this
  }
}

export {
  GlobalSpinner,
  SimpleSpinner
}
