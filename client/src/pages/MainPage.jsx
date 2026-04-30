import { useState, useEffect } from "react";
import useMatchStore from "../store/useMatchStore"; // 스토어 경로 확인!

import { Button } from "../components/common/Button"
import { UserCard } from "../components/card/UserCard";
import { MatchCard } from "../components/card/MatchCard";
import { ModalMatchResult } from '../components/modal/ModalMatchResult';
import { ModalWaitOption } from '../components/modal/ModalWaitOption';
import { ModalMatchCreate } from '../components/modal/ModalMatchCreate';

export const MainPage = () => {
    // 1. Store에서 모든 함수와 상태를 다 꺼내옵니다.
    const { 
        userList, // ⭐ 주의: 이 컴포넌트가 'userList'의 변화를 감지하고 화면을 다시 그리게 하려면 얘는 꼭 꺼내와야 합니다!
        getWaitingList,
        getRestingList,
        getPlayingList,
        getWaitingCategory,
        fetchUsers, 
        toggleUserStatus, 
        startMatch, 
        endMatch 
    } = useMatchStore();

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. useMemo 싹 날리고 Store에 만들어둔 함수를 그대로 직관적이게 사용!
    const restingList = getRestingList();
    const waitingList = getWaitingList();
    const waitingCategory = getWaitingCategory();
    const playingList = getPlayingList();
    
    // (이 부분은 playingList를 한 번 더 가공하는 거라 남겨뒀습니다. 
    // 만약 matchIds도 다른 곳에서 쓴다면 스토어에 `getMatchIds: () => ...` 로 올리시면 완벽합니다!)
    const matchIds = Array.from(new Set(playingList.map(user => user.matchId)));

    // 3. UI 제어를 위한 최소한의 로컬 상태만 유지
    const [waitTargetId, setWaitTargetId] = useState(null);
    const [endingMatchId, setEndingMatchId] = useState(null);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

    // 4. 핸들러 함수들
    const handleToggleStatus = (targetId) => {
        const targetUser = userList.find(u => u.id === targetId);
        
        if (targetUser.status === "대기중") {
            toggleUserStatus(targetId);
        } else if (targetUser.status === "휴식중") {
            setWaitTargetId(targetId);
        }
    };

    const confirmWait = (pref, partnerId) => {
        const updatedList = userList.map(user => {
            if (user.id === waitTargetId) {
                return { ...user, status: "대기중", preferredMatch: pref, groupId: partnerId };
            }
            if (partnerId && user.id === Number(partnerId)) {
                return { ...user, status: "대기중", preferredMatch: pref, groupId: partnerId };
            }
            return user;
        });

        useMatchStore.setState({ userList: updatedList }); 
        setWaitTargetId(null);
    };

    const handleStartMatch = async () => {
        const success = await startMatch(); 
        if (success) {
            alert("매칭 정보가 서버에 기록되었습니다!");
            setIsMatchModalOpen(false); 
        } else {
            alert("서버 통신 오류가 발생했거나 인원이 부족합니다.");
        }
    };

    const handleMatchResult = async (winnerTeam) => {
        await endMatch(endingMatchId, winnerTeam); 
        setEndingMatchId(null); 
        alert(winnerTeam === 'cancel' ? "경기가 취소되었습니다." : "레이팅이 업데이트되었습니다!");
    };

    return (
        <div className="min-h-screen h-full flex justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white shadow-lg">
                <header className="flex justify-between items-center text-xl text-white font-bold bg-blue-600 py-2 px-4">
                    <h1>🏸 매니저</h1>
                    <Button onClick={() => setIsMatchModalOpen(true)}>매칭 짜기</Button>
                </header>
                
                <main className="flex-1 space-y-8 py-8 px-4 overflow-y-auto">
                    <section className="resting-list flex flex-wrap gap-2 ">
                        <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                            휴식중 <span className="text-sm text-blue-500 font-medium ml-2">{restingList.length}명</span>
                        </h4>
                        {restingList.map((user) => (
                            <UserCard key={user.id} user={user} onToggle={handleToggleStatus} />
                        ))}
                    </section>

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

                    <section className="playing-list flex flex-wrap gap-2 ">
                        <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                            경기 진행중
                            <span className="text-sm text-blue-500 font-medium ml-2">
                                {matchIds.length}팀
                            </span>
                        </h4>
                        {matchIds.map(match => {
                            const players = userList
                                .filter(user => user.matchId === match)
                                .sort((a, b) => (a.matchSlot || 0) - (b.matchSlot || 0));

                            return (
                                <MatchCard key={match} matchId={match} players={players} onOpenModal={setEndingMatchId} />
                            )
                        })}
                    </section>
                </main>

                {endingMatchId && (
                    <ModalMatchResult onResult={handleMatchResult} onClose={() => setEndingMatchId(null)} />
                )}
                
                {waitTargetId && (
                    <ModalWaitOption userList={userList} waitTargetId={waitTargetId} onClose={() => setWaitTargetId(null)} onConfirm={confirmWait} />
                )}
                
                {isMatchModalOpen && (
                    <ModalMatchCreate
                        userList={userList}
                        waitingCategory={waitingCategory}
                        onClose={() => setIsMatchModalOpen(false)}
                        onMatchStart={handleStartMatch} 
                    />
                )}
            </div>
        </div>
    )
}