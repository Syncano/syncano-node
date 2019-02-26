import Syncano from '@syncano/core'

export default (ctx) => {
  const {response} = new Syncano(ctx)

  response.json({
    message: `${ctx.config.TEST1} ${ctx.config.TEST2}`
  })
}
