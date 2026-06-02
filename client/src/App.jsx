import { React, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
// layout
import { DefaultLayout } from './components/layout/DefaultLayout'
import { ProtectedLayout } from './components/layout/ProtectedLayout'
import { AdminLayout } from './components/layout/AdminLayout'
// default
import { JoinPage } from './pages/JoinPage'
import { LoginPage } from './pages/LoginPage'
// protected
import { MainPage } from './pages/MainPage'
import { UserListPage } from './pages/UserListPage'
import { UserRankingPage } from './pages/UserRankingPage'
import { UserRecordPage } from './pages/UserRecordPage'

import { MatchHistory } from './components/MatchHistory'
import { MyPage } from './components/MyPage'
// admin
import { AdminIndex } from './pages/AdminIndex'
import { AdminUsers } from './pages/AdminUsers'
import { AdminMatches } from './pages/AdminMatches'

const App = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/join' element={<JoinPage />} />
            </Route>
            <Route element={<ProtectedLayout />}>
                <Route path='/' element={<MainPage />} />
                <Route path='/members' element={<UserListPage />} />
                <Route path='/ranking' element={<UserRankingPage />} />
                <Route path='/record' element={<UserRecordPage />} />
                <Route path='/record/:id' element={<UserRecordPage />} />
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