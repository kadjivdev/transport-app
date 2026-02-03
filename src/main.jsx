import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
// import des icons
import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./App.css"
import App from "./App.jsx"
import { Provider } from 'react-redux'
import store from './store.jsx'
import { AppProvider } from './AppContext.jsx'
import LoadingAlert from './components/Alerts/LoadingAlert.jsx'
import StatusAlert from './components/Alerts/StatusAlert.jsx'

import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        {/*  */}
        <AppProvider>
          <LoadingAlert />
          <StatusAlert />
          <App />
        </AppProvider>
        {/*  */}
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
