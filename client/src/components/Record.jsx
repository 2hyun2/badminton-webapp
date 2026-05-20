import React, { useState, useMemo } from 'react'
import { useUsers } from '../hooks/useUsers'
import { useMatches } from '../hooks/useMatches'
import { useNavigate, useParams } from 'react-router-dom'
import { UserCard } from './card/UserCard'

export const Record = () => {
    const navigate = useNavigate();
    const { id: paramId } = useParams(); // URL의 :id 파라미터와 이름을 맞춰야 합니다.

    // React Query
    const { me, userList } = useUsers();
    const { matchHistory, isLoading, isError } = useMatches();

    // 조회 대상 유저 결정: 파라미터가 있으면 해당 유저, 없으면 나(me)
    const targetUser = useMemo(() => {
        if (!paramId) return me;
        // paramId가 문자열로 오므로 숫자로 변환하여 userList에서 찾습니다.
        return userList?.find(u => u.id === Number(paramId));
    }, [paramId, userList, me]);

    // 최근 경기 수 default: 10
    const [viewCount, setViewCount] = useState(10);

    // matchHistory - 대상 유저가 참여한 경기
    const allTargetMatches = useMemo(() => {
        if (!matchHistory || !targetUser?.id) return [];
        return matchHistory
            .filter(match => match?.teamA?.includes(targetUser.id) || match?.teamB?.includes(targetUser.id))
            // 최근 경기가 항상 배열 앞쪽으로 오도록 명시적 정렬 추가
            .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
    }, [matchHistory, targetUser?.id]);

    // 사용자 경기수, 최근 경기수 최소값 찾기
    const effectiveViewCount = Math.min(viewCount, allTargetMatches.length);

    // 전체 경기 잘라내기
    const displayedMatches = useMemo(() => {
        return allTargetMatches.slice(0, effectiveViewCount);
    }, [allTargetMatches, effectiveViewCount]);

    // 경기 데이터를 기반으로 추가 가공
    const stats = useMemo(() => {
        if (displayedMatches.length === 0) return null;

        let totalWins = 0; // 내가 이긴 판 수
        const partnerStats = {}; // 같은 팀원별 판 수 및 이긴 판 수 저장소 { 유저ID: { games, wins } }
        const opponentStats = {}; // 상대 팀원별 판 수 및 진 판 수 저장소 { 유저ID: { games, losses } }
        const frequentCounts = {}; // 같이 게임한 모든 유저의 빈도수 저장소 { 유저ID: 만난 횟수 }

        displayedMatches.forEach(match => {
            const isTeamA = match.teamA.includes(targetUser.id); // 대상 유저가 Team A에 속해있는지 여부
            const myTeam = isTeamA ? match.teamA : match.teamB; // 내가 속한 팀 배열 구하기
            const enemyTeam = isTeamA ? match.teamB : match.teamA; // 내가 맞선 상대 팀 배열 구하기

            // 승리 판정 TeamA && A || TeamB && B
            const isWin = match.winner === (isTeamA ? "A" : "B");
            if (isWin) totalWins++; // 승리 카운트 +1

            myTeam.forEach(played => { // 내가 속한 팀 배열 반복문
                if (played === targetUser.id) return; // 대상 유저 본인 제외
                frequentCounts[played] = (frequentCounts[played] || 0) + 1; // 만난 빈도수 누적

                // 파트너 통계 객체 생성 및 누적 (판 수 추가, 이겼으면 승리 수 추가)
                if (!partnerStats[played]) partnerStats[played] = { games: 0, wins: 0 };
                partnerStats[played].games++;
                if (isWin) partnerStats[played].wins++;
            });

            enemyTeam.forEach(played => { // 상대 팀 배열 반복문
                frequentCounts[played] = (frequentCounts[played] || 0) + 1;
                // 천적 통계 객체 생성 및 누적 (판 수 추가, 내가 졌으면 상대의 패배 안겨준 수 추가)
                if (!opponentStats[played]) opponentStats[played] = { games: 0, losses: 0 };
                opponentStats[played].games++;
                if (!isWin) opponentStats[played].losses++; // 내가 졌을 때 상대방의 '나를 이긴 횟수(losses)' 증가
            });
        });

        // 유저 ID를 가지고 유저 객체 찾아주는 헬퍼 함수
        const getUserObjectById = (id) => userList?.find(u => u.id === id);

        const totalGames = displayedMatches.length; // 현재 선택된 경기 수
        const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0; // 내 승률 (소수점 첫째짜리까지)

        // 자주 함께한 플레이어 Top 10
        const topFrequent = Object.entries(frequentCounts)
            .map(([id, count]) => ({ user: getUserObjectById(Number(id)), count }))
            .filter(item => item.user) // userList에 없는 유저는 제외
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 최고의 파트너 정렬 및 추출
        const bestPartnerEntry = Object.entries(partnerStats)
            .filter(([_, data]) => data.games >= 5) // 최소 1판 이상 같이 한 사람만
            .map(([id, data]) => ({ ...data, user: getUserObjectById(Number(id)), rate: (data.wins / data.games) * 100 }))
            .filter(item => item.user) // userList에 없는 유저는 제외
            .sort((a, b) => b.rate - a.rate || b.games - a.games)[0]; // 승률 높은 순 -> 판 수 많은 순 정렬 후 첫 번째 사람

        // 나의 천적 정렬 및 추출
        const nemesisEntry = Object.entries(opponentStats)
            .filter(([_, data]) => data.games >= 5) // 최소 1판 이상 붙어본 사람만
            .map(([id, data]) => ({ ...data, user: getUserObjectById(Number(id)), rate: (data.losses / data.games) * 100 }))
            .filter(item => item.user) // userList에 없는 유저는 제외
            .sort((a, b) => b.rate - a.rate || b.games - a.games)[0]; // 나를 이긴 비율이 높은 순 정렬 후 첫 번째 사람

        return { winRate, topFrequent, bestPartner: bestPartnerEntry, nemesis: nemesisEntry };
    }, [displayedMatches, targetUser?.id, userList]);

    if (isLoading || !targetUser) { return <div className="p-10 text-center text-slate-400">데이터를 불러오는 중...</div> }
    if (allTargetMatches.length === 0) { return <div className="p-10 text-center text-slate-400">기록된 경기가 없습니다.</div> }

    // 유저 카드 클릭 시 해당 유저 전적으로 이동하는 핸들러
    const handleUserClick = (id) => navigate(`/record/${id}`);

    return (
        <div className='space-y-4'>
            <div className="text-center space-y-2">
                <h2 className='pages-title uppercase mb-0'>{targetUser.name}'s Profile</h2>
                
                {/* 자기소개 메시지 */}
                {targetUser.bio && (
                    <div className="py-1 px-4 italic text-sm text-slate-600 break-keep">
                        "{targetUser.bio}"
                    </div>
                )}
                
                {/* 공개 정보 섹션 */}
                <div className="flex justify-center gap-3 text-xs text-slate-500 font-medium">
                    {(targetUser.id === me?.id || targetUser.isGenderPublic) && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                            {targetUser.gender === 'MALE' ? '남성' : '여성'}
                        </span>
                    )}
                    {(targetUser.id === me?.id || targetUser.isBirthdayPublic) && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                            🎂 {targetUser.birthday}
                        </span>
                    )}
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                        Rating: {targetUser.rating}
                    </span>
                </div>
                <p className="text-[10px] text-slate-400 italic">각 통계 항목당 최소 5경기의 기록이 필요합니다.</p>
            </div>

            {/* 통계 대시보드 UI 영역 */}
            {stats && (
                <section className="grid grid-cols-2 gap-2 text-base">
                    <div className="space-y-1 border border-slate-300 rounded-xl p-2">
                        <p className="text-slate-500">전체 승률</p>
                        <p className="font-bold text-emerald-600">{stats.winRate}%</p>
                    </div>
                    <div className="space-y-1 border border-slate-300 rounded-xl p-2">
                        <p className="text-slate-500">총 경기 수</p>
                        <p className="font-bold text-slate-700">{allTargetMatches.length}회</p>
                    </div>
                    <div className="space-y-1 border border-slate-300 rounded-xl p-2">
                        <p className="text-slate-500">최고의 파트너</p>
                        {stats.bestPartner?.user ? <UserCard key={stats.bestPartner.user.id} user={stats.bestPartner.user} onToggle={handleUserClick} /> : <p className="text-sm font-bold truncate">없음</p>}
                        {stats.bestPartner && <p className="text-xs text-blue-500">{stats.bestPartner.rate.toFixed(0)}% 승률</p>}
                    </div>
                    <div className="space-y-1 border border-slate-300 rounded-xl p-2">
                        <p className="text-slate-500">나의 천적</p>
                        {stats.nemesis?.user ? <UserCard key={stats.nemesis.user.id} user={stats.nemesis.user} onToggle={handleUserClick} /> : <p className="font-bold truncate">없음</p>}
                        {stats.nemesis && <p className="text-xs text-red-500">{stats.nemesis.rate.toFixed(0)}% 패배율</p>}
                    </div>
                </section>
            )}

            {/* 경기 보기 개수 조절 UI 영역 */}
            <div className="flex gap-2 items-center justify-between">
                <label htmlFor="matchCount" className="label-default">모든 {allTargetMatches.length}경기 중 {effectiveViewCount}개 보기</label>
                <input
                    type="number"
                    id='matchCount'
                    min={1}
                    max={allTargetMatches.length}
                    value={effectiveViewCount}
                    onChange={(e) => setViewCount(Number(e.target.value))} // 입력한 숫자를 state에 반영
                    className="w-min text-sm text-center border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-emerald-500"
                />
            </div>


            {/* 최근 승/패 */}
            <section className="space-y-2">
                <h4 className='text-xl font-semibold border-b border-slate-600/50 pb-2 mb-2'>최근 승/패</h4>
                <ul className='flex flex-wrap gap-1'>
                    {displayedMatches.map((match, idx) => {
                        const isTeamA = match.teamA.includes(targetUser.id);
                        const isWin = match.winner === (isTeamA ? "A" : "B");
                        return (
                            <li key={match._id || match.id || idx} >
                                <p className={`inline-block text-white leading-none rounded p-1 ${isWin ? 'bg-blue-600 font-bold' : 'bg-red-500'}`}>{isWin ? '승' : '패'}</p>
                            </li>
                        );
                    })}
                </ul>
            </section>
            {/* 자주 플레이한 유저 Top 10 리스트 렌더링 */}
            <section className="">
                <h4 className='text-xl font-semibold border-b border-slate-600/50 pb-2 mb-2'>자주 함께한 플레이어</h4>
                <div className="flex flex-wrap gap-2">
                    {stats?.topFrequent.map((player, i) => (
                        <div key={player.user.id || i} className="text-xs border border-slate-300/40 rounded-lg p-1 shadow-lg">
                            {player.user ? <UserCard key={player.user.id} user={player.user} onToggle={handleUserClick} /> : <span className="font-semibold">알 수 없음</span>}
                            <span className="ml-1 text-slate-400">{player.count}회</span>
                        </div>
                    ))}
                </div>
            </section>


        </div>
    );
}