class CompileError {
  constructor (traceback) {
    this.traceback = traceback
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
  CompileError
}
