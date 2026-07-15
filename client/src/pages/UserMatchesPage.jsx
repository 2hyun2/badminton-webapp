import { useState, useMemo } from 'react'

import { useUsers } from '../hooks/useUsers';
import { useMatches } from '../hooks/useMatches';

import { UserCard } from '../components/card/UserCard';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';

import { MatchCard } from '../components/card/MatchCard';
import { timeZone } from '../utils/timeZone';

export const UserMatchesPage = ({ viewMine = false }) => {
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

    const groupedMatches = useMemo(() => {
        if (!filteredData) return [];

        const groups = filteredData.reduce((acc, cur) => {
            const dateKey = timeZone(cur.matchDate).date;
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(cur);
            return acc;
        }, {});

        console.log(groups);

        return Object.entries(groups).map(([date, list]) => ({ date, list }));
    }, [filteredData]);

    console.log(groupedMatches);

    return (
        <div className='space-y-4'>
            <div className="space-y-4 border-b border-slate-700 pb-4">
                <h1 className='pages-title'>경기 목록</h1>
                <div className="text-right">
                    <Button size='sm' variant={isMeOnly ? 'blue' : 'gray'} onClick={() => setIsMeOnly(!isMeOnly)} >
                        {isMeOnly ? '모든 경기' : '내 경기만'}
                    </Button>
                </div>
            </div>

            {groupedMatches.map(({ date, list }) => (
                <details key={date} className="space-y-4 group open:border-slate-600 open:bg-gray-600 open:rounded-2xl open:p-2 transition-all duration-300">
                    <summary className="flex justify-between text- border-b border-slate-300 pb-2 list-none cursor-pointer group-open:text-white">
                        <span>{date}</span>
                        <span className="material-symbols-outlined [font-variation-settings:'FILL'_0,_'wght'_400,_'GRAD'_0,_'opsz'_2] group-open:[font-variation-settings:'FILL'_1,_'wght'_400,_'GRAD'_0,_'opsz'_2]">
                            folder_open
                        </span>
                    </summary>

                    <div className="space-y-2">
                        {list.map((match) => (
                            <div key={match.matchId}>
                                <MatchCard match={match} />
                            </div>
                        ))}
                    </div>
                </details>
            ))}

        </div>
    );
}