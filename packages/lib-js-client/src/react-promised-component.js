// import React from 'react'
//
// export default class ReactPromisedComponent extends React.Component {
//   state = {
//     component: null
//   }
//
//   componentWillMount() {
//     const {url, name} = this.props._promise
//
//     this._loadComponent(url).then(() => {
//       console.log( window.syncanoComponents, name)
//       return this.setState({component: window.syncanoComponents[name](React)})
//     })
//   }
//
//   _loadComponent = src =>
//     new Promise((resolve, reject) => {
//       const s = document.createElement('script')
//       s.src = src
//       // s.type = 'module'
//       s.onload = resolve
//       s.onerror = reject
//       // s.appendChild(
//       //   document.createTextNode(`
//       //     import func from 'https://dry-moon-2741.syncano.space/openweathermap/weather-react/'
//       //     window.syncanoComponents = window.syncanoComponents || {}
//       //     window.syncanoComponents['openweathermap/weather-react'] = func
//       //     console.log("XXX", window.syncanoComponents )
//       //   `)
//       // )
//       document.head.appendChild(s)
//     })
//
//   render() {
//     return this.state.component
//       ? React.createElement(this.state.component, {...this.props._props})
//       : this.state.component
//   }
// }
