export default (ctx) => {
  const example = ctx.meta.metadata.response.examples[0].example
  const mimetype = ctx.meta.metadata.response.mimetype
  ctx.setResponse(new ctx.HttpResponse(200, example, mimetype))
}
