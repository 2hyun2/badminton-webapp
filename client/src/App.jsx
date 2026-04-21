import { Fragment } from 'react'; // 이 줄을 추가하세요
import { useState, useEffect, useMemo } from "react";
import { UserCard } from "./components/UserCard";
import { MatchCard } from "./components/MatchCard";


function App() {
  const [userList, setUserList] = useState([
    // 🏸 1경기 진행중 (남복 - Match ID: 101)
    { id: 1, name: "강백호", tier: "A", rating: 1850, status: "경기중", matchId: 101, preferredMatch: "남복", playCount: 2, joinedAt: 1713600000000, wins: 1, losses: 0 },
    { id: 2, name: "서태웅", tier: "A", rating: 1900, status: "경기중", matchId: 101, preferredMatch: "남복", playCount: 2, joinedAt: 1713600005000, wins: 2, losses: 0 },
    { id: 3, name: "채치수", tier: "B", rating: 1550, status: "경기중", matchId: 101, preferredMatch: "남복", playCount: 1, joinedAt: 1713600010000, wins: 0, losses: 1 },
    { id: 4, name: "정대만", tier: "B", rating: 1600, status: "경기중", matchId: 101, preferredMatch: "무관", playCount: 1, joinedAt: 1713600015000, wins: 1, losses: 0 },

    // 🏸 2경기 진행중 (혼복 - Match ID: 102)
    { id: 5, name: "송태섭", tier: "B", rating: 1520, status: "경기중", matchId: 102, preferredMatch: "혼복", playCount: 3, joinedAt: 1713600020000, wins: 1, losses: 1 },
    { id: 6, name: "이한나", tier: "C", rating: 1200, status: "경기중", matchId: 102, preferredMatch: "혼복", playCount: 2, joinedAt: 1713600025000, wins: 1, losses: 0 },
    { id: 7, name: "신준섭", tier: "A", rating: 1780, status: "경기중", matchId: 102, preferredMatch: "무관", playCount: 2, joinedAt: 1713600030000, wins: 2, losses: 0 },
    { id: 8, name: "채소연", tier: "D", rating: 950, status: "경기중", matchId: 102, preferredMatch: "혼복", playCount: 1, joinedAt: 1713600035000, wins: 0, losses: 0 },

    // ⏳ 대기열 (9명 - 나중에 정렬 로직 테스트를 위해 playCount와 joinedAt을 다양하게 섞어두었습니다)
    { id: 9, name: "윤대협", tier: "A", rating: 1880, status: "대기중", matchId: null, preferredMatch: "무관", playCount: 0, joinedAt: 1713601000000, wins: 0, losses: 0 },
    { id: 10, name: "성현준", tier: "B", rating: 1580, status: "대기중", matchId: null, preferredMatch: "남복", playCount: 0, joinedAt: 1713601050000, wins: 0, losses: 0 },
    { id: 11, name: "김수겸", tier: "A", rating: 1820, status: "대기중", matchId: null, preferredMatch: "남복", playCount: 1, joinedAt: 1713600000000, wins: 1, losses: 0 }, // 1겜 쳤지만 엄청 일찍 대기건 사람
    { id: 12, name: "변덕규", tier: "B", rating: 1500, status: "대기중", matchId: null, preferredMatch: "남복", playCount: 2, joinedAt: 1713602000000, wins: 0, losses: 2 },
    { id: 13, name: "허태환", tier: "C", rating: 1350, status: "대기중", matchId: null, preferredMatch: "무관", playCount: 0, joinedAt: 1713601200000, wins: 0, losses: 0 },
    { id: 14, name: "안영수", tier: "C", rating: 1300, status: "대기중", matchId: null, preferredMatch: "남복", playCount: 3, joinedAt: 1713601300000, wins: 2, losses: 1 },
    { id: 15, name: "박희진", tier: "C", rating: 1250, status: "대기중", matchId: null, preferredMatch: "여복", playCount: 0, joinedAt: 1713601400000, wins: 0, losses: 0 },
    { id: 16, name: "전호장", tier: "B", rating: 1450, status: "대기중", matchId: null, preferredMatch: "혼복", playCount: 0, joinedAt: 1713601500000, wins: 0, losses: 0 },
    { id: 17, name: "황태산", tier: "A", rating: 1750, status: "대기중", matchId: null, preferredMatch: "무관", playCount: 1, joinedAt: 1713601600000, wins: 1, losses: 0 },

    // ☕ 휴식 중 (3명)
    { id: 18, name: "권준호", tier: "C", rating: 1100, status: "휴식중", matchId: null, preferredMatch: "무관", playCount: 2, joinedAt: 1713590000000, wins: 1, losses: 1 },
    { id: 19, name: "이정환", tier: "A", rating: 1950, status: "휴식중", matchId: null, preferredMatch: "남복", playCount: 4, joinedAt: 1713591000000, wins: 4, losses: 0 },
    { id: 20, name: "고민구", tier: "B", rating: 1480, status: "휴식중", matchId: null, preferredMatch: "남복", playCount: 1, joinedAt: 1713592000000, wins: 0, losses: 1 },
  ]);

  const [newUser, setNewUser] = useState("")

  const restingList = useMemo(() => {
    return userList.filter(user => user.status === "휴식중");
  }, [userList])
  const watingList = useMemo(() => {
    return userList.filter(user => user.status === "대기중");
  }, [userList])
  const playingList = useMemo(() => {
    return userList.filter(user => user.status === "경기중");
  }, [userList])

  const matchIds = useMemo(() => {
    return Array.from(
      new Set(
        userList
          .filter(user => user.status === "경기중")
          .map(user => user.matchId)
      )
    );
  }, [userList]);



  const handleJoinWaitList = () => {
    const newUser = {
      id: Date.now(),
      name: "나민턴",
      tier: "A",
      rating: 1400,
      status: "대기중"
    }

    setUserList([...userList, newUser])
  }

  const toggleStatus = (targetId) => {
    const updateList = userList.map(user => {
      if (user.id === targetId) {
        const newStatus = user.status === "대기중" ? "휴식중" : "대기중";
        return { ...user, status: newStatus };
      }
      return user;
    })
    setUserList(updateList)
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg">
        <header className="flex justify-between items-center text-xl text-white font-bold bg-blue-600 p-4">
          {/* <h1>🏸 민턴 매니저</h1> */}
          {/* <div className="now-status"> */}
          {/* <span className="name">나민턴</span> */}
          {/* <span className="rating">1400</span> */}
          {/* </div> */}
        </header>
        <main className="flex-1 p-8-4 overflow-y-auto">
          <div className="resting-list flex flex-wrap gap-2 p-4">
            <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
              휴식중
              <span className="text-sm text-blue-500 font-medium ml-2">{userList.filter(item => item.status === "휴식중").length}명</span>
            </h4>
            {restingList
              .filter(item => item.status === "휴식중")
              .map((user) => (
                <UserCard key={user.id} user={user} onToggle={toggleStatus} />
              ))
            }
          </div>

          <div className="wating-list flex flex-col gap-2 p-4">
            <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-1 mb-2">
              현재 대기열
              <span className="text-sm text-blue-500 font-medium ml-2">
                {userList.filter(item => item.status === "대기중").length}명
              </span>
            </h4>

            {["무관", "혼복", "남복", "여복"].map((type) => {
              const filteredUsers = userList.filter(
                (item) => item.status === "대기중" && item.preferredMatch === type
              );

              return (
                <div key={type} className='flex flex-wrap gap-2'>
                  <h4 className="block w-full text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1 mt-2 mb-1">
                    {type === "무관" ? "Free" : type}
                    <span className="text-xs text-blue-500 font-medium ml-2">{filteredUsers.length}명</span>
                  </h4>

                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <UserCard key={user.id} user={user} onToggle={toggleStatus} />
                    ))
                  ) : (
                    // <p className="text-xs text-slate-400 w-full ml-1">대기 인원 없음</p>
                    null
                  )}
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
              const players = userList.filter(user => user.matchId === match);
              return (
                <MatchCard key={match} players={players} />
              )
            })}
          </div>
        </main>
        <nav className="fixed bottom-0 max-w-md w-full flex items-center justify-around border-top">
          <button className="pointer" onClick={() => handleJoinWaitList()}>신청</button>
          <li>홈</li>
          <li>내정보</li>
          <li>랭킹</li>
        </nav>

      </div>
    </div>
  )
}

export default App