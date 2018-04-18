declare var global: any

global.META = global.META || {}

export interface Settings {
  meta: any
  token?: string
  socket?: string
  instanceName?: string
  setResponse?: any
  HttpResponse?: any
}

export default ({
  meta = {},
  token,
  socket,
  instanceName,
  setResponse,
  HttpResponse,
  ...props
}: Settings) => ({
  HttpResponse,
  apiVersion: 'v2',
  host:
    process.env.SYNCANO_HOST ||
    global.META.api_host ||
    meta.api_host ||
    'api.syncano.io',
  instanceName:
    instanceName ||
    process.env.SYNCANO_INSTANCE_NAME ||
    global.META.instance ||
    meta.instance,
  meta,
  setResponse,
  socket: socket || global.META.socket || meta.socket,
  spaceHost:
    process.env.SPACE_HOST ||
    global.META.space_host ||
    meta.space_host ||
    'syncano.space',
  token:
    token || process.env.SYNCANO_API_KEY || global.META.token || meta.token,
    ...props
})
