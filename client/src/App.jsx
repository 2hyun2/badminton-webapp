import { useState, useEffect, useMemo } from "react";

function App() {
        const userList = [
                // 1경기 진행중 (Match ID: 101)
                { id: 1, name: "강백호", tier: "A", rating: 1850, status: "경기중", matchId: 101 },
                { id: 2, name: "서태웅", tier: "A", rating: 1900, status: "경기중", matchId: 101 },
                { id: 3, name: "채치수", tier: "B", rating: 1550, status: "경기중", matchId: 101 },
                { id: 4, name: "정대만", tier: "B", rating: 1600, status: "경기중", matchId: 101 },

                // 2경기 진행중 (Match ID: 102)
                { id: 5, name: "송태섭", tier: "B", rating: 1520, status: "경기중", matchId: 102 },
                { id: 6, name: "이달재", tier: "C", rating: 1200, status: "경기중", matchId: 102 },
                { id: 7, name: "신준섭", tier: "A", rating: 1780, status: "경기중", matchId: 102 },
                { id: 8, name: "전호장", tier: "B", rating: 1450, status: "경기중", matchId: 102 },

                // 대기열 (6명)
                { id: 9, name: "윤대협", tier: "A", rating: 1880, status: "대기중" },
                { id: 10, name: "성현준", tier: "B", rating: 1580, status: "대기중" },
                { id: 11, name: "김수겸", tier: "A", rating: 1820, status: "대기중" },
                { id: 12, name: "변덕규", tier: "B", rating: 1500, status: "대기중" },
                { id: 13, name: "허태환", tier: "C", rating: 1350, status: "대기중" },
                { id: 14, name: "안영수", tier: "C", rating: 1300, status: "대기중" },

                // 휴식 중 (3명)
                { id: 15, name: "권준호", tier: "C", rating: 1100, status: "휴식중" },
                { id: 16, name: "이정환", tier: "A", rating: 1950, status: "휴식중" },
                { id: 17, name: "고민구", tier: "B", rating: 1480, status: "휴식중" },
        ];

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

        const statusColor = {
                "대기중": "text-blue-600 bg-blue-50",
                "경기중": "text-red-600 bg-red-50",
                "휴식중": "text-gray-500 bg-gray-100"
        };

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
                                        <div className="wating-list flex flex-wrap gap-2 p-4">
                                                <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-2 mb-4">
                                                        현재 대기열
                                                        <span className="text-sm text-blue-500 font-medium ml-2">{userList.filter(item => item.status === "대기중").length}명</span>
                                                </h4>
                                                {userList
                                                        .filter(item => item.status === "대기중")
                                                        .map((user) => (
                                                                <div className="inline-flex bg-gray-50 rounded-lg border  p-2 mb-3" key={user.id}>
                                                                        <div className="flex items-center gap-2 font-weight-600">
                                                                                <span className="font-bold">{user.name}</span>
                                                                                {/* <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{user.tier}조</span> */}
                                                                                <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded">{user.rating}점</span>
                                                                        </div>
                                                                </div>
                                                        ))
                                                }
                                        </div>
                                        <div className="playing-list flex flex-wrap gap-2 p-4">
                                                <h4 className="w-full text-lg font-semibold text-slate-800 border-b border-slate-600 pb-2 mb-4">
                                                        경기 진행중
                                                        <span className="text-sm text-blue-500 font-medium ml-2">
                                                                {/* {new Set(userList.filter(item => item.status === "경기중").map(item => item.matchId)).size}팀 */}
                                                                {matchIds.length}팀
                                                        </span>
                                                </h4>
                                                {
                                                        matchIds.map(match => {
                                                                const players = userList.filter(user => user.matchId === match);
                                                                console.log(players);
                                                                return (
                                                                        <div className="flex gap-4 items-center justify-space w-full border" key={match}>
                                                                                <div className="team team1">
                                                                                        <span>
                                                                                                {players[0].name}
                                                                                                {players[0].rating}
                                                                                        </span>
                                                                                        <span>
                                                                                                {players[1].name}
                                                                                                {players[1].rating}
                                                                                        </span>
                                                                                </div>
                                                                                <div className="team team2">
                                                                                        <span>
                                                                                                {players[2].name}
                                                                                                {players[2].rating}
                                                                                        </span>
                                                                                        <span>
                                                                                                {players[3].name}
                                                                                                {players[3].rating}
                                                                                        </span>
                                                                                </div>
                                                                        </div>
                                                                )
                                                        })
                                                }
                                        </div>
                                </main>
                                <nav className="fixed bottom-0 max-w-md w-full flex items-center justify-around border-top">
                                        <button className="pointer">신청</button>
                                        <li>홈</li>
                                        <li>내정보</li>
                                        <li>랭킹</li>
                                </nav>

                        </div>
                </div>
        )
}

export default App