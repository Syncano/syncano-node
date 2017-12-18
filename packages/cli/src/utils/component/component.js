import session from '../session'
import Socket from '../sockets'

class Component {
  constructor () {
    this.session = session
  }

  static async list () {
    const sockets = await Socket.list()
    sockets.forEach(async socket => {
      const components = await socket.getComponents()
      console.log(socket.name, components)
    })
  }
}

export default Component
