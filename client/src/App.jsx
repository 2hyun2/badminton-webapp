import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { MainPage } from './pages/mainPage'
import { LoginPage } from './pages/loginPage'



const App = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<MainPage/>} />
        <Route path='/login' element={<LoginPage/>} />

      </Routes>
    </>
  )
}

export default App