import Server from 'syncano-server'

export default ctx => {
  const {response} = new Server(ctx)

  response.json({
    hello: 'World'
  })
}
