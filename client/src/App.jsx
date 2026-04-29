import React from 'react'
import { Routes, Route } from 'react-router-dom'


import { DefaultLayout } from './components/layout/DefaultLayout'

import { MainPage } from './pages/MainPage'
import { LoginPage } from './pages/LoginPage'

const App = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path='/' element={<MainPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Route>

    </Routes>
  )
}

export default App