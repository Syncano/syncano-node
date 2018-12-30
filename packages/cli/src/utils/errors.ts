class CompileError {
  traceback: string
  constructor (traceback: string) {
    this.traceback = traceback
  }
}
class SocketUpdateError {
  message: string
  constructor (message: string) {
    this.message = message
  }
}

class CompatibilityError {
  message: string
  constructor (socketVersion: string, envVersion: string) {
    this.message = `Socket major version (${socketVersion}) is not\
 comaptible with this Syncano environment major version (${envVersion}).`
  }
}

export {
  CompatibilityError,
  CompileError,
  SocketUpdateError
}
