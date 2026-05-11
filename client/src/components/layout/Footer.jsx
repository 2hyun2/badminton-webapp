import React from 'react'
import useAuthStore from '../../store/useAuthStore'
import { useUsers } from '../../hooks/useUsers';
import { useSocket } from '../../hooks/useSocket'; // useSocket 훅 임포트

export const Footer = ({ onMatchCreate }) => {
    const { user } = useAuthStore();
    const { entryMutation, exitMutation } = useUsers();

    const handleEntry = () => {
        if (!user) return;
        entryMutation.mutate(user.id);
    };

    const handleExit = () => {
        if (!user) return;
        if (!window.confirm("정말 퇴장하시겠습니까? 경기 중일 경우 무효화됩니다.")) return;
        exitMutation.mutate(user.id);
    };


    const btnBase = "flex items-center justify-center w-12 h-12 text-sm text-white font-bold rounded-full shadow-lg opacity-60 hover:opacity-100 transition-all duration-200 hover:-translate-y-1 active:scale-95";

    return (
        <footer className='relative w-full'>
            {user ? (
                <div id="sideNav" className='absolute bottom-[calc(100%+0.5rem)] left-2 z-10'>
                    {user.isPresent ? (
                        <div className="flex flex-col gap-2">
                            <button onClick={handleExit} className={`${btnBase} bg-rose-500 hover:bg-rose-600`} >퇴장</button>
                            <button onClick={onMatchCreate} className={`${btnBase} bg-blue-500 hover:bg-blue-600`} >매칭</button>
                        </div>
                    ) : (
                        <button onClick={handleEntry} className={`${btnBase} bg-emerald-500 hover:bg-emerald-600`} >입장</button>
                    )}
                </div>
            ) : (
                <div className="text-center bg-slate-50 border-t p-2">
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li className="font-semibold text-slate-900">본 페이지는 로그인 후 이용 가능합니다.</li>
                        <li>회원가입 시 ID/PASSWORD 제한이 없습니다. <br /><span className="text-rose-500 font-bold text-xs">※ 본인의 개인정보를 최소화 하세요.</span></li>
                        <li>문의, 개선/에러 사항은 소통 채널을 이용해 주세요.
                            <ul className="text-blue-600">
                                <li><a href="https://open.kakao.com/me/isHyun" target="_blank" rel="noreferrer" className="hover:underline">카카오톡 오픈 챗 문의</a></li>
                                <li><a href="mailto:eventietter@naver.com" className="hover:underline">eventietter@naver.com</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            )}
        </footer>
    );
};