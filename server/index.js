require("dotenv").config(); // 환경 변수(.env 파일) 로드
process.env.TZ = "Asia/Seoul"; // 타임존 설정
const express = require("express"); // 웹 서버 프레임워크
const cors = require("cors"); // 교차 출처 공유 허용
const mongoose = require("mongoose"); // MongoDB 모델링 도구
const http = require('http');
const { Server: SocketIOServer } = require("socket.io"); // 이름을 SocketIOServer로 통일
const bcrypt = require('bcrypt'); // 비밀번호 암호화 도구

const app = express();
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
    .then(async () => {
        console.log("MongoDB 연결 성공");
        // 서버 시작 시 데이터가 비어있다면 초기 데이터 삽입
        await seedUsers();
    })
    .catch((err) => console.log("MongoDB 연결 실패:", err));

// 서버 시간대를 최상위에서 Asia/Seoul로 설정해서 new Date로 변경
const getKSTNow = () => new Date();
const getKSTText = () => {
    return new Date().toLocaleString("ko-KR", { // 1. 한국(ko-KR) 언어 규격을 사용
        timeZone: "Asia/Seoul", // 2. 서버 위치와 상관없이 '서울' 시간대 적용
        year: "numeric", // 3. 연도 (예: 2026)
        month: "2-digit", // 4. 월 (05월 처럼 2자리로)
        day: "2-digit", // 5. 일 (12일 처럼 2자리로)
        hour: "2-digit", // 6. 시 (2자리)
        minute: "2-digit", // 7. 분 (2자리)
        second: "2-digit", // 8. 초 (2자리)
        hour12: false, // 9. 오전/오후 대신 24시간 형식 사용
    });
};

// 데이터베이스 구조 정의 (형식)
// 유저 기본 스키마
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
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
// 경기 결과 스키마
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
//  (변수명,  스키마(구조), DB Table name: default = users)
/**
     * User 모델: 'badmintonsample' 컬렉션(표)에 접근
     * - Schema: 데이터의 규격 (설계도)
     * - Model: DB를 조작하는 기능 (관리 사무소)
     * - Collection: 실제 데이터가 쌓이는 공간 (실제 건물)
*/
const User = mongoose.model("User", userSchema, "badmintonsample");
const Match = mongoose.model("Match", matchSchema);
/* 
  [ 모델 사용 예시 Quick Guide ]
  
  1. 데이터 찾기 (Read)
     - User.find({ isPresent: true }) : 현재 입장 중인 모든 유저 찾기
     - User.findOne({ username: "admin" }) : 특정 아이디를 가진 유저 한 명 찾기
     
  2. 데이터 추가 (Create)
     - const newUser = new User({ name: "홍길동", rating: 1500 });
       await newUser.save();
       
  3. 데이터 수정 (Update)
     - User.updateOne({ id: 1 }, { $set: { status: "경기중" } }) : 특정 유저 상태 변경
     - User.updateMany({ matchId: 101 }, { status: "휴식중" }) : 여러 명 동시 수정
     
  4. 데이터 삭제 (Delete)
     - User.deleteOne({ id: 10 }) : 특정 유저 삭제
     
  5. 숫자 계산 (Atomic Update)
     - User.updateOne({ id: 1 }, { $inc: { playCount: 1, wins: 1 } }) : 기존 값에서 1씩 증가
*/

// socket 연결시 실행 
io.on('connection', (socket) => {
    console.log('클라이언트 연결:', socket.id);
    socket.on('disconnect', () => console.log('연결 해제:', socket.id));
});


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
        const user = await User.findOne({ username }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }
        const userData = user.toObject();
        res.status(200).json({ success: true, user: userData });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 전체 유저 조회
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('유저 조회 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
})

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
            { isPresent: true, status: "휴식중", entryTime: getKSTNow(), exitTime: null, updatedAt: getKSTNow() },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        io.emit('users:update', { type: 'ENTRY' });
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

        if (exitingUser.status === "경기중" && exitingUser.matchId) {
            await User.updateMany({ matchId: exitingUser.matchId }, { status: "휴식중", matchId: null, updatedAt: getKSTNow() });
        }

        await User.updateOne({ id: userId }, { isPresent: false, status: "퇴장", exitTime: getKSTNow(), updatedAt: getKSTNow() });
        io.emit('users:update', { type: 'EXIT', userId });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 유저 정보 업데이트 (보안 강화: 허용된 필드만 업데이트 가능)
