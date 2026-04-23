import { useState, useEffect, useMemo } from "react";
import axios from "axios";

import { users } from "./data/users";

import { Button } from './components/common/Button';

import { UserCard } from "./components/UserCard";
import { MatchCard } from "./components/MatchCard";

import { ModalMatchResult } from './components/modal/ModalMatchResult';
import { ModalWaitOption } from './components/modal/ModalWaitOption';
import { ModalMatchCreate } from './components/modal/ModalMatchCreate';

function App() {
  const HOST = "http://localhost:5000";
  // userList useState
  const [userList, setUserList] = useState(users);
  // userList 데이터 변경시 마다 useEffect 재업데이트
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await axios.get(`${HOST}/api/users`);
        setUserList(response.data);
      } catch (error) {
        console.error("서버에서 데이터 못 갖고옴", error)
      }
    }
    getUsers()
  }, [])

  // user.status 상태에 따른 편의성 list *useMemo
  const restingList = useMemo(() => {
    return userList.filter(user => user.status === "휴식중");
  }, [userList]) // 휴식중 
  const watingList = useMemo(() => {
    return userList.filter(user => user.status === "대기중");
  }, [userList]) // 대기중
  const waitingCategory = useMemo(() => {
    const groups = { 자유: [], 혼복: [], 남복: [], 여복: [], };

    watingList.forEach(user => {
      const preferred = (user.preferredMatch === "" || user.preferredMatch === "자유") ? "자유" : user.preferredMatch;
      if (groups[preferred]) groups[preferred].push(user);
    });
    return groups
  }, [watingList]) // 대기중 => preferredMatch category: list  

  const playingList = useMemo(() => {
    return userList.filter(user => user.status === "경기중");
  }, [userList]) // 경기중
  const matchIds = useMemo(() => {
    return Array.from(
      new Set(playingList.map(user => user.matchId))
    );
  }, [playingList]); // user.status를 기반으로 match ID 추출

  // 휴식중 유저 상태 변환
  const [waitTargetId, setWaitTargetId] = useState(null);

  // *팝업* 경기 결과 on/off
  const [endingMatchId, setEndingMatchId] = useState(null);
  // 1. 매칭 팝업창 열림/닫힘 상태
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  const startMatch = async (ids) => {
    try {
      const response = await axios.post(`${HOST}/api/match/start`, {
        selectedIds: ids
      });

      if (response.status === 200) {
        alert("매칭 정보가 서버에 기록되었습니다!");

        // 서버가 준 최신 명단으로 리액트 상태를 한 번에 업데이트!
        // 이제 리액트에서 따로 복잡하게 계산할 필요가 없어요.
        setUserList(response.data.updatedList);

        setIsMatchModalOpen(false);
      }
    } catch (error) {
      console.error("매칭 전송 실패:", error);
      alert("서버 통신 오류가 발생했습니다.");
    }
  };
  // 신규 유저 생성 샘플 *미완
  // const handleJoinWaitList = () => {
  //     const newUser = {
  //         id: Date.now(),
  //         name: "나민턴",
  //         tier: "A",
  //         rating: 1400,
  //         status: "대기중",
  //         matchId: null,
  //         preferredMatch: "자유",
  //         playCount: "",
  //         joinedAt: "",
  //         wins: 0,
  //         losses: 0
  //     }
  //     setUserList([...userList, newUser])
  // }
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
    const newGroupId = partnerId ? `G_${Date.now()}` : null;

    const updatedList = userList.map(user => {
      if (user.id === waitTargetId) {
        return { ...user, status: "대기중", preferredMatch: pref, groupId: partnerId };
      }
      if (partnerId && user.id === Number(partnerId)) {
        return { ...user, status: "대기중", preferredMatch: pref, groupId: partnerId };
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
        <header className="flex justify-between items-center text-xl text-white font-bold bg-blue-600 py-2 px-4">
          <h1>🏸 매니저</h1>
          <Button onClick={() => setIsMatchModalOpen(true)}>매칭 짜기</Button>
        </header>
        <main className="flex-1 space-y-8 py-8 px-4  overflow-y-auto">
          <section className="resting-list flex flex-wrap gap-2 ">
            <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
              휴식중 <span className="text-sm text-blue-500 font-medium ml-2">{userList.filter(item => item.status === "휴식중").length}명</span>
            </h4>
            {restingList.map((user) => <UserCard key={user.id} user={user} onToggle={toggleStatus} />)}
          </section>

          <section className="wating-list flex flex-col gap-2 ">
            <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
              현재 대기열 <span className="text-sm text-blue-500 font-medium ml-2">{watingList.length}명</span>
            </h4>

            <div className="wating-list-detail flex flex-col gap-2">
              {Object.entries(waitingCategory).map(([category, players]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1 mb-2">
                    {category} <span className="text-blue-500">{players.length}명</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {players.map((user) => (
                      <UserCard key={user.id} user={user} onToggle={toggleStatus} />
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
            waitingCategory={waitingCategory}
            onClose={() => setIsMatchModalOpen(false)}
            onMatchStart={startMatch}
          />
        )}

      </div>
    </div>
  )
}

export default App