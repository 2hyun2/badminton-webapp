require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require('http'); 
const { Server: SocketIOServer } = require("socket.io"); // 이름을 SocketIOServer로 통일

const bcrypt = require('bcrypt');
const app = express();

// 1. 서버 초기화 통합
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB 연결 성공"))
    .catch((err) => console.log("MongoDB 연결 실패:", err));

// --- 헬퍼 함수 ---
const getKSTNow = () => {
    const now = new Date();
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    return new Date(now.getTime() + KR_TIME_DIFF);
};

const getKSTText = () => {
    return new Date().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    });
};

// --- 스키마 정의 ---
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthday: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String, required: true },
    tier: { type: String, default: null },
    rating: { type: Number, default: 1500 },
    status: { type: String, default: "휴식중" },
    matchId: { type: Number, default: null },
    isPresent: { type: Boolean, default: false },
    entryTime: { type: Date, default: null },
    exitTime: { type: Date, default: null },
    matchSlot: { type: Number, default: null },
    groupId: { type: String, default: null },
    preferredMatch: { type: String, default: null },
    playCount: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    role: { type: String, default: "회원" },
    joinedAt: { type: Date, default: getKSTNow },
    updatedAt: { type: Date, default: getKSTNow },
});

const matchSchema = new mongoose.Schema({
    matchId: { type: Number, required: true },
    matchDate: { type: Date, default: getKSTNow },
    teamA: [Number],
    teamB: [Number],
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    winner: String,
    eloDelta: Number,
    matchType: String,
});

const User = mongoose.model("User", userSchema, "badmintonsample");
const Match = mongoose.model("Match", matchSchema);

// --- Socket.io 이벤트 ---
io.on('connection', (socket) => {
    console.log('클라이언트 연결:', socket.id);
    socket.on('disconnect', () => console.log('연결 해제:', socket.id));
});

// --- API 라우트 ---

// 아이디 중복 확인
app.post('/api/users/check-id', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ isAvailable: false, message: '아이디를 입력해 주세요.' });
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ isAvailable: false, message: '이미 사용 중인 아이디입니다.' });
        return res.status(200).json({ isAvailable: true, message: '사용 가능한 아이디입니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 회원가입
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, password, birthday, name, gender } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });

        const lastUser = await User.findOne().sort({ id: -1 });
        const nextId = lastUser ? lastUser.id + 1 : 1;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ id: nextId, username, password: hashedPassword, birthday, name, gender });
        await newUser.save();
        res.status(201).json({ success: true, message: '회원가입 완료!' });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 로그인
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }
        const { password: _, ...userData } = user._doc;
        res.status(200).json({ success: true, user: userData });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 현재 입장해 있는 유저 목록 조회
app.get('/api/users/present', async (req, res) => {
    try {
        const presentUsers = await User.find({ isPresent: true });
        res.status(200).json(presentUsers);
    } catch (error) {
        console.error('현재 입장 유저 조회 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 입장
app.post('/api/users/entry', async (req, res) => {
    try {
        const { userId } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { isPresent: true, status: "휴식중", entryTime: getKSTNow(), exitTime: null },
            { new: true }
        );
        io.emit('users:update', { type: 'ENTRY', user: updatedUser });
        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});
// 퇴장
app.post('/api/users/exit', async (req, res) => {
    try {
        const { userId } = req.body;
        const exitingUser = await User.findOne({ id: userId });
        if (!exitingUser) return res.status(404).json({ message: '유저 없음' });

        if (exitingUser.status === "경기중") {
            await User.updateMany({ matchId: exitingUser.matchId }, { status: "휴식중", matchId: null });
        }

        await User.updateOne({ id: userId }, { isPresent: false, status: "퇴장", exitTime: getKSTNow() });
        io.emit('users:update', { type: 'EXIT', userId });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 경기 시작
app.post("/api/match/start", async (req, res) => {
    const { selectedIds } = req.body;
    const newMatchId = Date.now();
    try {
        for (let i = 0; i < selectedIds.length; i++) {
            await User.updateOne({ id: selectedIds[i] }, { status: "경기중", matchId: newMatchId, matchSlot: i });
        }
        io.emit('match:update', { type: 'START', matchId: newMatchId });
        res.status(200).json({ message: "매칭 성공!" });
    } catch (error) {
        res.status(500).json({ message: "실패" });
    }
});

// 경기 종료 (Elo 반영)
app.post("/api/match/end", async (req, res) => {
    const { matchId, winnerTeam, scoreA, scoreB } = req.body;
    const K = 32;
    try {
        const participants = await User.find({ matchId: matchId });
        if (winnerTeam !== 'cancel' && participants.length < 4) {
            return res.status(400).json({ message: "인원이 부족합니다." });
        }

        const teamA = participants.filter(u => u.matchSlot === 0 || u.matchSlot === 1);
        const teamB = participants.filter(u => u.matchSlot === 2 || u.matchSlot === 3);

        let ratingChange = 0;
        if (winnerTeam !== 'cancel') {
            const avgA = teamA.reduce((acc, u) => acc + u.rating, 0) / teamA.length;
            const avgB = teamB.reduce((acc, u) => acc + u.rating, 0) / teamB.length;
            const expectedA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
            ratingChange = Math.round(K * ((winnerTeam === 'A' ? 1 : 0) - expectedA));
        }

        for (const user of participants) {
            const isTeamA = user.matchSlot === 0 || user.matchSlot === 1;
            const isWin = (winnerTeam === 'A' && isTeamA) || (winnerTeam === 'B' && !isTeamA);
            const change = isTeamA ? ratingChange : -ratingChange;

            await User.updateOne(
                { id: user.id },
                {
                    status: "휴식중", matchId: null, matchSlot: null,
                    playCount: winnerTeam === 'cancel' ? user.playCount : user.playCount + 1,
                    wins: isWin ? user.wins + 1 : user.wins,
                    losses: (winnerTeam !== 'cancel' && !isWin) ? user.losses + 1 : user.losses,
                    rating: user.rating + (winnerTeam === 'cancel' ? 0 : change)
                }
            );
        }

        if (winnerTeam !== 'cancel') {
            await Match.create({
                matchId, teamA: teamA.map(u => u.id), teamB: teamB.map(u => u.id),
                scoreA, scoreB, winner: winnerTeam, eloDelta: Math.abs(ratingChange)
            });
        }

        io.emit('match:update', { type: 'END', matchId });
        res.status(200).json({ message: "결과 반영 완료" });
    } catch (err) {
        res.status(500).json({ message: "오류 발생" });
    }
});

// 서버 실행
const PORT = 5000;
httpServer.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});