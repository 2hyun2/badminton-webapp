
const express = require("express"); // 서버 개설
const cors = require("cors"); // 타 도메인 요청 허용
const fs = require("fs"); // 파일 시스템 모듈
const path = require("path") // 경로 설정 모듈

const app = express(); // express 객체 생성

app.use(cors()); // 타 도메인으로부터의 API 요청을 허용
app.use(express.json()); // 클라이언트가 보낸 JSON 데이터를 req.body에 담아줌

const DATA_FILE = path.join(__dirname, "users.json");

try {
  const fileData = fs.readFileSync(DATA_FILE, "utf-8");
  userList = JSON.parse(fileData);
  console.log("userList 불러오기 성공")
} catch (error) {
  console.log("파일 불러오기 실패 && 빈 배열 시작");
}

const saveToFile = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(userList, null, 2));
}

// 1. GET: READ
app.get('/posts', (req, res) => {
  res.send('게시글 목록을 보내드립니다.');
});

// 2. POST: CREATE
app.post('/posts', (req, res) => {
  res.send('게시글이 등록되었습니다.');
  // req.body에 담긴 내용을 DB에 저장
});

// 3. PUT: UPDATE
app.put('/posts/:id', (req, res) => {
  res.send(`${req.params.id}번 게시글이 수정되었습니다.`);
  // req.params.id로 몇 번 글인지 확인하고 req.body로 내용 수정
});

// 4. DELETE: DELETE
app.delete('/posts/:id', (req, res) => {
  res.send(`${req.params.id}번 게시글이 삭제되었습니다.`);
});



app.get("/api/users", (req, res) => {
  res.json(userList);
});

// 경기 시작(Create)
app.post("/api/match/start", (req, res) => {
  const { selectedIds } = req.body;
  const newMatchId = Date.now();

  console.log("매칭 시작 유저 IDs:", selectedIds);

  userList = userList.map((user) => {
    const slotIndex = selectedIds.indexOf(user.id);
    if (slotIndex !== -1) {
      return {
        ...user,
        status: "경기중",
        matchId: newMatchId,
        matchSlot: slotIndex,
      };
    }
    return user;
  });

  saveToFile();

  res.status(200).json({
    message: "매칭 성공!",
    updatedList: userList
  });
});
// 경기 끝(Update)
app.post("/api/match/end", (req, res) => {
  const { matchId, winnerTeam } = req.body; // winnerTeam: 'A', 'B', 또는 'cancel'
  const K = 32; // 레이팅 변동폭 상수 (최대 변동치)

  // 1. 해당 경기에 참여한 유저들 찾기
  const participants = userList.filter(u => u.matchId === matchId);

  if (participants.length < 4 && winnerTeam !== 'cancel') {
    return res.status(400).json({ message: "경기 인원이 부족합니다." });
  }

  // 2. 팀별 평균 레이팅 계산
  const teamA = participants.filter(u => u.matchSlot === 0 || u.matchSlot === 1);
  const teamB = participants.filter(u => u.matchSlot === 2 || u.matchSlot === 3);

  const getTeamAvg = (team) => {
    if (!team || team.length === 0) return 1500; // 사람이 없으면 기본점수 1500
    const sum = team.reduce((acc, user) => acc + (user.rating || 1500), 0);
    return sum / team.length; // 1명이면 1명 평균, 2명이면 2명 평균으로 안전하게 계산
  };

  const avgA = getTeamAvg(teamA);
  const avgB = getTeamAvg(teamB);

  // 3. 승리 기대 확률 (Expected Score) 계산
  // 공식: E = 1 / (1 + 10^((상대평균 - 내평균) / 400))
  const expectedA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
  const expectedB = 1 - expectedA;

  // 4. 전체 유저 리스트 업데이트
  userList = userList.map(user => {
    if (user.matchId !== matchId) return user;

    // 공통 업데이트: 경기 종료 상태로 변경
    const baseUpdate = { ...user, status: "휴식중", matchId: null, matchSlot: null, groupId: null, preferredMatch: null, joinedAt: null };
    // [무효화 처리]
    if (winnerTeam === 'cancel') return baseUpdate;

    // [승패 결과 반영]
    const isTeamA = user.matchSlot === 0 || user.matchSlot === 1;
    const isWin = (winnerTeam === 'A' && isTeamA) || (winnerTeam === 'B' && !isTeamA);

    // 실제 결과 (S): 승리는 1, 패배는 0
    const S = isWin ? 1 : 0;
    const E = isTeamA ? expectedA : expectedB;

    // 변동 점수 계산: K * (S - E)
    const ratingChange = Math.round(K * (S - E));

    return {
      ...baseUpdate,
      playCount: winnerTeam === 'cancel' ? user.playCount : user.playCount + 1,
      wins: isWin ? user.wins + 1 : user.wins,
      losses: isWin ? user.losses : user.losses + 1,
      rating: (user.rating || 1500) + ratingChange
    };
  });

  saveToFile();

  res.status(200).json({
    message: "Elo 레이팅이 반영되었습니다.",
    updatedList: userList
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 아주 잘 돌아가고 있습니다!`);
});