class CompileError {
  constructor (traceback) {
    this.traceback = traceback
  }
}
class SocketUpdateError {
  constructor (message) {
    this.message = message
  }
}

class CompatibilityError {
  constructor (socketVersion, envVersion) {
    this.message = `Socket major version (${socketVersion}) is not\
 comaptible with this Syncano environment major version (${envVersion}).`
  }
}

export {
  CompatibilityError,
  CompileError,
  SocketUpdateError
}
