import {writeFileSync} from 'fs'

export default class {
  public context: any

  constructor (context: any) {
    this.context = context
  }
  public async run ([out]: [string]) {
    const sockets = await this.context.Socket.list()
    const classes = Object.assign({}, ...sockets.map((item: any) => item.spec.classes))

    writeFileSync('./syncano.d.ts', this.instanceInterface(classes))
    writeFileSync('./tsconfig.syncano.json', this.syncanoTsConfig)
  }

  private instanceInterface(classes: Array<{
    [className: string]: Array<{
      name: string
      type: string
    }>
  }>) {
    return `import {DataClass} from '@syncano/core'

declare module '@syncano/core/server' {
  export interface InstanceDataSchema {
    ${Object.keys(classes).map((className) => `${className}: DataClass<{
      ${classes[className].map((item: any) => `${item.name}: ${item.type}`).join('\n      ')}
    }>`).join('\n    ')}
  }
}`
  }

  get syncanoTsConfig() {
    return `{
  "files": [
    "./syncano.d.ts"
  ],
  "include": [
    "syncano/**/*"
  ]
}
`
  }
}
