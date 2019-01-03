import * as crypto from 'crypto'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'

export default class {
  public context: any

  constructor (context: any) {
    this.context = context
  }

  public async run () {
    const sockets = await this.context.Socket.list()
    const classes = Object.assign({}, ...sockets.map((item: any) => item.spec.classes))
    const typePath = './syncano/typings/instance/index.d.ts'
    const instanceInterface = this.instanceInterface(classes)

    mkdirp('./syncano/typings/instance', () => {
      fs.readFile(typePath, (err, data) => {
        if (!data) {
          fs.writeFileSync(typePath, instanceInterface)
          console.log('Instance schema type was created.')
        } else if (this.checksum(data.toString()) !== this.checksum(instanceInterface)) {
          fs.writeFileSync(typePath, instanceInterface)
          console.log('Instance schema type was updated.')
        } else {
          console.log('Instance schema type is already up to date.')
        }
      })
    })

    if (!fs.existsSync('./syncano/tsconfig.json')) {
      fs.writeFileSync('./syncano/tsconfig.json', this.syncanoTsConfig)
      console.log('Syncano tsconfig.json file was created.')
    } else {
      console.log('Syncano tsconfig.json file already exists.')
    }
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
      ${classes[className].map((item: any) => `${item.name}?: ${this.getType(item.type)}`).join('\n      ')}
    }>`).join('\n    ')}
  }
}`
  }

  private getType(type: string) {
    return {
      string: 'string',
      text: 'string',
      integer: 'number',
      float: 'number',
      boolean: 'boolean',
      datetime: 'string',
      file: 'any',
      reference: 'any',
      relation: 'any[]',
      array: 'Array<string | boolean | number>',
      object: 'object',
      geopoint: `{
      latitude: number
      longitude: number
    }`
    }[type]
  }

  get syncanoTsConfig() {
    return `{
  "compilerOptions": {
    "lib": [
      "es2015"
    ],
    "typeRoots": [
      "./typings"
    ]
  }
}
`
  }
  private checksum(str: any, algorithm?: string, encoding?: crypto.HexBase64Latin1Encoding) {
    return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex')
  }
}
