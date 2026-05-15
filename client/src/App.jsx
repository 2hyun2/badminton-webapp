import React from 'react'
import { Routes, Route } from 'react-router-dom'

import { DefaultLayout } from './components/layout/DefaultLayout'
import { ProtectedLayout } from './components/layout/ProtectedLayout'

import { MainPage } from './pages/MainPage'
import { JoinPage } from './pages/JoinPage'
import { LoginPage } from './pages/LoginPage'
import { MatchHistory } from './components/history/MatchHistory'

const App = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/join' element={<JoinPage />} />
            </Route>
            <Route element={<ProtectedLayout />}>
                <Route path='/' element={<MainPage />} />
                <Route path='/history' element={<MatchHistory />} />
            </Route>
        </Routes>
    )
}

export default App