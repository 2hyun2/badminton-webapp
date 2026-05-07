import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import useMatchStore from "../store/useMatchStore";
import axios from 'axios'


import { Button } from "../components/common/Button"
import { UserCard } from "../components/card/UserCard";
import { MatchCard } from "../components/card/MatchCard";
import { ModalMatchResult } from '../components/modal/ModalMatchResult';
import { ModalWaitOption } from '../components/modal/ModalWaitOption';
import { ModalMatchCreate } from '../components/modal/ModalMatchCreate';

import { useUsers } from "../hooks/useUsers";

export const MainPage = () => {

    const { userList, isLoading, isError, restingList, waitingList, waitingCategory, playingList, updateUsers } = useUsers();

    const {
        toggleUserStatus,
    } = useMatchStore();

    const [waitTargetId, setWaitTargetId] = useState(null);
    const [endingMatchId, setEndingMatchId] = useState(null);

    const handleToggleStatus = async (targetId) => {
        const targetUser = userList.find(u => u.id === targetId);

        if (targetUser.status === "대기중") {
            const updates = [{ id: targetId, status: "휴식중", groupId: "" }];
            if (targetUser.groupId) {
                const groupMembers = userList.filter(user => user.groupId === targetUser.groupId);
                updates.push(...groupMembers.map(user => ({ id: user.id, status: "휴식중", groupId: "" })));
            }
            await updateUsers(updates);
        } else if (targetUser.status === "휴식중") {
            setWaitTargetId(targetId);
        }
    };

    const confirmWait = async (pref, partnerId) => {
        const updates = [
            { id: waitTargetId, status: "대기중", preferredMatch: pref, groupId: partnerId || "" }
        ];
        if (partnerId) {
            updates.push({ id: Number(partnerId), status: "대기중", preferredMatch: pref, groupId: partnerId });
        }
        await updateUsers(updates);
        setWaitTargetId(null);
    };

    const handleMatchResult = async (winnerTeam) => {
        await endMatch(endingMatchId, winnerTeam);
        setEndingMatchId(null);
        alert(winnerTeam === 'cancel' ? "경기가 취소되었습니다." : "레이팅이 업데이트되었습니다!");
    };

    return (
        <>
            <div className="flex-1 space-y-8 py-8 px-4 overflow-y-auto">
                {/* 휴식중 */}
                <section className="resting-list flex flex-wrap gap-2 ">
                    <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                        휴식중 <span className="text-sm text-blue-500 font-medium ml-2">{restingList.length}명</span>
                    </h4>
                    {restingList.map((user) => (
                        <UserCard key={user.id} user={user} onToggle={handleToggleStatus} />
                    ))}
                </section>
                {/* 대기열 */}
                <section className="waiting-list flex flex-col gap-2 ">
                    <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                        현재 대기열 <span className="text-sm text-blue-500 font-medium ml-2">{waitingList.length}명</span>
                    </h4>

                    <div className="waiting-list-detail flex flex-col gap-2">
                        {Object.entries(waitingCategory).map(([category, players]) => (
                            <div key={category}>
                                <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1 mb-2">
                                    {category} <span className="text-blue-500">{players.length}명</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {players.map((user) => (
                                        <UserCard key={user.id} user={user} onToggle={handleToggleStatus} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* 경기중 */}
                <section className="playing-list flex flex-wrap gap-2 ">
                    <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                        경기 진행중
                        <span className="text-sm text-blue-500 font-medium ml-2">
                            {playingList.length}명
                        </span>
                    </h4>
                    {playingList.map(match => {
                        // 1. 해당 matchId를 가진 유저들을 찾아서 정렬
                        const players = userList
                            .filter(user => user.matchId === match)
                            .sort((a, b) => (a.matchSlot || 0) - (b.matchSlot || 0));

                        return (
                            <MatchCard
                                key={match}          // map의 key는 고유한 matchId 사용
                                matchId={match}      // new Date() 대신 실제 matchId 전달 (중요!)
                                players={players}
                                onOpenModal={setEndingMatchId}
                            />
                        );
                    })}
                </section>
            </div>

            {endingMatchId && (
                <ModalMatchResult onResult={handleMatchResult} onClose={() => setEndingMatchId(null)} />
            )}

            {waitTargetId && (
                <ModalWaitOption userList={userList} waitTargetId={waitTargetId} onClose={() => setWaitTargetId(null)} onConfirm={confirmWait} />
            )}
        </>
    )
}