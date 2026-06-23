import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import useAuthStore from '../../store/useAuthStore';

import { useUsers } from '../../hooks/useUsers';
import { useSocket } from '../../hooks/useSocket';
import { useAuthMutation } from '../../hooks/useAuth';

import { UserCard } from '../../components/card/UserCard'

export const Header = () => {
    // 메뉴 on/off
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // react-router-dom - navigate
    const navigate = useNavigate();
    // zustand
    const { user } = useAuthStore(); // 회원: 유저 로그인 정보,
    // react query
    const { me, userList } = useUsers(); // 내 정보, 유저 리스트 
    const { logoutMutation } = useAuthMutation(); // 로그아웃
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

    // socket 정리
    const isMatchStatus = matchSocket?.type === 'START'

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
    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync(user.id)
            closeMenu();
            alert('로그아웃 되었습니다.');
            navigate('/login', { replace: true });
        } catch (error) {}
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
                    <Link to="/" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">메인</Link>
                    <Link to="/members" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">회원 목록</Link>
                    <Link to="/ranking" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">종합 순위</Link>
                    <Link to="/record" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">개인 기록</Link>
                    <Link to="/history" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">경기 목록</Link>
                    <Link to="/mypage" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">내 정보</Link>
                    {user ? (
                        <>
                            <button onClick={handleLogout} className="w-full text-right border-b border-slate-100 p-2 cursor-pointer [text-shadow:_0_0_2px_rgb(96_165_250_/_0.8)] hover:bg-blue-700">로그아웃</button>
                            {user.role === 'ADMIN' && (
                                <Link to="/admin" onClick={closeMenu} className="bg-red-500 text-white border-b border-slate-100 p-2">관리자 페이지</Link>
                            )}
                        </>
                    ) : (
                        <Link to="/login" onClick={closeMenu} className="border-b border-slate-100 p-2 hover:bg-blue-700">로그인</Link>
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
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white border border-white rounded-2xl shadow-2xl overflow-hidden">

                        <div className={`relative text-white text-center p-2 ${isMatchStatus ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-blue-500 to-blue-900'}`}>
                            <h2 className="text-2xl font-black tracking-wide">{isMatchStatus ? '경기 시작!' : '경기 종료!'}</h2>
                            <span className="text-base">{matchSocket.matchType === 'SINGLE' ? '1대1' : '2대2'} - {matchSocket.matchMode === 'RANKED' ? '랭크전' : '친선전'}</span>
                            <div className="absolute top-2 left-2 text-sm font-medium">#{matchSocket?.matchId}</div>
                        </div>

                        <div className="py-4 px-2 text-center">
                            <div className="space-y-4">
                                <div className="">
                                    <p className="text-lg text-slate-800 font-bold">{isMatchStatus ? '경기가 배정되었습니다!' : '경기가 종료되었습니다.'}</p>
                                    <p className="text-base text-slate-600 font-bold">{isMatchStatus
                                        ? '코트로 이동해 주세요.' :
                                        (matchSocket.matchMode === 'RANKED' ? 'Rating 변동이 있습니다.' : '수고하셨습니다!')}
                                    </p>
                                </div>

                                <div className="flex justify-between border border-slate-300 rounded shadow p-2">
                                    {/* TEAM A */}
                                    <div className="space-y-2 w-full border border-slate-100 rounded shadow p-2">
                                        <h4 className="title text-lg text-red-500 font-bold ">TEAM A {matchSocket?.type === 'END' && (<span className='text-[95%]'>{matchSocket.winner === 'A' ? '승' : '패'}</span>)}</h4>
                                        {matchSocket.teamA
                                            .filter(user => user)
                                            .map(user => <UserCard user={userList.find(u => u.id === user)} />)
                                        }
                                    </div>
                                    {/* TEAM B */}
                                    <div className="space-y-2 w-full border border-slate-100 rounded shadow p-2">
                                        <h4 className="title text-lg text-blue-500 font-bold ">TEAM B {matchSocket?.type === 'END' && (<span className='text-[95%]'>{matchSocket.winner === 'A' ? '패' : '승'}</span>)}</h4>
                                        {matchSocket.teamB
                                            .filter(user => user)
                                            .map(user => <UserCard user={userList.find(u => u.id === user)} />)
                                        }
                                    </div>
                                </div>
                                {/* rating 변화 */}
                                {matchSocket.eloDelta !== 0  && matchSocket.eloDelta &&
                                    <div className="relative flex flex-col items-center justify-center text-white font-bold text-center bg-blue-500 py-1 px-2 rounded shadow">
                                        <span className="text-base">Elo 변화 ±{matchSocket.eloDelta}</span>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="p-2 border-t border-slate-100 flex gap-2">
                            <button onClick={() => setMatchSocket(null)} className={`w-full py-2 text-white font-bold rounded-lg shadow-md cursor-pointer ${isMatchStatus ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                                {isMatchStatus ? '경기장 입장하기' : '확인했습니다.'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};