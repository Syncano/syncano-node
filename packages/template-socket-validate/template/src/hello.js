import Syncano from '@syncano/core'
import Validator from '@syncano/validate'

export default async (ctx) => {
  const {response} = new Syncano(ctx)
  const validator = new Validator(ctx)

  try {
    await validator.validateRequest()
  } catch (err) {
    return response.json(err.messages, 400)
  }

  response.json({
    message: `Hello ${ctx.args.firstname} ${ctx.args.lastname}!`
  })
}
