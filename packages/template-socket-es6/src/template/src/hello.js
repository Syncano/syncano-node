import Syncano from '@syncano/core'

export default (ctx) => {
  const {response} = new Syncano(ctx)

  if (ctx.args.firstname && ctx.args.lastname) {
    response.json({
      message: `Hello ${ctx.args.firstname} ${ctx.args.lastname}!`
    })
  } else {
    response.json({
      message: 'You have to send "firstname" and "lastname" arguments!'
    }, 400)
  }
}
