import React, { useState } from 'react'
import { useMatches } from '../hooks/useMatches';
import { useUsers } from '../hooks/useUsers';
import { Button } from './common/Button';
import { UserCard } from './card/UserCard';
import { useNavigate } from 'react-router-dom';

export const MatchHistory = ({ viewMine = false }) => {
    const navigate = useNavigate();
    const { me, userList } = useUsers();
    const { matchHistory, isLoading: isMatchesLoading, isError } = useMatches();
    const [isMeOnly, setIsMeOnly] = useState(viewMine);

    const handleUserClick = (id) => navigate(`/record/${id}`);

    if (isMatchesLoading || !userList) return <div className="py-20 text-center text-slate-400">데이터를 불러오는 중...</div>
    if (isError) return <div className="py-20 text-center text-red-400">에러가 발생했습니다.</div>

    // 필터가 활성화된 경우에만 필터링 수행, me.id가 없으면 빈 배열 반환
    const filteredData = isMeOnly 
        ? matchHistory.filter(match => me?.id && (match.teamA.includes(me.id) || match.teamB.includes(me.id)))
        : matchHistory;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('ko-kr', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    return (
        <div className='space-y-4'>
            <div className="space-y-4 border-b border-slate-700 pb-4">
                <h1 className='pages-title'>MATCHES</h1>
                <div className="text-right">
                    <Button
                        size='sm'
                        variant={isMeOnly ? 'blue' : 'gray'}
                        onClick={() => setIsMeOnly(!isMeOnly)}
                        className=''
                    >
                        {isMeOnly ? '모든 경기' : '내 경기만'}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredData.length > 0 ? (
                    filteredData.map(match => {
                        const isTeamAWin = match.winner === 'A';
                        const teamAUsers = userList.filter(user => match.teamA.includes(user.id));
                        const teamBUsers = userList.filter(user => match.teamB.includes(user.id));

                        return (
                            <div key={match._id} className='relative text-white bg-slate-700  rounded-2xl overflow-hidden shadow-xl'>
                                {/* <div className={`absolute top-0 bottom-0 w-2 ${isTeamAWin ? 'left-0 bg-blue-500' : 'right-0 bg-rose-500'}`} /> */}

                                <div className='flex items-center justify-between py-4 px-2'>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs text-white p-1 rounded ${isTeamAWin ? 'bg-blue-500 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                                TEAM A
                                                 {isTeamAWin && <span> WIN</span>}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {teamAUsers.length > 0 
                                                ? teamAUsers.map(user => <UserCard key={user.id} user={user} onToggle={handleUserClick}/>)
                                                : match.teamA.map(id => <div key={id} className="text-xs text-slate-500">Player {id}</div>)
                                            }
                                        </div>
                                    </div>

                                    {/* 경기 결과 정보 (중앙) */}
                                    <div className='flex flex-col items-center justify-center px-4 min-w-[100px]'>
                                        <div className="text-2xl select-none">VS</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs font-medium">Rating</span>
                                            <span className="text-sm font-bold">+{match.eloDelta}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-2 items-end text-right">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs text-white p-1 rounded ${!isTeamAWin ? 'bg-rose-500 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
                                                TEAM B
                                                 {!isTeamAWin && <span> WIN</span>}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {teamBUsers.length > 0 
                                                ? teamBUsers.map(user => <UserCard key={user.id} user={user} onToggle={handleUserClick}/>)
                                                : match.teamB.map(id => <div key={id} className="text-xs text-slate-500">Player {id}</div>)
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* 하단 날짜 정보 */}
                                <div className='bg-slate-900 px-4 py-1 text-xs text-white text-center'>
                                    {formatDate(match.matchDate)}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="py-20 px-4 text-black text-center bg-slate-500/50 rounded-2xl border border-dashed border-slate-800">
                        기록된 경기가 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}