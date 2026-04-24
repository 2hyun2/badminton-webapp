
const express = require("express"); // 서버 개설
const cors = require("cors"); // 타 도메인 요청 허용

const app = express(); // express 객체 생성

app.use(cors()); // 타 도메인으로부터의 API 요청을 허용
app.use(express.json()); // 클라이언트가 보낸 JSON 데이터를 req.body에 담아줌

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

app.get("/api/users", (req, res) => {
    res.json(userList);
});

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

    res.status(200).json({
        message: "매칭 성공!",
        updatedList: userList
    });
});

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

    const avgA = (teamA[0]?.rating + teamA[1]?.rating) / 2;
    const avgB = (teamB[0]?.rating + teamB[1]?.rating) / 2;

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
            rating: user.rating + ratingChange
        };
    });

    res.status(200).json({
        message: "Elo 레이팅이 반영되었습니다.",
        updatedList: userList
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 아주 잘 돌아가고 있습니다!`);
});