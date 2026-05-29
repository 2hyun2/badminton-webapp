import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { useUsers } from '../../hooks/useUsers';
import { useSocket } from '../../hooks/useSocket';
import { UserCard } from '../../components/card/UserCard'

export const Header = () => {
    // 메뉴 on/off
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // react-router-dom - navigate
    const navigate = useNavigate();
    // zustand
    const { user, logoutUser } = useAuthStore(); // 회원: 유저 로그인 정보, 로그아웃
    // react query
    const { me, userList } = useUsers(); // 내 정보, 유저 리스트 
    // socket
    const { connectSocket, disconnectSocket, socketOn, socketOff } = useSocket(); // 소켓 연결, 소켓 연결해제, 소켓 이벤트, 소켓 이벤트 해제

    // useState
    const [userSocket, setUserSocket] = useState(null); // socket - user { login, logout, update } update 미사용
    const [matchSocket, setMatchSocket] = useState(null); // socket - match { matchStart, matchEnd } 작업중
    const [isAlertOpen, setIsAlertOpen] = useState(false); // userSocket - animation State

    // useRef
    const timeRef = useRef(null); // userSocket - setIsAlertOpen 타이머 제어 Ref
    const socketRef = useRef({ socketOn, socketOff });  //  socket을 Ref에 담아 재렌더링 현상을 막음

    // useEffect
    useEffect(() => { // useEffect를 사용해 socketOn, socketOff 데이터의 변화가 있을시 socketRef에 값 재할당
        socketRef.current = { socketOn, socketOff };
    }, [socketOn, socketOff]);

    useEffect(() => { // 소켓 연결, 해제
        if (user?.id) {
            connectSocket(user.id);
        }
        return () => {
            disconnectSocket();
        };
    }, [user?.id, connectSocket, disconnectSocket]);

    // mount 시 userSocket 이벤트 1회 등록 // unMount 시 userSocket, timer 이벤트 해제
    useEffect(() => {
        const handleUserOnOff = (data) => {
            clearTimeout(timeRef.current);

            setUserSocket(data);
            setIsAlertOpen(true);

            timeRef.current = setTimeout(() => {
                setIsAlertOpen(false);
            }, 5000);

            switch (data.type) {
                case 'ENTRY': break;
                case 'EXIT': break;
                case 'UPDATE': break;
            }
        };

        socketRef.current.socketOn('users:update', handleUserOnOff);

        return () => {
            socketRef.current.socketOff('users:update', handleUserOnOff);
            clearTimeout(timeRef.current);
        };
    }, []);

    // matchSocket 처리
    useEffect(() => {
        const handleUserMatch = (data) => {
            if (data.type === 'START' || data.type === 'END') {
                setMatchSocket(data);
            }
        };

        socketRef.current.socketOn('match:update', handleUserMatch);

        return () => {
            socketRef.current.socketOff('match:update', handleUserMatch);
        };
    }, []);

    // 현재 me 의 상태에 따른 style 분기
    const myStand = () => {
        if (!me) return { color: 'bg-blue-600', text: '로그인 필요' };
        if (!me.isPresent) return { color: 'bg-gray-400', text: '입장을 눌러주세요.' };

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
    // me 의 상태에 따른 style 분기 실행 결과값 
    const statusInfo = myStand();
    // menu 실행 함수
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    // 로그아웃 클릭시 실행될 함수 
    const handleLogout = () => {
        logoutUser();
        alert('로그아웃 되었습니다.');
        closeMenu();
        navigate('/login', { replace: true });
    };

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
            <div className={`absolute top-full left-0 right-0 w-full text-white ${statusInfo.color} z-50 overflow-hidden transition-all duration-300 ease ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-[0px] opacity-0'}`}>
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

            {/* userSocket 입장/퇴장 */}
            {(userSocket && userSocket.type !== 'UPDATE') && (
                <div className={`absolute top-full inset-x-0 overflow-hidden transition-all duration-1000 linear z-10 opacity-75 ${isAlertOpen ? 'max-h-[50px]' : 'max-h-0'}`}>
                    <div className={`text-base font-bold text-center text-white py-0.5 px-1 shadow ${userSocket.type === 'ENTRY' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {`${userSocket?.user?.name}님이 ${userSocket.type === 'ENTRY' ? '입장' : '퇴장'}하셨습니다.`}
                    </div>
                </div>
            )}

            {/* 경기 매칭 시작 / 종료 전체 화면 팝업 모달 */}
            {matchSocket && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-sm bg-white border border-white rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">

                        <div className={`p-4 text-white text-center ${matchSocket.type === 'START' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
                            <h2 className="text-2xl font-black tracking-wide">
                                {matchSocket.type === 'START' ? 'MATCH START!' : 'MATCH END'}
                            </h2>
                        </div>

                        <div className="p-4 text-center">
                            {matchSocket.type === 'START' ? (
                                <div className="space-y-4">
                                    <p className="text-lg text-slate-800 font-bold">새로운 경기가 배정되었습니다!</p>
                                    <p className="text-base text-slate-600 font-bold">코트로 이동하여 경기를 준비해 주세요.</p>

                                    <div className="flex justify-between border border-slate-300 rounded shadow p-2">
                                        {/* TEAM A */}
                                        <div className="space-y-2 w-full border border-slate-100 rounded shadow p-2">
                                            <h4 className="title text-lg text-red-500 font-bold ">TEAM A</h4>
                                            <UserCard user={userList.find(u => u.id === matchSocket.teamA[0])} />
                                            <UserCard user={userList.find(u => u.id === matchSocket.teamA[1])} />
                                        </div>
                                        {/* TEAM B */}
                                        <div className="space-y-2 w-full border border-slate-100 rounded shadow p-2">
                                            <h4 className="title text-lg text-blue-500 font-bold ">TEAM B</h4>
                                            <UserCard user={userList.find(u => u.id === matchSocket.teamB[0])} />
                                            <UserCard user={userList.find(u => u.id === matchSocket.teamB[1])} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-lg text-slate-800 font-bold">경기가 종료되었습니다.</p>
                                    <div className="relative flex justify-between border border-slate-300 rounded shadow p-2">
                                        {/* TEAM A */}
                                        <div className={`relative space-y-2 w-full border rounded shadow p-2`}>
                                            <div className="flex items-center justify-center gap- text-lg text-red-500 font-bold text-center">
                                                <h4 className="">TEAM A</h4>
                                                {matchSocket.winner === 'A' && <span className="">WIN</span>}
                                            </div>
                                            <UserCard user={userList.find(u => u.id === matchSocket.teamA[0])} />
                                            <UserCard user={userList.find(u => u.id === matchSocket.teamA[1])} />
                                        </div>
                                        {/* TEAM B */}
                                        <div className={`relative space-y-2 w-full border rounded shadow p-2`}>
                                            <div className="flex items-center justify-center gap-1 text-lg text-blue-500 font-bold text-center">
                                                <h4 className="">TEAM B</h4>
                                                {matchSocket.winner === 'B' && <span className="">WIN</span>}
                                            </div>
                                            <UserCard user={userList.find(u => u.id === matchSocket.teamB[0])} />
                                            <UserCard user={userList.find(u => u.id === matchSocket.teamB[1])} />
                                        </div>
                                    </div>
                                    {/* rating 변화 */}
                                    {matchSocket.eloDelta &&
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center text-white font-bold text-center bg-black py-1 px-2 rounded shadow">
                                            <span className="text-xl">± {matchSocket.eloDelta}</span>
                                        </div>
                                    }

                                    {/* <p className="text-xs text-indigo-600 font-medium bg-indigo-50 py-1 px-2 rounded inline-block"> */}
                                    {/* 레이팅 점수가 대시보드에 실시간 반영되었습니다. */}
                                    {/* </p> */}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 flex gap-2">
                            <button
                                onClick={() => setMatchSocket(null)}
                                className={`w-full py-4 rounded-xl text-white font-bold shadow-md cursor-pointer ${matchSocket.type === 'START' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'}`}
                            >
                                {matchSocket.type === 'START' ? '경기장 입장하기' : '확인'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};