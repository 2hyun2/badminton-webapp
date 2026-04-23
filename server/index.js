// 1. 필요한 도구 임포트 (Node에서는 require를 씁니다)
const express = require("express");
const cors = require("cors");

// 2. 서버 앱 생성
const app = express();

// 3. 서버 설정 (미들웨어)
app.use(cors()); // 리액트(다른 포트)에서 오는 요청을 허용
app.use(express.json()); // 리액트가 보낸 JSON 데이터를 해석 가능하게 함

// 4. 임시 데이터 (나중에 DB로 옮길 데이터)
let userList = [
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
];

// 5. 길 뚫기 (API 엔드포인트)

// [GET] 유저 목록 가져오기
app.get("/api/users", (req, res) => {
  // 리액트가 이 주소로 요청하면 userList를 보내줌
  res.json(userList);
});

app.post("/api/match/start", (req, res) => {
  const { selectedIds } = req.body;
  const newMatchId = Date.now(); // 새로운 경기 ID 생성

  console.log("매칭 시작 유저 IDs:", selectedIds);

  // 1. 서버 메모리의 userList 상태를 변경
  userList = userList.map((user) => {
    // 선택된 4명에 포함된다면
    const slotIndex = selectedIds.indexOf(user.id);
    if (slotIndex !== -1) {
      return {
        ...user,
        status: "경기중",
        matchId: newMatchId,
        matchSlot: slotIndex, // 슬롯 번호(의자 번호) 부여
      };
    }
    return user;
  });

  // 2. 변경된 전체 리스트를 다시 응답으로 보내줌
  // (리액트가 이 데이터를 받아서 setUserList를 하면 화면이 바로 동기화됩니다)
  res.status(200).json({
    message: "매칭 성공!",
    updatedList: userList
  });
});


// 6. 서버 문 열기 (실행)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 아주 잘 돌아가고 있습니다!`);
});