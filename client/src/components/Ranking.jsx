import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCard } from './card/UserCard'
import { useMatches } from '../hooks/useMatches'
import { useUsers } from '../hooks/useUsers'

export const Ranking = () => {
    const navigate = useNavigate();
    const [filterParam, setFilterParam] = useState({ type: 'period', value: 'total' }); // { type: 'period' | 'months', value: 'total' | 'weekly' | 'monthly' | '1' | '2' ... }
    const { userList } = useUsers();
    const { matchHistory, isLoading, isError } = useMatches(filterParam);
    
    const rankings = useMemo(() => {
        if (!userList || !matchHistory) return null;

        // 1. 유저별 통계 초기화
        const userStats = userList.reduce((acc, user) => {
            acc[user.id] = { 
                ...user, 
                wins: 0, 
                totalGames: 0,
                rating: user.rating || 1500 // 기본 점수
            };
            return acc;
        }, {});

        // ELO 변동 랭킹을 위한 별도 통계 초기화
        const userRatingChanges = userList.reduce((acc, user) => {
            acc[user.id] = { ...user, totalRatingChange: 0, totalGames: 0 };
            return acc;
        }, {});

        // 2. 경기 결과 반영 및 ELO 변동 계산
        matchHistory.forEach(match => {
            const isTeamAWin = match.winner === 'A';
            const winnerTeamIds = isTeamAWin ? match.teamA : match.teamB;
            const loserTeamIds = isTeamAWin ? match.teamB : match.teamA;
            const eloChangeMagnitude = match.eloDelta || 0;

            const allParticipants = [...match.teamA, ...match.teamB];

            allParticipants.forEach(id => {
                if (userStats[id]) {
                    userStats[id].totalGames += 1;
                    if (winnerTeamIds.includes(id)) {
                        userStats[id].wins += 1;
                    }
                }
                if (userRatingChanges[id]) {
                    userRatingChanges[id].totalGames += 1; // Rating change 랭킹도 최소 경기 수 필터링을 위해
                    if (winnerTeamIds.includes(id)) {
                        userRatingChanges[id].totalRatingChange += eloChangeMagnitude;
                    } else if (loserTeamIds.includes(id)) {
                        userRatingChanges[id].totalRatingChange -= eloChangeMagnitude;
                    }
                }
            });
        });

        const statsArray = Object.values(userStats);
        const ratingChangeStatsArray = Object.values(userRatingChanges);

        return {
            // ELO 기준 (실력순)
            byElo: [...statsArray].sort((a, b) => b.rating - a.rating).slice(0, 10),
            // 승률 기준 (최소 5경기 이상 참여자 중)
            byWinRate: statsArray
                .filter(u => u.totalGames >= 5)
                .map(u => ({ ...u, winRate: (u.wins / u.totalGames) * 100 }))
                .sort((a, b) => b.winRate - a.winRate)
                .slice(0, 10),
            // 활동량 기준 (최다 경기 참여)
            byActivity: [...statsArray].sort((a, b) => b.totalGames - a.totalGames).slice(0, 10),
            // ELO 변동 기준 (가장 많이 올린 사람)
            byRatingChange: ratingChangeStatsArray
                .filter(u => u.totalGames >= 5) // 최소 5경기 이상 참여자 중
                .sort((a, b) => b.totalRatingChange - a.totalRatingChange)
                .slice(0, 10)
        };
    }, [userList, matchHistory]);

    if (isLoading) return <div className="p-10 text-center">랭킹 산정 중...</div>;
    if (isError) return <div className="p-10 text-center text-red-500">데이터를 불러오지 못했습니다.</div>;

  return (
    <div className="space-y-8 pb-10">
        <h2 className="pages-title">RANKINGS</h2>

        {/* 기간 선택 탭 */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
            {/* 기본 기간 필터 */}
            {['total', 'weekly', 'monthly'].map((value) => (
                <button
                    key={value}
                    onClick={() => setFilterParam({ type: 'period', value })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all  cursor-pointer
                                ${filterParam.type === 'period' && filterParam.value === value ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                    {value === 'total' ? '전체' : value === 'weekly' ? '주간' : '월간'}
                </button>
            ))}
            {/* N개월 필터 */}
            {/* {[1, 2, 3].map((value) => (
                <button
                    key={`${value}month`}
                    onClick={() => setFilterParam({ type: 'months', value: value.toString() })}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all 
                                ${filterParam.type === 'months' && filterParam.value === value.toString() ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                    {value}개월
                </button>
            ))} */}
        </div>

        {/* ELO 랭킹 */}
        <section className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">🏆 실력 TOP 10 <span className="text-xs font-normal text-slate-400">(ELO)</span></h3>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                {rankings?.byElo.length === 0 && <p className="text-center text-slate-500">데이터가 없습니다.</p>}
                {rankings?.byElo.map((user, index) => (
                    <div 
                        key={user.id} 
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-100 rounded-lg px-2 transition-colors"
                        onClick={() => navigate(`/record/${user.id}`)}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`w-6 font-bold ${index < 3 ? 'text-amber-500' : 'text-slate-400'}`}>{index + 1}</span>
                            <UserCard user={user} onToggle={() => {}} />
                        </div>
                        <span className="font-mono font-bold text-blue-600">{user.rating}pt</span>
                    </div>
                ))}
            </div>
        </section>

        {/* 승률 랭킹 */}
        <section className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">🎯 승률 TOP 10 <span className="text-xs font-normal text-slate-400">(5경기 이상)</span></h3>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                {rankings?.byWinRate.length === 0 && <p className="text-center text-slate-500">데이터가 없습니다.</p>}
                {rankings?.byWinRate.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                            <span className={`w-6 font-bold ${index < 3 ? 'text-emerald-500' : 'text-slate-400'}`}>{index + 1}</span>
                            <UserCard user={user} onToggle={() => {}} />
                        </div>
                        <span className="font-mono font-bold text-emerald-600">{user.winRate.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </section>

        {/* 활동량 랭킹 */}
        <section className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">🔥 열정 TOP 10 <span className="text-xs font-normal text-slate-400">(경기 수)</span></h3>
            <div className="flex flex-wrap gap-3 justify-center">
                {rankings?.byActivity.length === 0 && <p className="text-center text-slate-500">데이터가 없습니다.</p>}
                {rankings?.byActivity.map((user, index) => (
                    <div key={user.id} className="flex flex-col items-center p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <UserCard user={user} onToggle={() => {}} />
                        <span className="text-xs mt-1 text-slate-500 font-bold">{user.totalGames}경기</span>
                    </div>
                ))}
            </div>
        </section>

        {/* ELO 변동 랭킹 */}
        <section className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">📈 ELO 상승 TOP 10 <span className="text-xs font-normal text-slate-400">(5경기 이상)</span></h3>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                {rankings?.byRatingChange.length === 0 && <p className="text-center text-slate-500">데이터가 없습니다.</p>}
                {rankings?.byRatingChange.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                            <span className={`w-6 font-bold ${index < 3 ? 'text-purple-500' : 'text-slate-400'}`}>{index + 1}</span>
                            <UserCard user={user} onToggle={() => {}} />
                        </div>
                        <span className={`font-mono font-bold ${user.totalRatingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {user.totalRatingChange > 0 ? '+' : ''}{user.totalRatingChange}pt
                        </span>
                    </div>
                ))}
            </div>
        </section>
    </div>
  )
}
