import React from 'react'
import { useMatches } from '../../hooks/useMatches';
import { useUsers } from '../../hooks/useUsers';
import { UserCard } from '../card/UserCard';

export const MatchHistory = ({ viewMine = false }) => {
    const { me } = useUsers();
    const { matchHistory, isLoading, isError } = useMatches();

    if (isLoading) return <div>로딩 중</div>
    if (isError) return <div>에러 발생</div>
    console.log(me);
    console.log(matchHistory);

    const filteredData = viewMine && me?.id
        ? matchHistory.filter(match => match.teamA.includes(me.id) || match.teamB.includes(me.id))
        : matchHistory;

    const formattedDate = (dateString) => {
        if (!dateString) return;
        return new Date(dateString).toLocaleDateString('ko-kr', {
            timeZone: 'Asia/Seoul',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
        });
    }

    return (
        <div>
            <h1>MatchHistory</h1>
            {filteredData.length > 0
                ? filteredData.map(match => (
                    <div key={match._id} className='block border'>
                        <div>날짜: {formattedDate(match.matchDate)}</div>
                        <div>결과: Team A ({match.scoreA}) vs Team B ({match.scoreB})</div>
                        <div>승자: {match.winner === 'A' ? 'Team A' : 'Team B'}</div>
                        <div>ELO 변동: +{match.eloDelta}</div>

                    </div>
                ))
                : null
            }


        </div>
    )
}