const ALLOWED_USER_FIELDS = ['name', 'birthday', 'gender', 'preferredMatch', 'status', 'groupId'];

app.post('/api/users/update', async (req, res) => {
    try {
        const { updates } = req.body;
        if (!updates) return res.status(400).json({ message: '업데이트할 데이터가 없습니다.' });

        const processUpdate = (u) => {
            const filtered = {};
            ALLOWED_USER_FIELDS.forEach(key => {
                if (u[key] !== undefined) filtered[key] = u[key];
            });
            return { ...filtered, updatedAt: getKSTNow() };
        };

        const items = Array.isArray(updates) ? updates : [updates];
        const bulkOps = items
            .filter(u => u.id)
            .map(u => ({
                updateOne: {
                    filter: { id: u.id },
                    update: { $set: processUpdate(u) }
                }
            }));

        if (bulkOps.length > 0) await User.bulkWrite(bulkOps);

        io.emit('users:update', { type: 'UPDATE' });
        res.status(200).json({ success: true, message: '정보가 업데이트되었습니다.' });
    } catch (error) {
        console.error('유저 업데이트 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 경기 시작
app.post("/api/match/start", async (req, res) => {
    const { selectedIds } = req.body;
    const newMatchId = Date.now();
    if (!selectedIds || selectedIds.length !== 4) return res.status(400).json({ message: "4명을 선택해야 합니다." });

    try {
        const bulkOps = selectedIds.map((id, index) => ({
            updateOne: {
                filter: { id },
                update: { $set: { status: "경기중", matchId: newMatchId, matchSlot: index, groupId: null, updatedAt: getKSTNow() } }
            }
        }));
        await User.bulkWrite(bulkOps);

        io.emit('match:update', { type: 'START', matchId: newMatchId });
        res.status(200).json({ message: "매칭 성공!" });
    } catch (error) {
        res.status(500).json({ message: "실패" });
    }
});

// 경기 종료 (Elo 반영)
app.post("/api/match/end", async (req, res) => {
    const { matchId, winnerTeam, scoreA, scoreB } = req.body;
    if (!matchId) return res.status(400).json({ message: "매치 ID가 필요합니다." });
    const K = 32;
    try {
        const participants = await User.find({ matchId: matchId });
        if (participants.length === 0) {
            return res.status(404).json({ message: "해당 경기의 참가자를 찾을 수 없습니다." });
        }

        const teamA = participants.filter(u => u.matchSlot === 0 || u.matchSlot === 1);
        const teamB = participants.filter(u => u.matchSlot === 2 || u.matchSlot === 3);

        let ratingChange = 0;
        if (winnerTeam !== 'cancel') {
            const avgA = teamA.length ? teamA.reduce((acc, u) => acc + u.rating, 0) / teamA.length : 1500;
            const avgB = teamB.length ? teamB.reduce((acc, u) => acc + u.rating, 0) / teamB.length : 1500;
            const expectedA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
            ratingChange = Math.round(K * ((winnerTeam === 'A' ? 1 : 0) - expectedA));
        }

        const bulkOps = participants.map(user => {
            const isTeamA = user.matchSlot === 0 || user.matchSlot === 1;
            const isTeamB = user.matchSlot === 2 || user.matchSlot === 3;
            const isWin = (winnerTeam === 'A' && isTeamA) || (winnerTeam === 'B' && isTeamB);
            const change = isTeamA ? ratingChange : -ratingChange;

            const updateDoc = {
                $set: { status: "휴식중", matchId: null, matchSlot: null, updatedAt: getKSTNow() }
            };

            // 취소가 아닌 경우에만 스탯 업데이트 (Atomic $inc 사용)
            if (winnerTeam !== 'cancel') {
                updateDoc.$inc = {
                    playCount: 1,
                    wins: isWin ? 1 : 0,
                    losses: isWin ? 0 : 1,
                    rating: change
                };
            }

            return {
                updateOne: {
                    filter: { id: user.id },
                    update: updateDoc
                }
            };
        });

        await User.bulkWrite(bulkOps);

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

// 경기 내역
app.get('/api/match/history', async (req, res) => {
    try {
        const history = await Match.find().sort({ matchDate: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
})

// 서버 실행
const PORT = 5000;
httpServer.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});