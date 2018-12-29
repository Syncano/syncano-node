import ora from 'ora'

class GlobalSpinner {
  constructor (spinnerLabel) {
    this.spinnerLabel = spinnerLabel
    this.spinner = ora(spinnerLabel)
    this.jobsCounter = 0
    this.queueSize = 0
  }

  label (text) {
    this.spinner.text = text
  }

  resetLabel (text) {
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
  constructor (spinnerLabel) {
    this.spinner = ora(spinnerLabel)
  }

  start () {
    this.spinner.start()
    return this
  }

  stop () {
    this.spinner.stop()
    return this
  }

  succeed (msg) {
    this.spinner.succeed(msg)
    return this
  }

  fail (msg) {
    this.spinner.fail(msg)
    return this
  }
}

export {
  GlobalSpinner,
  SimpleSpinner
}
