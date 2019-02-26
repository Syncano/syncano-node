import path from 'path'

export const cliLocation = path.join(process.cwd(), '../bin/run')
export const projectTestTemplate = path.join(__dirname, './assets/project/empty/')
export const configTestTemplate = path.join(__dirname, './assets/sockets/hello-config')
export const hostingAssets = path.join(__dirname, './assets/hosting_test')
