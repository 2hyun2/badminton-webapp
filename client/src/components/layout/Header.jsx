import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { useUsers } from '../../hooks/useUsers';

export const Header = ({ onMatchCreate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logoutUser } = useAuthStore();
    const { userList, entryMutation, exitMutation } = useUsers();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    // 현재 접속 유저의 출석 상태 확인
    const isPresent = userList.some(u => u.id === user?.id);

    const handleLogout = () => {
        logoutUser();
        alert('로그아웃 되었습니다.');
        closeMenu();
        navigate('/login', { replace: true });
    };

    const handleEntry = () => {
        if (!user) return;
        entryMutation.mutate(user.id);
    };

    const handleExit = () => {
        if (!user) return;
        if (!window.confirm("정말 퇴장하시겠습니까? 경기 중일 경우 무효화됩니다.")) return;
        exitMutation.mutate(user.id);
    };

    return (
        <header className="sticky top-0 flex justify-between items-center w-full text-xl text-white font-bold bg-blue-600 py-2 px-4 shadow-md">
            {/* 로고 텍스트 (/) */}
            <Link to="/" onClick={closeMenu}>
                <h1 className="flex items-center gap-2">🏸</h1>
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
                    <button 
                        onClick={() => { onMatchCreate(); closeMenu(); }} 
                        className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700 transition-colors"
                    >
                        매칭 짜기
                    </button>
                    <Link to="/" onClick={closeMenu} className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700">Home</Link>
                    <Link to="/record" onClick={closeMenu} className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700">Records</Link>
                    <Link to="/ranking" onClick={closeMenu} className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700">Rankings</Link>
                    
                    {user && (
                        <div className="p-4 bg-blue-700 flex flex-col gap-2 border-b border-blue-500">
                            {isPresent ? (
                                <button onClick={handleExit} className="w-full py-2 bg-red-500 rounded text-sm">퇴장하기 (Exit)</button>
                            ) : (
                                <button onClick={handleEntry} className="w-full py-2 bg-emerald-500 rounded text-sm">입장하기 (Entry)</button>
                            )}
                        </div>
                    )}

                    {user ? (
                        <button onClick={handleLogout} className="text-right py-3 px-6 hover:bg-blue-700 text-blue-200">Logout</button>
                    ) : (
                        <Link to="/login" onClick={closeMenu} className="text-right py-3 px-6 hover:bg-blue-700">Login</Link>
                    )}
                </nav>
            </div>
        </header>
    );
};