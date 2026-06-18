import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useMatchStore from "../store/useMatchStore";
import useAuthStore from "../store/useAuthStore";

import { UserCard } from "../components/card/UserCard";
import { MatchCard } from "../components/card/MatchCard";
import { ModalMatchResult } from '../components/modal/ModalMatchResult';
import { Loading } from "../components/common/Loading";

import { useUsers } from "../hooks/useUsers";
import { useMatches } from "../hooks/useMatches";

export const MainPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const { isLoading, isError, restingList, waitingList, playingList, updateUserMutation } = useUsers();
    const { matchHistory, endMatchMutation, endingMatchId, setEndingMatchId } = useMatches();

    // 로그인 보호 로직
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleMatchResult = (result) => {
        const payload = {
            matchId: endingMatchId,
            winner: result,
            scoreA: 0,
            scoreB: 0
        };
        endMatchMutation.mutate(payload);
    };

    if (isLoading) return <Loading />
    if (isError) return <Loading type='error' message='데이터 오류입니다.' />

    return (
        <>
            <div className="space-y-4">
                {/* 휴식중 */}
                <section className="resting-list flex flex-wrap gap-2 ">
                    <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                        휴식중 <span className="text-sm text-blue-500 font-medium">{restingList.length}명</span>
                    </h4>
                    {restingList.map((user) => (
                        <UserCard key={user.id} user={user} onNavigate={true} />
                    ))}
                </section>
                {/* 대기열 */}
                <section className="waiting-list flex flex-col gap-2 ">
                    <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                        현재 대기열 <span className="text-sm text-blue-500 font-medium">{Object.values(waitingList).flat().length}명</span>
                    </h4>

                    <div className="waiting-list-detail flex flex-col gap-2">
                        {Object.entries(waitingList).map(([category, players]) => (
                            <div key={category}>
                                <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1 mb-2">
                                    {category} <span className="text-blue-500">{players.length}명</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {players.map((user) => (
                                        <UserCard key={user.id} user={user} onNavigate={true} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* 경기중 */}
                <section className="playing-list flex flex-wrap gap-2 ">
                    <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                        경기 진행중 <span className="text-sm text-blue-500 font-medium">{playingList.length}명</span>
                    </h4>
                    {matchHistory
                        .filter(match => match.matchStatus === 'PLAYING')
                        .map(match => {
                            return (
                                <MatchCard
                                    key={match.matchId}
                                    match={match}
                                    onOpenModal={setEndingMatchId}
                                />
                            );
                        })}
                </section>
            </div>
            {/* 경기 결과 팝업 */}
            {endingMatchId && (
                <ModalMatchResult onResult={handleMatchResult} onClose={() => setEndingMatchId(null)} />
            )}
        </>
    )
}