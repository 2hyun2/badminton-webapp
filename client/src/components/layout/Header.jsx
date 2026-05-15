import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { useUsers } from '../../hooks/useUsers';


export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logoutUser } = useAuthStore();
    const { me } = useUsers();

    const myStand = () => {
        // 1. 로그인 전
        if (!me) return { color: 'bg-blue-600', text: '로그인 필요' };
        // 2. 로그인 후 - 퇴장 상태
        if (!me.isPresent) return { color: 'bg-gray-400', text: '입장을 눌러주세요.' };

        // 3. 로그인 후 - 입장 상태
        switch (me.status) {
            case '휴식중':
                return { color: 'bg-emerald-200 text-emerald-900', text: '휴식중' };
            case '대기중':
                return { color: 'bg-blue-600 text-white', text: '매칭 대기중' };
            case '경기중':
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

    return (
        <>
            <header className={`relative flex justify-between items-center w-full text-xl font-bold ${statusInfo.color} py-2 px-4 shadow-md transition-all duration-300`}>                <Link to="/" onClick={closeMenu}>
                <h1 className="flex items-center gap-2">🏸 {statusInfo.text}</h1>
            </Link>

                {/* 햄버거 버튼 */}
                <button
                    onClick={toggleMenu}
                    className="p-1 focus:outline-none hover:bg-blue-700 rounded-md transition-colors"
                    aria-label="Menu"
                >
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
                            absolute top-full left-0 w-full bg-blue-600 text-white shadow-xl z-50 overflow-hidden transition-all duration-300 ease-in-out
                            ${isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}
                        `}>
                    <nav className="flex flex-col border-t border-blue-500 text-lg">
                        <Link to="/" onClick={closeMenu} className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700">Home</Link>
                        <Link to="/history" onClick={closeMenu} className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700">History</Link>
                        <Link to="/record" onClick={closeMenu} className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700">Records</Link>
                        <Link to="/ranking" onClick={closeMenu} className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700">Rankings</Link>
                        {user ? (
                            <button onClick={handleLogout} className="text-right py-3 px-6 hover:bg-blue-700 text-blue-200">Logout</button>
                        ) : (
                            <Link to="/login" onClick={closeMenu} className="text-right py-3 px-6 hover:bg-blue-700">Login</Link>
                        )}
                    </nav>
                </div>
            </header>
        </>
    );
};