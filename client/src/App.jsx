import React from 'react'
import { Routes, Route } from 'react-router-dom'

import { DefaultLayout } from './components/layout/DefaultLayout'

import { MainPage } from './pages/MainPage'
import { JoinPage } from './pages/JoinPage'
import { LoginPage } from './pages/LoginPage'
import { MatchHistory } from './components/history/MatchHistory'




const App = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path='/' element={<MainPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/join' element={<JoinPage />} />
        <Route path='/history' element={<MatchHistory />} />
      </Route>
    </Routes>
  )
}

export default App