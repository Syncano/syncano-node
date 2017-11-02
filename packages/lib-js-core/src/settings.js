global.META = global.META || {}

export default ({
  meta = {},
  token,
  socket,
  instanceName,
  setResponse,
  HttpResponse,
  ...props
}) => ({
  token:
    token || process.env.SYNCANO_API_KEY || global.META.token || meta.token,
  instanceName:
    instanceName ||
    process.env.SYNCANO_INSTANCE_NAME ||
    global.META.instance ||
    meta.instance,
  host:
    process.env.SYNCANO_HOST ||
    global.META.api_host ||
    meta.api_host ||
    'api.syncano.io',
  spaceHost:
    process.env.SPACE_HOST ||
    global.META.space_host ||
    meta.space_host ||
    'syncano.space',
  apiVersion: 'v2',
  socket: socket || global.META.socket || meta.socket,
  meta,
  setResponse,
  HttpResponse,
  ...props
})
