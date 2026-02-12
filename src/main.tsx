import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Routers from './layouts/Routers'
import "./styles/index.css"
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'
import { persistor, store } from './store'

import { ConfigProvider } from 'antd'
import theme from './styles/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={theme}>
          <BrowserRouter>
            <Routers />
          </BrowserRouter>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
