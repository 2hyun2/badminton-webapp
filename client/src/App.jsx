import { React, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

import { DefaultLayout } from './components/layout/DefaultLayout'
import { ProtectedLayout } from './components/layout/ProtectedLayout'

import { MainPage } from './pages/MainPage'
import { JoinPage } from './pages/JoinPage'
import { LoginPage } from './pages/LoginPage'
import { MatchHistory } from './components/MatchHistory'
import { Record } from './components/Record'
import { Ranking } from './components/Ranking'
import { MyPage } from './components/MyPage'

import { AdminLayout } from './components/layout/AdminLayout'
import { AdminIndex } from './components/admin/AdminIndex'
import { AdminUsers } from './components/admin/AdminUsers'
import AdminMatches from './components/admin/AdminMatches'

const App = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/join' element={<JoinPage />} />
            </Route>
            <Route element={<ProtectedLayout />}>
                <Route path='/' element={<MainPage />} />
                <Route path='/ranking' element={<Ranking />} />
                <Route path='/record' element={<Record />} />
                <Route path='/record/:id' element={<Record />} />
                <Route path='/history' element={<MatchHistory />} />
                <Route path='/mypage' element={<MyPage />} />
                <Route element={<AdminLayout />}>
                    {/* 어드민 내용들 */}
                    <Route path='/admin/' element={<AdminIndex />} />
                    <Route path='/admin/users' element={<AdminUsers />} />
                    <Route path='/admin/matches' element={<AdminMatches />} />
                </Route>

            </Route>
        </Routes>
    )
}

export default App