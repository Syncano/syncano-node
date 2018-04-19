import React from 'react'

export const SyncanoContext = React.createContext()

// This function takes a component...
export function withSyncano(Component) {
  // ...and returns another component...
  return function SyncanoComponent(props) {
    // ... and renders the wrapped component with the context theme!
    // Notice that we pass through any additional props as well
    return (
      <SyncanoContext.Consumer>
        {syncano => <Component {...props} syncano={syncano} />}
      </SyncanoContext.Consumer>
    )
  }
}
