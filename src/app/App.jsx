import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { store } from '../store/store'
import { AppRoutes } from '../routes/AppRoutes'

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              fontFamily: 'inherit',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  )
}
