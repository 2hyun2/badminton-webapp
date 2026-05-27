import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { useUsers } from '../../hooks/useUsers';
import { useSocket } from '../../hooks/useSocket';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logoutUser } = useAuthStore();
    const { me } = useUsers();
    const { socketOn, socketOff } = useSocket();
    const [userSocket, setUserSocket] = useState(null);
    const [matchSocket, setMatchSocket] = useState(null);

    useEffect(() => {
        const handleUserOnOff = (data) => {
            setUserSocket(data);

            switch (data.type) {
                case 'ENTRY': break;
                case 'EXIT': break;
                case 'UPDATE': break;
            }
        };
        socketOn('users:update', handleUserOnOff);
        return () => socketOff('users:update', handleUserOnOff) // unMount시 이벤트 제거
    }, [socketOn, socketOff])

    useEffect(() => {
        const handleUserMatch = (data) => {
            setMatchSocket(data);

            switch (data.type) {
                case 'START': break;
                case 'END': break;
            }
        };
        socketOn('match:update', handleUserMatch);
        return () => socketOff('match:update', handleUserMatch) // unMount시 이벤트 제거
    }, [socketOn, socketOff])

    const myStand = () => {
        // 1. 로그인 전
        if (!me) return { color: 'bg-blue-600', text: '로그인 필요' };
        // 2. 로그인 후 - 퇴장 상태
        if (!me.isPresent) return { color: 'bg-gray-400', text: '입장을 눌러주세요.' };

        // 3. 로그인 후 - 입장 상태
        switch (me.status) {
            case 'RESTING':
                return { color: 'bg-emerald-200 text-emerald-900', text: '휴식중' };
            case 'WAITING':
                return { color: 'bg-blue-600 text-white', text: '매칭 대기중' };
            case 'PLAYING':
                return { color: 'bg-red-500 text-white', text: '경기 진행중' };
            default:
                return { color: 'bg-rose-500 text-white', text: '입장 확인됨' };
        }
    };

    const statusInfo = myStand();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        logoutUser();
        alert('로그아웃 되었습니다.');
        closeMenu();
        navigate('/login', { replace: true });
    };

    console.log(userSocket);
    console.log(matchSocket);

    return (
        <header className={`relative flex justify-between items-center w-full ${statusInfo.color} p-2 shadow-md transition-all duration-300`}>
            <Link to="/" onClick={closeMenu} className="">
                <h1 className={`flex items-center text-lg font-bold `}>🏸 {statusInfo.text}</h1>
            </Link>

            {/* 햄버거 버튼 */}
            <button onClick={toggleMenu} className="cursor-pointer" aria-label="Menu" >
                {isMenuOpen ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* 햄버거 메뉴바 컨텐츠 */}
            <div className={`
                            absolute top-full left-0 right-0 w-full text-white ${statusInfo.color} z-50 overflow-hidden transition-all duration-300 ease
                            ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
                        `}>
                <nav className="flex flex-col text-base font-semibold text-right border-t border-slate-100 [text-shadow:_0_0_2px_rgb(96_165_250_/_0.8)]">
                    <Link to="/" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">Home</Link>
                    <Link to="/ranking" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">Rankings</Link>
                    <Link to="/record" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">Records</Link>
                    <Link to="/history" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">History</Link>
                    <Link to="/mypage" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">My Page</Link>
                    {user ? (
                        <>
                            <button onClick={handleLogout} className="w-full text-right border-b border-slate-100 p-2 cursor-pointer [text-shadow:_0_0_2px_rgb(96_165_250_/_0.8)] hover:bg-blue-700">Logout</button>
                            {user.role === 'ADMIN' && (
                                <Link to="/admin" onClick={closeMenu} className="bg-red-500 text-white border-b border-slate-100 p-2">관리자 페이지</Link>
                            )}
                        </>
                    ) : (
                        <Link to="/login" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">Login</Link>
                    )}
                </nav>
            </div>

            {/* userSocket */}
            <div className={`absolute top-full inset-x-0 z-7 max-h-0 overflow-hidden transition-all duration-300 ease ${userSocket && 'max-h-[100px]'}`}>
                {userSocket &&
                    <div className={`text-base font-bold text-center text-white boder-b border-slate-900 py-0.5 px-1 shadow ${userSocket.type === 'ENTRY' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {`${userSocket?.user?.name}님이 ${userSocket.type === 'ENTRY' ? '입장' : '퇴장'}하셨습니다.`} { }
                    </div>
                }
            </div>
        </header>
    );
};