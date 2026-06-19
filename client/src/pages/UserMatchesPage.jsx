import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { useUsers } from '../hooks/useUsers';
import { useMatches } from '../hooks/useMatches';

import { UserCard } from '../components/card/UserCard';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';

export const UserMatchesPage = ({ viewMine = false }) => {
    const navigate = useNavigate();
    const { me, userList } = useUsers();
    const { matchHistory, isLoading: isMatchesLoading, isError } = useMatches();
    const [isMeOnly, setIsMeOnly] = useState(viewMine);

    if (isMatchesLoading || !userList) return <Loading />

    // 내 데이터 판별
    const isMyMatch = (match) => me?.id && (match.teamA.includes(me.id) || match.teamB.includes(me.id))
    // 필터가 활성화된 경우에만 필터링 수행, me.id가 없으면 빈 배열 반환
    const filteredData = isMeOnly
        ? matchHistory.filter(match => isMyMatch(match))
        : matchHistory;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('ko-kr', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    return (
        <div className="space-y-4">
            {filteredData.length > 0 ? (
                <>
                    <div className="space-y-4 border-b border-slate-700 pb-4">
                        <h1 className='pages-title'>경기 목록</h1>
                        <div className="text-right">
                            <Button size='sm' variant={isMeOnly ? 'blue' : 'gray'} onClick={() => setIsMeOnly(!isMeOnly)} >
                                {isMeOnly ? '모든 경기' : '내 경기만'}
                            </Button>
                        </div>
                    </div>

                    {filteredData.map(match => {
                        const isTeamAWin = match.winner === 'A';
                        const teamAUsers = userList.filter(user => match.teamA.includes(user.id));
                        const teamBUsers = userList.filter(user => match.teamB.includes(user.id));

                        return (
                            <div key={match.id} className={`relative text-white ${isMyMatch(match) ? 'bg-blue-500' : 'bg-slate-700'} rounded-2xl overflow-hidden shadow-xl`}>
                                <div className='flex items-center justify-between py-4 px-2'>
                                    {/* Team A */}
                                    <div className="flex-1 flex flex-col gap-2 items-start">
                                        <span className={`text-xs text-white p-1 rounded ${isTeamAWin ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                            TEAM A {isTeamAWin && 'WIN'}
                                        </span>
                                        <div className="space-y-1">
                                            {teamAUsers.length > 0
                                                ? teamAUsers.map(user => <UserCard key={user.id} user={user} onNavigate={true} />)
                                                : match.teamA.map(id => <div key={id} className="text-xs text-slate-500">Player {id}</div>)
                                            }
                                        </div>
                                    </div>

                                    {/* 경기 정보 */}
                                    <div className='flex flex-col items-center justify-center px-4'>
                                        <div className="text-2xl select-none">VS</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs font-medium">Elo</span>
                                            <span className="text-sm font-bold">+{match.eloDelta}</span>
                                        </div>
                                    </div>

                                    {/* Team B */}
                                    <div className="flex-1 flex flex-col gap-2 items-end text-right">
                                        <span className={`text-xs text-white p-1 rounded ${!isTeamAWin ? 'bg-rose-500' : 'bg-slate-300'}`}>
                                            TEAM B {!isTeamAWin && 'WIN'}
                                        </span>
                                        <div className="space-y-1">
                                            {teamBUsers.length > 0
                                                ? teamBUsers.map(user => <UserCard key={user.id} user={user} onNavigate={true} />)
                                                : match.teamB.map(id => <div key={id} className="text-xs text-slate-500">Player {id}</div>)
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-slate-900 px-4 py-1 text-xs text-white text-center'>
                                    {formatDate(match.matchDate)}
                                </div>
                            </div>
                        );
                    })}
                </>
            )
                : <Loading type='error' message='진행된 경기가 없거나, 에러가 발생했습니다.' />
            }
        </div>
    );
}