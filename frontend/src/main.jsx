import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store'

axios.defaults.withCredentials = true
axios.interceptors.request.use(config => {
  if (import.meta.env.PROD && config.url) {
    const requestUrl = new URL(config.url, window.location.origin)
    if (requestUrl.pathname === '/api/v1' || requestUrl.pathname.startsWith('/api/v1/')) {
      config.url = `${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`
    }
  }
  return config
})

createRoot(document.getElementById('root')).render(

  <Provider store={store} >
    <App />
  </Provider>




)
