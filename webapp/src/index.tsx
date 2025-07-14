import './index.css'

import App from './App'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { StoreProvider } from 'easy-peasy'
import reportWebVitals from './reportWebVitals'
import { store } from './store'

function main() {
  window.addEventListener('resize', () => {
    store.getActions().setEnv({
      vw: window.innerWidth,
      vh: window.innerHeight,
    })
  })

  store.getActions().init()

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  )

  root.render(
    <React.StrictMode>
      <StoreProvider store={store}>
        <App />
      </StoreProvider>
    </React.StrictMode>
  )
}

main()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
