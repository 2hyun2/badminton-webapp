import React from 'react';
import { UserCard } from '../card/UserCard';
import { Button } from '../common/Button';
import { useUsers } from '../../hooks/useUsers';


export const MatchCard = ({ match = {}, onOpenModal }) => {
    const { me, userList } = useUsers();

    const { matchId, matchMode, matchType, teamA, teamB } = match
    const teamAPlayers = teamA.map(id => userList.find(user => user.id === id));
    const teamBPlayers = teamB.map(id => userList.find(user => user.id === id));

    const isAdmin = me?.role === 'ADMIN';

    // match 변수 대신 props로 받은 players를 사용하고, 객체 배열이므로 some으로 ID 체크
    const isPlayerInMatch = teamAPlayers.some(p => p.id === me?.id) || teamBPlayers.some(p => p.id === me?.id);
    const hasPermission = isAdmin || isPlayerInMatch;

    const calculateAvg = (player) => {
        if (player.length === 0) return 0;
        const sum = player.reduce((acc, p) => acc + p.rating, 0);
        return Math.round(sum / player.length);
    };

    const avgA = calculateAvg(teamAPlayers);
    const avgB = calculateAvg(teamBPlayers);

    return (
        <div className="relative w-full bg-slate-700 text-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-800 p-2 flex items-center justify-between border-b border-white/50">
                <span className="text-xs font-bold text-white tracking-wider">MATCH #{matchId}</span>
                {hasPermission && (<Button onClick={() => onOpenModal(matchId)} variant="blue" className="h-6 text-xs rounded">결과 입력</Button>)}
                <div className="flex gap-1">
                    <span className="text-xs font-bold">{matchType === 'SINGLE' ? '1대1' : '2대2'}</span>
                    <span className={`text-xs font-bold ${matchMode === 'RANKED' ? 'text-rose-500' : 'text-emerald-300'}`}>{matchMode === 'RANKED' ? '랭크전' : '친선전'}</span>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs py-4 px-2">
                {/* TEAM A */}
                <div className="flex-1 space-y-2">
                    <div className="flex flex-col gap-1 items-start">
                        <span className="text-white  font-bold bg-blue-500 px-2 py-0.5 rounded">TEAM A</span>
                        <span className="font-bold">Avg. {avgA}</span>
                    </div>
                    {teamAPlayers.map(player => (<UserCard key={player.id} user={player} onNavigate={true} />))}
                </div>

                {/* VS 영역 */}
                <div className='content-center px-2 min-w-[60px] text-center'>
                    <span className="text-xl font-black italic select-none">VS</span>
                </div>

                {/* TEAM B */}
                <div className="flex-1 space-y-2 text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-white  font-bold bg-rose-500 px-2 py-0.5 rounded">TEAM B</span>
                        <span className="font-bold">Avg. {avgB}</span>
                    </div>
                    {teamBPlayers.map(player => (<UserCard key={player.id} user={player} onNavigate={true} />))}
                </div>
            </div>

            {/* 하단 바: 밸런스 정보 */}
            <div className="bg-slate-900 px-4 py-1.5 text-[10px] font-bold text-slate-500 text-center border-t border-slate-800">
                팀 전력 차이: {Math.abs(avgA - avgB)}pt
            </div>

        </div>
    );
};