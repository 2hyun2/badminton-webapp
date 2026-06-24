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
import { UserDailyRecordPage } from './pages/UserDailyRecordPage'
import { UserMatchesPage } from './pages/UserMatchesPage'
import { UserMyPage } from './pages/UserMyPage'
import { Loading } from './components/common/Loading'
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
                <Route path='/daily/' element={<UserDailyRecordPage />} />
                <Route path='/daily/:id' element={<UserDailyRecordPage />} />
                <Route path='/history' element={<UserMatchesPage />} />
                <Route path='/mypage' element={<UserMyPage />} />
                <Route path='/loading' element={<Loading />} />
                <Route element={<AdminLayout />}>
                    {/* 어드민 전용 */}
                    <Route path='/admin/' element={<AdminIndex />} />
                    <Route path='/admin/users' element={<AdminUsers />} />
                    <Route path='/admin/matches' element={<AdminMatches />} />
                </Route>

            </Route>
        </Routes>
    )
}

export default App