import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logoutUser } = useAuthStore();

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
            {user ?
                <header className="relative flex justify-between items-center w-full text-xl text-white font-bold bg-blue-600 py-2 px-4 shadow-md">
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
                            <Link to="/" onClick={closeMenu} className="text-right border-b border-blue-500 py-3 px-6 hover:bg-blue-700">Home</Link>
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
                : null
            }
        </>
    );
};