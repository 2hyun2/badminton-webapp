import { Fragment } from 'react'; // 이 줄을 추가하세요
import { useState, useEffect, useMemo } from "react";

import { Button } from './components/common/Button';

import { UserCard } from "./components/UserCard";
import { MatchCard } from "./components/MatchCard";

import { ModalMatchResult } from './components/modal/ModalMatchResult';
import { ModalWaitOption } from './components/modal/ModalWaitOption';
import { ModalMatchCreate } from './components/modal/ModalMatchCreate';

function App() {
    const [userList, setUserList] = useState([
        { id: 1, name: "강백호", gender: "남", tier: "A", rating: 1850, status: "경기중", matchId: 101, groupId: null, preferredMatch: "남복", playCount: 2, joinedAt: 1713600000000, wins: 1, losses: 0 },
        { id: 2, name: "서태웅", gender: "남", tier: "A", rating: 1900, status: "경기중", matchId: 101, groupId: null, preferredMatch: "남복", playCount: 2, joinedAt: 1713600005000, wins: 2, losses: 0 },
        { id: 3, name: "채치수", gender: "남", tier: "B", rating: 1550, status: "경기중", matchId: 101, groupId: null, preferredMatch: "남복", playCount: 1, joinedAt: 1713600010000, wins: 0, losses: 1 },
        { id: 4, name: "정대만", gender: "남", tier: "B", rating: 1600, status: "경기중", matchId: 101, groupId: null, preferredMatch: "", playCount: 1, joinedAt: 1713600015000, wins: 1, losses: 0 },

        { id: 5, name: "송태섭", gender: "남", tier: "B", rating: 1520, status: "경기중", matchId: 102, groupId: "G1", preferredMatch: "혼복", playCount: 3, joinedAt: 1713600020000, wins: 1, losses: 1 },
        { id: 6, name: "이한나", gender: "여", tier: "C", rating: 1200, status: "경기중", matchId: 102, groupId: "G1", preferredMatch: "혼복", playCount: 2, joinedAt: 1713600025000, wins: 1, losses: 0 },
        { id: 7, name: "신준섭", gender: "남", tier: "A", rating: 1780, status: "경기중", matchId: 102, groupId: null, preferredMatch: "", playCount: 2, joinedAt: 1713600030000, wins: 2, losses: 0 },
        { id: 8, name: "채소연", gender: "여", tier: "D", rating: 950, status: "경기중", matchId: 102, groupId: null, preferredMatch: "혼복", playCount: 1, joinedAt: 1713600035000, wins: 0, losses: 0 },

        { id: 9, name: "윤대협", gender: "남", tier: "A", rating: 1880, status: "대기중", matchId: null, groupId: "G2", preferredMatch: "혼복", playCount: 0, joinedAt: 1713601000000, wins: 0, losses: 0 },
        { id: 15, name: "박희진", gender: "여", tier: "C", rating: 1250, status: "대기중", matchId: null, groupId: "G2", preferredMatch: "혼복", playCount: 0, joinedAt: 1713601400000, wins: 0, losses: 0 },

        { id: 10, name: "성현준", gender: "남", tier: "B", rating: 1580, status: "대기중", matchId: null, groupId: null, preferredMatch: "남복", playCount: 0, joinedAt: 1713601050000, wins: 0, losses: 0 },
        { id: 11, name: "김수겸", gender: "남", tier: "A", rating: 1820, status: "대기중", matchId: null, groupId: null, preferredMatch: "남복", playCount: 1, joinedAt: 1713600000000, wins: 1, losses: 0 },
        { id: 12, name: "변덕규", gender: "남", tier: "B", rating: 1500, status: "대기중", matchId: null, groupId: null, preferredMatch: "남복", playCount: 2, joinedAt: 1713602000000, wins: 0, losses: 2 },
        { id: 13, name: "허태환", gender: "남", tier: "C", rating: 1350, status: "대기중", matchId: null, groupId: null, preferredMatch: "", playCount: 0, joinedAt: 1713601200000, wins: 0, losses: 0 },
        { id: 14, name: "안영수", gender: "남", tier: "C", rating: 1300, status: "대기중", matchId: null, groupId: null, preferredMatch: "남복", playCount: 3, joinedAt: 1713601300000, wins: 2, losses: 1 },
        { id: 16, name: "김은실", gender: "여", tier: "B", rating: 1450, status: "대기중", matchId: null, groupId: null, preferredMatch: "여복", playCount: 0, joinedAt: 1713601500000, wins: 0, losses: 0 },
        { id: 17, name: "황태산", gender: "남", tier: "A", rating: 1750, status: "대기중", matchId: null, groupId: null, preferredMatch: "", playCount: 1, joinedAt: 1713601600000, wins: 1, losses: 0 },

        { id: 18, name: "권준호", gender: "남", tier: "C", rating: 1100, status: "휴식중", matchId: null, groupId: null, preferredMatch: "", playCount: 2, joinedAt: 1713590000000, wins: 1, losses: 1 },
        { id: 19, name: "이정환", gender: "남", tier: "A", rating: 1950, status: "휴식중", matchId: null, groupId: null, preferredMatch: "남복", playCount: 4, joinedAt: 1713591000000, wins: 4, losses: 0 },
        { id: 20, name: "유경남", gender: "여", tier: "B", rating: 1480, status: "휴식중", matchId: null, groupId: null, preferredMatch: "", playCount: 1, joinedAt: 1713592000000, wins: 0, losses: 1 },
    ]);

    // *팝업* 경기 결과 on/off
    const [endingMatchId, setEndingMatchId] = useState(null);
    // 1. 매칭 팝업창 열림/닫힘 상태
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

    const startMatch = (selectedIds) => {
        if (window.confirm("경기를 시작할까요?")) {
            const newMatchId = Date.now();
            setUserList(prev => prev.map(user => {
                const slotIndex = selectedIds.indexOf(user.id);

                if (slotIndex !== -1) {
                    return { ...user, status: "경기중", matchId: newMatchId, matchSlot: slotIndex };
                }
                return user;
            }));
            setIsMatchModalOpen(false); // 팝업 닫기
        }
    };

    // 휴식중 유저 상태 변환
    const [waitTargetId, setWaitTargetId] = useState(null);

    // Status 상태에 따른 편의성 list *useMemo
    const restingList = useMemo(() => {
        return userList.filter(user => user.status === "휴식중");
    }, [userList])
    const watingList = useMemo(() => {
        return userList.filter(user => user.status === "대기중");
    }, [userList])
    const playingList = useMemo(() => {
        return userList.filter(user => user.status === "경기중");
    }, [userList])
    // 경기중인 팀들의 나열 *useMemo
    const matchIds = useMemo(() => {
        return Array.from(
            new Set(
                userList
                    .filter(user => user.status === "경기중")
                    .map(user => user.matchId)
            )
        );
    }, [playingList]);

    // 신규 유저 생성 샘플 *미완
    const handleJoinWaitList = () => {
        const newUser = {
            id: Date.now(),
            name: "나민턴",
            tier: "A",
            rating: 1400,
            status: "대기중",
            matchId: null,
            preferredMatch: "자유",
            playCount: "",
            joinedAt: "",
            wins: 0,
            losses: 0
        }
        setUserList([...userList, newUser])
    }
    // UserCard 클릭시 상태 변화
    const toggleStatus = (targetId) => {
        const targetUser = userList.find(u => u.id === targetId);

        if (targetUser.status === "대기중") {
            const updateList = userList.map(user => {
                if (user.id === targetId || (targetUser.groupId && user.groupId === targetUser.groupId)) {
                    return { ...user, status: "휴식중", groupId: null };
                }
                return user;
            });

            setUserList(updateList);

        } else if (targetUser.status === "휴식중") {
            console.log("휴식중 클릭됨! ID:", targetId); // 안 열린다면 이 로그가 찍히는지 확인해보세요
            setWaitTargetId(targetId);
        }
    }
    // 대기열 진입 시 파트너 생성 로직
    const confirmWait = (pref, partnerId) => {
        const newGroupId = partnerId ? Number(`G_${Date.now()}`) : null;

        const updatedList = userList.map(user => {
            if (user.id === waitTargetId) {
                return { ...user, status: "대기중", preferredMatch: pref, newGroupId: partnerId };
            }
            if (selectedPartnerId && user.id === Number(selectedPartnerId)) {
                return { ...user, status: "대기중", preferredMatch: pref, newGroupId: partnerId };
            }
            return user;
        });

        setUserList(updatedList);
        setWaitTargetId(null);
    };
    // 경기 결과 입력 (경기중 onClick => 경기 결과 팝업 open)
    const handleMatchResult = (winnerTeam) => {
        const playersInMatch = userList.filter(u => u.matchId === endingMatchId);

        const updatedList = userList.map(user => {
            if (user.matchId !== endingMatchId) return user;

            const isTeamA = playersInMatch.slice(0, 2).some(player => player.id === user.id);
            const isTeamB = playersInMatch.slice(2, 4).some(player => player.id === user.id);

            const isWin = (winnerTeam === 'A' && isTeamA) || (winnerTeam === 'B' && isTeamB);
            const isLoss = (winnerTeam === 'A' && isTeamB) || (winnerTeam === 'B' && isTeamA);

            return {
                ...user,
                status: "휴식중",
                matchId: null,
                playCount: user.playCount + 1,
                groupId: "",
                wins: isWin ? user.wins + 1 : user.wins,
                losses: isLoss ? user.losses + 1 : user.losses,
            };
        });

        setUserList(updatedList);
        setEndingMatchId(null);
    };

    return (
        <div className="min-h-screen h-full flex justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white shadow-lg">
                <header className="flex justify-between items-center text-xl text-white font-bold bg-blue-600 p-4">
                    <h1>🏸 매니저</h1>
                    <Button onClick={() => setIsMatchModalOpen(true)}>매칭 짜기</Button>
                </header>
                <main className="flex-1 py-8  overflow-y-auto">
                    <div className="resting-list flex flex-wrap gap-2 p-4">
                        <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                            휴식중 <span className="text-sm text-blue-500 font-medium ml-2">{userList.filter(item => item.status === "휴식중").length}명</span>
                        </h4>
                        {restingList.map((user) => <UserCard key={user.id} user={user} onToggle={toggleStatus} />)}
                    </div>

                    <div className="wating-list flex flex-col gap-2 p-4">
                        <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
                            현재 대기열 <span className="text-sm text-blue-500 font-medium ml-2">{watingList.length}명</span>
                        </h4>
                        {["자유", "혼복", "남복", "여복",].map((category) => {
                            const filteredUsers = watingList.filter((user) => {
                                const userPref = (user.preferredMatch === "" || user.preferredMatch === "자유")
                                    ? "자유"
                                    : user.preferredMatch;
                                return userPref === category;
                            });

                            return (
                                <div key={category} className="">
                                    <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1 mb-2">
                                        {category} <span className="text-blue-500">{filteredUsers.length}명</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {filteredUsers.map((user) => (
                                            <UserCard key={user.id} user={user} onToggle={toggleStatus} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="playing-list flex flex-wrap gap-2 p-4">
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
                    </div>
                </main>

                {/* <nav className="fixed bottom-0 max-w-md w-full flex items-center justify-around bg-white border-top-solid"> */}
                {/* <Button onClick={() => handleJoinWaitList()} children={'신청'} size='sm' /> */}
                {/* <li>홈</li> */}
                {/* <li>내정보</li> */}
                {/* <li>랭킹</li> */}
                {/* </nav> */}

                {/* 경기 결과 팝업 */}
                {endingMatchId && (
                    <ModalMatchResult onResult={handleMatchResult} onClose={setEndingMatchId} />
                )}
                {/* 대기열 신청 팝업 */}
                {waitTargetId && (
                    <ModalWaitOption userList={userList} waitTargetId={waitTargetId} onClose={() => setWaitTargetId(null)} onConfirm={confirmWait} />
                )}
                {/* 경기 생성 팝업 */}
                {isMatchModalOpen && (
                    <ModalMatchCreate
                        userList={userList}
                        onClose={() => setIsMatchModalOpen(false)}
                        onMatchStart={startMatch}
                    />
                )}

            </div>
        </div>
    )
}

export default App