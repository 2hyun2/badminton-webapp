import { useLocation } from 'react-router-dom';

import useAuthStore from '../../store/useAuthStore'

import { useUsers } from '../../hooks/useUsers';

export const ProtectedFooter = ({ onMatchCreate, onStatusToggle }) => {
    const location = useLocation();
    const isMainPage = location.pathname === '/';

    const { user } = useAuthStore();
    const { me, entryMutation, exitMutation } = useUsers();

    const handleEntry = () => {
        if (!user) return;
        entryMutation.mutate(user.id);
    };

    const handleExit = () => {
        if (!user) return;
        if (!window.confirm("정말 퇴장하시겠습니까? 경기 중일 경우 무효화됩니다.")) return;
        exitMutation.mutate(user.id);
    };

    const btnBase = "flex items-center justify-center w-12 h-12 text-sm text-white font-bold rounded-full shadow-lg opacity-60 hover:opacity-100 transition-all ease-200";

    return (
        <footer className='relative w-full'>
            {isMainPage // 메인 페이지 일시에만 버튼 활성화
                ? <div id="sideNav" className='absolute bottom-[calc(100%+0.5rem)] left-2 z-10'>
                    {me ? (
                        <>
                            {me?.isPresent
                                ? (
                                    me?.status !== 'PLAYING'
                                    ?
                                    <div className="flex flex-wrap gap-2">
                                        {me?.status === 'WAITING' ? <button onClick={onMatchCreate} className={`${btnBase} bg-blue-500 hover:bg-blue-600`} >매칭</button> : null}
                                        <button
                                            onClick={onStatusToggle}
                                            className={`${btnBase} transition-colors ${me?.status === 'WAITING' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                                            {me?.status === 'WAITING' ? '휴식' : '대기'}
                                        </button>
                                        <button onClick={handleExit} className={`${btnBase} bg-rose-500 hover:bg-rose-600`} >퇴장</button>
                                    </div>
                                    : null
                                )
                                : <button onClick={handleEntry} className={`${btnBase} bg-emerald-500 hover:bg-emerald-600`} >입장</button>
                            }
                        </>
                    ) : null
                    }
                </div>
                : null
            }
        </footer>
    );
};