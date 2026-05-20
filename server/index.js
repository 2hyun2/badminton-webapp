require("dotenv").config(); // 환경 변수(.env 파일) 로드
process.env.TZ = "Asia/Seoul"; // 타임존 설정
const express = require("express"); // 웹 서버 프레임워크
const cors = require("cors"); // 교차 출처 공유 허용
const mongoose = require("mongoose"); // MongoDB 모델링 도구
const jwt = require('jsonwebtoken'); // JWT 토큰 생성 및 검증
const http = require('http');
const { Server: SocketIOServer } = require("socket.io"); // 이름을 SocketIOServer로 통일
const bcrypt = require('bcrypt'); // 비밀번호 암호화 도구
const cron = require('node-cron'); // 스케줄러 추가

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB 연결 성공");
    })
    .catch((err) => console.log("MongoDB 연결 실패:", err));

// 서버 시간대를 최상위에서 Asia/Seoul로 설정해서 new Date로 변경
const getKSTNow = () => new Date();

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
    status: { type: String, default: "RESTING" },
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
    role: { type: String, default: "USER" },
    joinedAt: { type: Date, default: getKSTNow },
    updatedAt: { type: Date, default: getKSTNow },
    bio: { type: String, default: "" },
    todayPlayCount: { type: Number, default: 0 },
    isBirthdayPublic: { type: Boolean, default: false },
    isGenderPublic: { type: Boolean, default: true },
});
// 경기 결과 스키마

// 유저 ID와 소켓 ID를 매핑하기 위한 객체 (개별 알림용)
const userSockets = new Map();
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
// 날짜 기반 조회를 위해 인덱스 추가 (조회 성능 최적화)
matchSchema.index({ matchDate: -1 });

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
        delete userData.password; // 비밀번호는 클라이언트에 보내지 않음

        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET, // .env 파일에 JWT_SECRET 환경 변수 설정 필요
            { expiresIn: '1h' } // 토큰 유효 기간 설정 (예: 1시간)
        );

        res.status(200).json({ success: true, user: userData, token });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ message: '서버 에러' });
    }
});

// 관리자 권한 확인 미들웨어
const adminOnly = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 요청 객체에 사용자 정보 추가
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
        }
        next(); // 다음 미들웨어 또는 라우트 핸들러로 이동
    } catch (error) {
        console.error('토큰 검증 에러:', error);
        return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
};

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
            { isPresent: true, status: "RESTING", entryTime: getKSTNow(), exitTime: null, updatedAt: getKSTNow() },
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

        if (exitingUser.status === "PLAYING" && exitingUser.matchId) {
            await User.updateMany({ matchId: exitingUser.matchId }, { status: "RESTING", matchId: null, updatedAt: getKSTNow() });
        }

        await User.updateOne({ id: userId }, { isPresent: false, status: "OFFLINE", exitTime: getKSTNow(), updatedAt: getKSTNow() });
        io.emit('users:update', { type: 'EXIT', userId });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 유저 정보 업데이트 (보안 강화: 허용된 필드만 업데이트 가능)
const ALLOWED_USER_FIELDS = ['name', 'birthday', 'gender', 'preferredMatch', 'status', 'groupId', 'password', 'isBirthdayPublic', 'isGenderPublic', 'bio'];

