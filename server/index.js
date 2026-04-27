require("dotenv").config();
const express = require("express"); // 서버 개설
const cors = require("cors"); // 타 도메인 요청 허용
const mongoose = require("mongoose");

const fs = require("fs"); // 파일 시스템 모듈
const path = require("path") // 경로 설정 모듈

const app = express(); // express 객체 생성

app.use(cors()); // 타 도메인으로부터의 API 요청을 허용
app.use(express.json()); // 클라이언트가 보낸 JSON 데이터를 req.body에 담아줌

// console.log("👀 Mongoose의 진짜 정체:", typeof mongoose, mongoose);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB 연결 성공! 이제 데이터가 날아가지 않습니다."))
    .catch((err) => console.log("❌ MongoDB 연결 실패:", err));

// 유저 모델: 로그인 정보 + 프로필 + 전적
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // 기존에 쓰던 숫자 ID 유지
    username: { type: String, unique: true, sparse: true },
    password: { type: String },
    name: String,
    gender: String,
    tier: String,
    rating: { type: Number, default: 1500 },
    status: { type: String, default: "휴식중" },
    matchId: { type: Number, default: null },
    matchSlot: { type: Number, default: null },
    groupId: { type: String, default: null },
    preferredMatch: { type: String, default: null },
    playCount: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    role: { type: String, default: "회원" },
    joinedAt: { type: Date, default: Date.now }
});

// 경기 결과 모델: 날짜별 영수증
const matchSchema = new mongoose.Schema({
    matchId: { type: Number, required: true },
    matchDate: { type: Date, default: Date.now },
    teamA: [Number], // 참여 유저 id 리스트
    teamB: [Number],
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    winner: String,    // 'A', 'B', 'cancel'
    eloDelta: Number,  // 이 판으로 변동된 레이팅 값
    matchType: String
});

// const User = mongoose.model("User", userSchema, "badmintonsample");
const User = mongoose.model("User", userSchema, "badmintonsample");
const Match = mongoose.model("Match", matchSchema);


// 초기 유저 데이터 
app.get("/api/users", async (req, res) => {
    try {
        // rating 기준 내림차순(-1) 정렬
        const users = await User.find().sort({ rating: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "데이터 로딩 실패" });
    }
});

// 경기 시작(Create)
app.post("/api/match/start", async (req, res) => {
    const { selectedIds } = req.body;
    const newMatchId = Date.now();

    try {
        for (let i = 0; i < selectedIds.length; i++) {
            await User.updateOne(
                { id: selectedIds[i] },
                {
                    status: "경기중",
                    matchId: newMatchId,
                    matchSlot: i,
                }
            )
        }

        const updatedList = await User.find();
        res.status(200).json({ message: "매칭 성공!", updatedList });
    } catch (error) {
        res.status(500).json({ message: "매칭 시작 처리 실패" });
    }



});
// 경기 종료 및 Elo 반영 (핵심 로직)
app.post("/api/match/end", async (req, res) => {
    const { matchId, winnerTeam, scoreA, scoreB } = req.body;
    const K = 32;

    try {
        // 1. 해당 경기 참여자 DB에서 가져오기
        const participants = await User.find({ matchId: matchId });
        if (participants.length < 4 && winnerTeam !== 'cancel') {
            return res.status(400).json({ message: "인원이 부족합니다." });
        }

        // 2. 레이팅 계산 (유저님이 짜신 로직 그대로 활용)
        const teamA = participants.filter(u => u.matchSlot === 0 || u.matchSlot === 1);
        const teamB = participants.filter(u => u.matchSlot === 2 || u.matchSlot === 3);

        const getAvg = (team) => team.reduce((acc, u) => acc + u.rating, 0) / team.length;
        const avgA = getAvg(teamA);
        const avgB = getAvg(teamB);

        const expectedA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
        const ratingChange = Math.round(K * ((winnerTeam === 'A' ? 1 : 0) - expectedA));

        // 3. DB 업데이트 (각 유저 상태 및 점수 갱신)
        for (const user of participants) {
            const isTeamA = user.matchSlot === 0 || user.matchSlot === 1;
            const isWin = (winnerTeam === 'A' && isTeamA) || (winnerTeam === 'B' && !isTeamA);
            const change = isTeamA ? ratingChange : -ratingChange;

            await User.updateOne(
                { id: user.id },
                {
                    status: "휴식중",
                    matchId: null,
                    matchSlot: null,
                    playCount: winnerTeam === 'cancel' ? user.playCount : user.playCount + 1,
                    wins: isWin ? user.wins + 1 : user.wins,
                    losses: (winnerTeam !== 'cancel' && !isWin) ? user.losses + 1 : user.losses,
                    rating: winnerTeam === 'cancel' ? user.rating : user.rating + change
                }
            );
        }

        // 4. [신규] Matches 컬렉션에 경기 결과 영수증 저장
        if (winnerTeam !== 'cancel') {
            await Match.create({
                matchId,
                teamA: teamA.map(u => u.id),
                teamB: teamB.map(u => u.id),
                scoreA,
                scoreB,
                winner: winnerTeam,
                eloDelta: Math.abs(ratingChange) // 변동 폭 저장
            });
        }

        const updatedList = await User.find();
        res.status(200).json({ message: "결과 반영 완료", updatedList });
    } catch (err) {
        res.status(500).json({ message: "결과 처리 중 오류 발생" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 아주 잘 돌아가고 있습니다!`);
});