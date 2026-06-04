import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCard } from '../components/card/UserCard'
import { useUsers } from '../hooks/useUsers'
import { useMatches } from '../hooks/useMatches'

export const UserRankingPage = () => {
    const navigate = useNavigate();
    // filter 값을 React Query - useMatches 로 보내 새로운 데이터 수신
    const [filterParam, setFilterParam] = useState({ type: 'period', value: 'total' }); // { type: 'period' | 'months', value: 'total' | 'weekly' | 'monthly' | '1' | '2' ... }
    const { matchHistory, isLoading, isError } = useMatches(filterParam);
    const { userList } = useUsers();

    const rankings = useMemo(() => { // 핵심 로직
        if (!userList || !matchHistory) return null;
        // 판별 데이터 1 {wins, totalGames, rating}
        const userStats = userList.reduce((acc, user) => {
            acc[user.id] = {
                ...user,
                wins: 0,
                totalGames: 0,
                rating: user.rating || 0
            };
            return acc;
        }, {});
        // 판별 데이터 2 { totalRatingChange, totalGames }
        const userRatingChanges = userList.reduce((acc, user) => {
            acc[user.id] = { ...user, totalRatingChange: 0, totalGames: 0 };
            return acc;
        }, {});
        // 기간으로 불러온 matchHistory 
        matchHistory.forEach(match => {
            const isTeamAWin = match.winner === 'A'; // 승리 분기 기준 = return Boolean
            const winnerTeamIds = isTeamAWin ? match.teamA : match.teamB; // 이긴 팀 배열 [1, 2]
            const loserTeamIds = isTeamAWin ? match.teamB : match.teamA; // 진 팀 배열 [3, 4]
            const eloChangeMagnitude = match.eloDelta || 0; // 해당 경기 elo 점수

            const allParticipants = [...match.teamA, ...match.teamB]; // 해당 경기 전체 참석자 [1, 2, 3, 4]

            allParticipants.forEach(id => {
                if (userStats[id]) { // 판별 데이터 1에 경기수 +=1, 승리팀일시 승리 +=1
                    userStats[id].totalGames += 1;
                    if (winnerTeamIds.includes(id)) {
                        userStats[id].wins += 1;
                    }
                }
                if (userRatingChanges[id]) { // 판별 데이터 2에 경기수 +=1, 
                    userRatingChanges[id].totalGames += 1;
                    if (winnerTeamIds.includes(id)) { // 이긴팀 일시 += 진팀일시 -= 0점에서 ± 처리
                        userRatingChanges[id].totalRatingChange += eloChangeMagnitude;
                    } else if (loserTeamIds.includes(id)) {
                        userRatingChanges[id].totalRatingChange -= eloChangeMagnitude;
                    }
                }
            });
        });
        // {key: value} => [value]
        const statsArray = Object.values(userStats);
        const ratingChangeStatsArray = Object.values(userRatingChanges);

        return { // 모든 데이터 기준은 초기 기간 필터에 따라 달라짐 
            // 점수 순위
            byElo: [...statsArray].sort((a, b) => b.rating - a.rating).slice(0, 10),
            // 승률 순위
            byWinRate: statsArray
                .filter(u => u.totalGames >= 5) // 최소 5경기 이상
                .map(u => ({ ...u, winRate: (u.wins / u.totalGames) * 100 })) // 승률 계산식
                .sort((a, b) => b.winRate - a.winRate) // 정렬
                .slice(0, 10), // 최대 10명
            // 최다 경기 순위
            byActivity: [...statsArray].sort((a, b) => b.totalGames - a.totalGames).slice(0, 10),
            // 점수 최다 변동 순위
            byRatingChange: ratingChangeStatsArray
                .filter(u => u.totalGames >= 5) // 최소 5경기 이상 참여자 중
                .sort((a, b) => Math.abs(b.totalRatingChange) - Math.abs(a.totalRatingChange)) // Math.abs()를 씌워 -50도 50으로, +50도 50으로 변환
                .slice(0, 10)
        };
    }, [userList, matchHistory]);

    if (isLoading) return <div className="p-10 text-center">로딩중</div>;
    if (isError) return <div className="p-10 text-center text-red-500">데이터를 불러오지 못했습니다.</div>;

    return (
        <div className="space-y-8">
            <h2 className="pages-title">종합 순위</h2>

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

            {/* 점수 TOP 10 (ELO) */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-center">점수 TOP 10 (ELO)</h3>
                <div className="bg-slate-100 border border-slate-300 rounded-xl shadow overflow-hidden">
                    {rankings?.byElo.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between border-b border-slate-300 p-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-4 font-bold text-center ${index < 3 ? 'text-amber-500' : 'text-slate-900'}`}>{index + 1}</span>
                                <UserCard user={user} onNavigate={() => {true}} />
                            </div>
                            <span className="font-bold text-blue-600">{user.rating}점</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 승률 TOP 10 */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-center">승률 TOP 10 <span className="text-xs">(5경기 이상)</span></h3>
                <div className="bg-slate-100 border border-slate-300 rounded-xl shadow overflow-hidden">
                    {rankings?.byWinRate.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between border-b border-slate-300 p-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-4 font-bold text-center ${index < 3 ? 'text-emerald-500' : 'text-slate-900'}`}>{index + 1}</span>
                                <UserCard user={user} onNavigate={() => {true}} />
                            </div>
                            <span className="font-bold text-emerald-600">{user.winRate.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 열정 TOP 10 */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-center">열정 TOP 10 <span className="text-xs">(경기 수)</span></h3>
                <div className="bg-slate-100 border border-slate-300 rounded-xl shadow overflow-hidden">
                    {rankings?.byActivity.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between border-b border-slate-300 p-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-4 font-bold text-center ${index < 3 ? 'text-red-500' : 'text-slate-900'}`}>{index + 1}</span>
                                <UserCard user={user} onNavigate={() => {true}} />
                            </div>
                            <span className="text-red-400 font-bold">{user.totalGames}경기</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 점수 변화 TOP 10 */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-center">점수 변화 TOP 10 <span className="text-xs font-normal text-slate-400">(5경기 이상) && ±</span></h3>
                <div className="bg-slate-100 border border-slate-300 rounded-xl shadow overflow-hidden">
                    {rankings?.byRatingChange.length === 0 && <p className="text-center text-slate-500">데이터가 없습니다.</p>}
                    {rankings?.byRatingChange.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between border-b border-slate-300 p-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-4 font-bold text-center ${index < 3 ? 'text-blue-500' : 'text-slate-400'}`}>{index + 1}</span>
                                <UserCard user={user} onNavigate={() => {true}} />
                            </div>
                            <span className={`font-bold ${user.totalRatingChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {user.totalRatingChange > 0 ? '+' : ''}{user.totalRatingChange}점
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