app.post('/api/users/update', async (req, res) => {
    try {
        const { updates } = req.body;
        if (!updates) return res.status(400).json({ message: '업데이트할 데이터가 없습니다.' });

        const items = Array.isArray(updates) ? updates : [updates];

        // 비동기 해싱 처리를 위해 Promise.all 사용
        const bulkOps = await Promise.all(items
            .filter(u => u.id)
            .map(async (u) => {
                const filtered = { updatedAt: getKSTNow() };
                for (const key of ALLOWED_USER_FIELDS) {
                    if (u[key] !== undefined && u[key] !== '') {
                        if (key === 'password') {
                            filtered[key] = await bcrypt.hash(u[key], 10);
                        } else {
                            filtered[key] = u[key];
                        }
                    }
                }
                return {
                    updateOne: {
                        filter: { id: u.id },
                        update: { $set: filtered }
                    }
                };
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
                update: { $set: { status: "PLAYING", matchId: newMatchId, matchSlot: index, groupId: null, updatedAt: getKSTNow() } }
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
                $set: { status: "RESTING", matchId: null, matchSlot: null, updatedAt: getKSTNow() }
            };

            // 취소가 아닌 경우에만 스탯 업데이트 (Atomic $inc 사용)
            if (winnerTeam !== 'cancel') {
                updateDoc.$inc = {
                    playCount: 1,
                    todayPlayCount: 1,
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
        const { period, months } = req.query; // 'weekly', 'monthly', 'total', or 'months' (e.g., '1', '3', '5')
        let query = {};

        if (period === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            query.matchDate = { $gte: oneWeekAgo };
        } else if (period === 'monthly') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            query.matchDate = { $gte: oneMonthAgo };
        } else if (months && !isNaN(parseInt(months))) { // 'months' 파라미터 처리
            const numMonths = parseInt(months);
            const NMonthsAgo = new Date();
            NMonthsAgo.setMonth(NMonthsAgo.getMonth() - numMonths);
            query.matchDate = { $gte: NMonthsAgo };
        }
        // 'total'인 경우 쿼리 조건 없음
        // 'months'가 없거나 유효하지 않으면 'total'과 동일하게 모든 기록 조회

        const history = await Match.find(query).sort({ matchDate: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
})

// 특정 유저의 경기 내역 조회
app.get('/api/match/history/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const history = await Match.find({
            $or: [{ teamA: userId }, { teamB: userId }]
        }).sort({ matchDate: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: '내역 조회 실패' });
    }
});

// --- 관리자 전용 API ---

// 모든 사용자 상세 정보 조회
app.get('/api/admin/users', adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // 비밀번호 필드 제외
        res.status(200).json(users.map(user => user.toObject())); // toObject()를 사용하여 mongoose 객체에서 일반 객체로 변환
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 특정 유저 비밀번호를 "0000"으로 초기화
app.post('/api/admin/users/:userId/reset-password', adminOnly, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const hashedPassword = await bcrypt.hash("0000", 10);
        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { $set: { password: hashedPassword, updatedAt: getKSTNow() } },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: '유저 없음' });
        res.status(200).json({ success: true, message: '비밀번호가 0000으로 초기화되었습니다.', user: updatedUser.toObject() });
    } catch (error) {
        res.status(500).json({ message: '초기화 실패' });
    }
});

// 유저 상태 강제 초기화 (경기 중 -> 휴식 중으로 복구)
app.post('/api/admin/users/:userId/reset-status', adminOnly, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { $set: { status: "RESTING", matchId: null, matchSlot: null, updatedAt: getKSTNow() } },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: '유저 없음' });
        io.emit('users:update', { type: 'UPDATE', userId: updatedUser.id, status: updatedUser.status }); // 클라이언트에게 유저 목록 업데이트 알림
        res.status(200).json({ success: true, message: '유저 상태가 초기화되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '상태 변경 실패' });
    }
});

// 유저 삭제 (강퇴)
app.delete('/api/admin/users/:userId', adminOnly, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const deletedUser = await User.findOneAndDelete({ id: userId });
        if (!deletedUser) return res.status(404).json({ message: '유저 없음' });
        io.emit('users:update', { type: 'EXIT', userId: deletedUser.id }); // 해당 유저가 입장 중이었는지 여부와 상관없이 삭제 알림
        res.status(200).json({ success: true, message: '사용자가 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '삭제 실패' });
    }
});

// 특정 경기 기록 삭제 (점수 롤백 없이 기록만 제거)
app.delete('/api/admin/matches/:matchId', adminOnly, async (req, res) => {
    try {
        const matchId = parseInt(req.params.matchId);
        const deletedMatch = await Match.findOneAndDelete({ matchId: matchId });
        if (!deletedMatch) {
            return res.status(404).json({ message: '경기 기록을 찾을 수 없습니다.' });
        }
        // ELO 점수 롤백 로직은 복잡하므로, 여기서는 단순히 기록만 삭제합니다.
        // 실제 구현 시에는 deletedMatch.teamA, deletedMatch.teamB, deletedMatch.eloDelta 등을
        // 활용하여 참여자들의 레이팅을 되돌리는 로직이 필요합니다.
        io.emit('match:update', { type: 'DELETE', matchId: deletedMatch.matchId });
        res.status(200).json({ success: true, message: '경기 기록이 삭제되었습니다.' });
    } catch (error) {
        console.error('경기 기록 삭제 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 서버 실행
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});