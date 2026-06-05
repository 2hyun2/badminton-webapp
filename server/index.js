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
const rateLimit = require('express-rate-limit'); // 요청 제한 라이브러리

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: { // cors(Cross-Origin Resource Sharing): 다른 도메인에서 오는 요청을 허락할지 결정
        origin: "http://localhost:5173", // localhost:5173만 허락
        methods: ["GET", "POST"],
        credentials: true // 쿠키, 토큰 허용
    }
});
io.on('connection', (socket) => {
    console.log('클라이언트 연결:', socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) socket.join(`user_${userId}`);

    socket.on('disconnect', () => console.log('연결 해제:', socket.id));
});

app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI)
    .then(console.log("MongoDB 연결 성공"))
    .catch((err) => console.log("MongoDB 연결 실패", err));

// process.env.TZ = "Asia/Seoul" 서버 시간 설정 완료 newDate = 한국 시간
const getKSTNow = () => new Date();

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: '1개의 아이피당 1시간에 5번 가입요청이 가능합니다. 개인 데이터를 사용해주세요.' },
    standardHeaders: true,
})


// required: true => 필수 값
// unique: true -> 중복 불가(유일 값)
// select: false -> 데이터 불러올 시 해당 key는 제외 (비밀번호 숨김)

// 회원가입 신청서 양식
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
    role: { type: String, default: "USER", enum: ["USER", "MANAGER", "ADMIN"] },
    joinedAt: { type: Date, default: getKSTNow },
    updatedAt: { type: Date, default: getKSTNow },
    bio: { type: String, default: "" },
    todayPlayCount: { type: Number, default: 0 },
    isBirthdayPublic: { type: Boolean, default: false },
    isGenderPublic: { type: Boolean, default: true },
});

// 경기 신청서 양식
const matchSchema = new mongoose.Schema({
    matchId: { type: Date, required: true }, // Changed from Number to Date
    matchDate: { type: Date, default: getKSTNow },
    teamA: [Number], // []: 배열 Number: 숫자 = 배열 안에 숫자들이 들어감
    teamB: [Number],
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    winner: String,
    eloDelta: Number,
    matchType: String,
});

// 날짜 기반 조회를 위해 인덱스 추가 (조회 성능 최적화: 최신순 정렬 목차 생성)
matchSchema.index({ matchDate: -1 });

// (변수명, 스키마(구조), DB Table name: default = users)
const User = mongoose.model("User", userSchema, "users");
const Match = mongoose.model("Match", matchSchema, "matches");
/* 
  [ 모델 사용 예시 Quick Guide ]
  
    데이터 찾기 (Read)
     - User.find({ isPresent: true }) : 현재 입장 중인 모든 유저 찾기
     - User.findOne({ username: "admin" }) : 특정 아이디를 가진 유저 한 명 찾기
     
    데이터 추가 (Create)
     - const newUser = new User({ name: "홍길동", rating: 1500 });
       await newUser.save();
       
    데이터 수정 (Update)
     - User.updateOne({ id: 1 }, { $set: { status: "경기중" } }) : 특정 유저 상태 변경 (영수증 반환)
     - User.updateMany({ matchId: 101 }, { status: "휴식중" }) : 여러 명 동시 수정
     
    데이터 삭제 (Delete)
     - User.deleteOne({ id: 10 }) : 특정 유저 삭제
     
    데이터 숫자 업데이트 (Atomic Update)
     - User.updateOne({ id: 1 }, { $inc: { playCount: 1, wins: 1 } }) : 기존 값에서 1씩 증가

    데이터 찾기 && 수정/삭제 (Find & Modify)
     - User.findOneAndUpdate({ id: 1 }, { status: "휴식중" }, { new: true }) 
        : (1타 2피) 1번 유저 상태를 수정하고, 그 '수정된 최신 데이터'를 바로 가져오기 
        : { new: true } 필수 아닌 명시 필요 
        : return 데이터
     - User.findOneAndDelete({ id: 1 }) 
        : 삭제를 하긴 하는데, "방금 지워진 애가 누구였지?" 하고 지운 데이터를 마지막으로 확인하기

    데이터 찾기 && 정렬 (Sort & Limit) - 랭킹이나 게시판에 필수!
     - User.find().sort({ rating: -1 }).limit(10) 
       : 점수(rating)가 높은 순서(-1)로 정렬해서, 딱 상위 10명(limit)만 데려오기! (1은 낮은 순)

    데이터 고속 계산 (Count & Exists)
     - User.countDocuments({ isPresent: true }) 
       : 현재 체육관에 들어온 사람이 "총 몇 명인지(숫자)"만 초고속으로 세기 (find보다 훨씬 빠름)
     - User.exists({ username: "test" }) 
       : "test"라는 아이디가 DB에 있는지 없는지(true/false)만 가볍게 물어보기 (중복 검사할 때 최고!)

    데이터 추출 (Select)
     - User.find().select('-password') : 유저를 다 찾되, 비밀번호 필드만 쏙 '빼고(-)' 가져오기
     - User.findOne({ id: 1 }).select('name rating') : 이름이랑 점수 필드만 쏙 '골라서' 가져오기
*/

// 아이디 중복 확인
app.post('/api/users/check-id', async (req, res) => {
    try {
        const { username } = req.body; // 프론트 POST 값에서 username  구조 분해 할당
        if (!username) return res.status(400).json({ isUnique: false, message: '아이디를 입력해 주세요.' }); // username 부재시 error 400

        const existingUser = await User.findOne({ username }); // 데이터 찾기 (Read) User.findOne 으로 값 1개 찾기
        if (existingUser) return res.status(400).json({ isUnique: false, message: '이미 사용 중인 아이디입니다.' });

        return res.status(200).json({ isUnique: true, message: '사용 가능한 아이디입니다.' });
    } catch (error) {
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});
// 회원가입
app.post('/api/users/register', registerLimiter, async (req, res) => {
    try {
        const { username, password, birthday, name, gender } = req.body;
        if (!username || !password || !birthday || !name || !gender) return res.status(400).json({ message: '모든 필드를 입력해 주세요.' }); // 빈 값 존재시 error

        const existingUser = await User.findOne({ username }); // 아이디 중복 체크 한번 더 더블 체크
        if (existingUser) return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });

        // 고유 ID 발급 
        const lastUser = await User.findOne().sort({ id: -1 });  // 유저 찾기 - 역순으로
        const nextId = lastUser ? lastUser.id + 1 : 1; // 최근 가입 유저 존재시 ID = 최근 유저 ID + 1 || 1
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화  - 암호화 된 비밀번호 설계자인 나도 모름 초기화만이 답.

        // 데이터 추가 (Create) - await newUser.save();
        // schema 양식 - 필수값 넣기 - 없는 key 는 default || null
        const newUser = new User({ id: nextId, username, password: hashedPassword, birthday, name, gender }); // 한국인 기준 id = username 인데 db 상 이름은 username 이 맞다.
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
        const user = await User.findOne({ username: username }).select('+password'); // user 라는 객체 - { 유저 찾기: username(ID) + .select('+password')로 비밀번호 추가 요청 }
        if (!user || !(await bcrypt.compare(password, user.password))) { // 
            return res.status(400).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        const userData = user.toObject(); // 데이터를 객체로 변환
        delete userData.password; // 객체 - password 항목 삭제

        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.id, role: user.role }, // 토큰에 들어갈 정보 Payload
            process.env.JWT_SECRET, // .env - secret key
            { expiresIn: '1h' } // 토큰 유효 기간 설정 (예: 1시간)
        );

        res.status(200).json({ success: true, user: userData, token });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ message: '서버 에러' });
    }
});
// 전체 유저 조회
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find() // 데이터 찾기 (Read) - 유저 전체 *비밀번호는 schema 에서 제외함*
        res.status(200).json(users);
    } catch (error) {
        console.error('유저 조회 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
})
// 전체 유저 조회 - 입장 상태인 유저만
app.get('/api/users/present', async (req, res) => {
    try {
        const presentUsers = await User.find({ isPresent: true }); // 데이터 찾기 (Read) - 유저 전체 - isPresent: true: 출석 상태의 유저만
        res.status(200).json(presentUsers);
    } catch (error) {
        console.error('현재 입장 유저 조회 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});
// 로그인 => 입장
// io.emit('users:update', { type: 'ENTRY' });
app.post('/api/users/entry', async (req, res) => {
    try {
        const { userId } = req.body;
        const updatedUser = await User.findOneAndUpdate( // 데이터 찾기 && 수정/삭제 (Find & Modify)
            { id: userId }, // 조건: id === userId
            { isPresent: true, status: "RESTING", entryTime: getKSTNow(), exitTime: null, updatedAt: getKSTNow() }, // 데이터 변경
            { new: true } // updatedUser 에 변경값 넣기
        );

        if (!updatedUser) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

        io.emit('users:update', { type: 'ENTRY', user: updatedUser }); // socket - users:update 부가 데이터 { type: 'ENTRY' }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});
// 로그인 => 퇴장
// io.emit('users:update', { type: 'EXIT', userId });
app.post('/api/users/exit', async (req, res) => {
    try {
        const { userId } = req.body;
        const exitingUser = await User.findOne({ id: userId });
        if (!exitingUser) return res.status(404).json({ message: '유저 없음' });

        // 경기중에 퇴장이 된 경우
        if (exitingUser.status === "PLAYING" && exitingUser.matchId) { // 퇴장을 요청하는 유저 - 경기중 && 경기코드도 있다.
            // 데이터 수정 (Update) - User.updateMany: 여러 명 동시 수정
            // userList - { matchId 일치 }, { 상태 강제 변경 } 업데이트 데이터 return X
            await User.updateMany(
                { matchId: exitingUser.matchId },
                { status: "RESTING", matchId: null, groupId: null, updatedAt: getKSTNow() }
            );

            io.emit('match:canceled', {
                matchId: exitingUser.matchId,
                canceledUser: userId,
                message: `${exitingUser}의 유저의 퇴장으로 인해 경기 강제 종료`
            })
        }

        // 유저 한명 서버에 업데이트
        await User.updateOne(
            { id: userId }, // 조건
            { isPresent: false, status: "OFFLINE", groupId: null, exitTime: getKSTNow(), updatedAt: getKSTNow() } // 데이터
        );

        io.emit('users:update', { type: 'EXIT', user: exitingUser });  // socket - users:update 부가 데이터 { type: 'EXIT', userId }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

/** UPDATE API */
// 업데이트 가능한 목록
const ALLOWED_USER_FIELDS = ['name', 'birthday', 'gender', 'preferredMatch', 'status', 'groupId', 'password', 'isBirthdayPublic', 'isGenderPublic', 'bio'];
// 업데이트 총괄 // io.emit('users:update', { type: 'UPDATE' });
app.post('/api/users/update', async (req, res) => {
    try {
        const { updates } = req.body; // 데이터 뭐가 올지 모름
        if (!updates) return res.status(400).json({ message: '업데이트할 데이터가 없습니다.' });
        // 값이 배열이면 배열, 아닐시 배열로 감싸기
        const items = Array.isArray(updates) ? updates : [updates];

        // 데이터 처리 과정 
        const bulkOps = await Promise.all(items
            .filter(user => user.id)
            .map(async (user) => {
                const filtered = { updatedAt: getKSTNow() };
                for (const key of ALLOWED_USER_FIELDS) {
                    if (user[key] !== undefined && user[key] !== '') {
                        if (key === 'password') { // 비밀번호 - 암호화
                            filtered[key] = await bcrypt.hash(user[key], 10);
                        } else {
                            filtered[key] = user[key];
                        }
                    }
                }
                return {
                    updateOne: {
                        filter: { id: user.id },
                        update: { $set: filtered }
                    }
                };
            }));

        if (bulkOps.length > 0) await User.bulkWrite(bulkOps); // bulkWrite: 대량 처리 메서드

        io.emit('users:update', { type: 'UPDATE' });

        res.status(200).json({ success: true, message: '정보가 업데이트되었습니다.' });
    } catch (error) {
        console.error('유저 업데이트 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 경기 시작 // io.emit('match:update', { type: 'START', matchId: newMatchId });
app.post("/api/match/start", async (req, res) => {
    const { selectedIds } = req.body; // 경기 매칭 ids  length = 4
    const newMatchId = getKSTNow(); // This will now correctly assign a Date object to a Date field
    if (!selectedIds || selectedIds.length !== 4) return res.status(400).json({ message: "4명을 선택해야 합니다." });

    try {
        const bulkOps = selectedIds.map((id, index) => ({
            updateOne: {
                filter: { id },
                update: { $set: { status: "PLAYING", matchId: newMatchId, matchSlot: index, groupId: null, updatedAt: getKSTNow() } }
            }
        }));
        await User.bulkWrite(bulkOps);

        // io.emit('match:update', { type: 'START', users: selectedIds, matchId: newMatchId });
        selectedIds.forEach(id => {
            io.to(`user_${id}`).emit('match:update', {
                type: 'START',
                matchId: newMatchId,
                userId: id,
                teamA: selectedIds.slice(0, 2), // 팀 정보 추가
                teamB: selectedIds.slice(2, 4)
            });
        })

        // 모든 유저의 리스트(상태)를 동기화하기 위해 전체 공지 추가
        io.emit('users:update', { type: 'UPDATE' });

        res.status(200).json({ message: "매칭 성공!" });
    } catch (error) {
        res.status(500).json({ message: "실패" });
    }
});
// 경기 종료 // io.emit('match:update', { type: 'END', matchId });
app.post("/api/match/end", async (req, res) => {
    const { matchId, winnerTeam, scoreA, scoreB } = req.body;
    if (!matchId) return res.status(400).json({ message: "매치 ID가 필요합니다." });
    const K = 32; // 최대 값

    try {
        const matchedUser = await User.find({ matchId: matchId });
        if (matchedUser.length === 0) {
            return res.status(404).json({ message: "해당 경기의 참가자를 찾을 수 없습니다." });
        }

        const teamA = matchedUser.filter(u => u.matchSlot === 0 || u.matchSlot === 1);
        const teamB = matchedUser.filter(u => u.matchSlot === 2 || u.matchSlot === 3);

        if (teamA.length === 0 || teamB.length === 0) {
            return res.status(400).json({
                message: "팀원이 배정되지 않은 비정상적인 경기입니다. 결과를 무효 처리합니다."
            });
        }

        let ratingChange = 0;
        if (winnerTeam !== 'cancel') {
            const avgA = teamA.reduce((acc, u) => acc + u.rating, 0) / teamA.length;
            const avgB = teamB.reduce((acc, u) => acc + u.rating, 0) / teamB.length;
            const expectedA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
            ratingChange = Math.round(K * ((winnerTeam === 'A' ? 1 : 0) - expectedA));
        }

        const bulkOps = matchedUser.map(user => {
            const isTeamA = user.matchSlot === 0 || user.matchSlot === 1;
            const isTeamB = user.matchSlot === 2 || user.matchSlot === 3;
            const isWin = (winnerTeam === 'A' && isTeamA) || (winnerTeam === 'B' && isTeamB);
            const change = isTeamA ? ratingChange : -ratingChange;

            const updateDoc = { // $set: MongoDB에게 "전체 유지하며, 지정한 항목들만 update 
                $set: { status: "RESTING", matchId: null, matchSlot: null, updatedAt: getKSTNow() }
            };
            // 데이터 숫자 업데이트 (Atomic Update)
            // $inc: { playCount: 1, wins: 1 } }) : 기존 값에서 1씩 증가
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

        matchedUser.forEach(user => {
            io.to(`user_${user.id}`).emit('match:update', {
                type: 'END',
                matchId: matchId,
                teamA: teamA.map(u => u.id),
                teamB: teamB.map(u => u.id),
                winner: winnerTeam,
                eloDelta: Math.abs(ratingChange)
            });
        })

        // 경기 종료 후 유저들의 상태 변화를 모든 클라이언트에 반영
        io.emit('users:update', { type: 'UPDATE' });

        res.status(200).json({ message: "결과 반영 완료" });
    } catch (err) {
        res.status(500).json({ message: "오류 발생" });
    }
});
// 경기 내역
app.get('/api/match/history', async (req, res) => {
    try {
        const { period, months } = req.query; // front params 옵션
        // 'weekly', 'monthly', 'total', or 'months' (e.g., '1', '3', '5')
        let query = {};

        if (period === 'weekly') { // 현재 날짜에서 -7 한 날부터 데이터 갖고와
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            query.matchDate = { $gte: oneWeekAgo }; // $gte (Greater Than or Equal): '크거나 같은(이후의)' 데이터만 찾아라
        } else if (period === 'monthly') { // 현재 날짜에서 
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
// 경기 내역 - 특정 유저 의 기록 갖고오기
app.get('/api/match/history/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const history = await Match.find({ // $or: "배열 안에 있는 조건들 중 **하나라도 만족하면(OR)** 다 가져와!" 라는 DB 명령어
            $or: [{ teamA: userId }, { teamB: userId }]
        }).sort({ matchDate: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: '내역 조회 실패' });
    }
});

// node-cron 활용 특정 시간마다 비활성화 유저 로그아웃화
cron.schedule('*/5 * * * *', async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1시간 전

    try {
        const inactiveUsers = await User.find({
            isPresent: true,
            updatedAt: { $lt: oneHourAgo },
        });
        if (inactiveUsers.length === 0) return;

        await User.updateMany(
            {
                isPresent: true,
                updatedAt: { $lt: oneHourAgo },
            },
            {
                isPresent: false,
                status: "OFFLINE",
                exitTime: getKSTNow(),
                updatedAt: getKSTNow()
            }
        );

        for (const user of inactiveUsers) {
            io.emit('users:update', {
                type: 'EXIT',
                userId: user.id,
                message: `${user.username}님이 1시간 이상 활동이 없어 자동 퇴장되었습니다.`
            });
        }

    } catch (error) {
        console.error('스케줄러 에러:', error);
    }
});

// --- 관리자 전용 API ---

// 미들웨어(Middleware) 함수: API 본 요청이 실행되기 '중간(Middle)'에 가로채서 검사하는 역할입니다.
// 인자에 next 가 존재 
// Express.js 미들웨어의 3번째 인자는 무조건 스위치
const adminOnly = (req, res, next) => {
    const authHeader = req.headers.authorization; // request: header - authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) { // Bearer [토큰문자열] - 통신 규약(HTTP 표준)
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1]; // 위 값에서 공백을 기준으로 0번이 아닌 1번째 값 

    try {
        // jwt.verify: 서버만 알고 있는 비밀키(JWT_SECRET)를 이용해 토큰이 위조되지 않았는지, 기한이 안 지났는지 검증하고 해독(decoded)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // 요청 객체에 사용자 정보 추가
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
        }

        next(); // 통과
    } catch (error) {
        console.error('토큰 검증 에러:', error);
        return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
};

// 관리자 전용 유저 리스트 불러오기 (일반 유저 불러오기랑 아직 별 차이 없음)
app.get('/api/admin/users', adminOnly, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users.map(user => user.toObject())); // toObject()를 사용하여 mongoose 객체에서 일반 객체로 변환
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});
// 관리자 전용 비밀번호 초기화 API (URL에 타겟 유저 번호를 달고 요청합니다)
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
// io.emit('users:update', { type: 'UPDATE', userId: updatedUser.id, status: updatedUser.status }); 
app.post('/api/admin/users/:userId/reset-status', adminOnly, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { $set: { status: "RESTING", matchId: null, matchSlot: null, updatedAt: getKSTNow() } },
            { new: true } // findOneAndUpdate 에 있는 기능
        );
        if (!updatedUser) return res.status(404).json({ message: '유저 없음' });

        io.emit('users:update', { type: 'UPDATE', userId: updatedUser.id, status: updatedUser.status }); // 클라이언트에게 유저 목록 업데이트 알림

        res.status(200).json({ success: true, message: '유저 상태가 초기화되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '상태 변경 실패' });
    }
});
// 관리자 전용 유저 삭제(강퇴) API
// io.emit('users:update', { type: 'EXIT', userId: deletedUser.id });
app.delete('/api/admin/users/:userId', adminOnly, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const deletedUser = await User.findOneAndDelete(
            { id: userId }
        );
        if (!deletedUser) return res.status(404).json({ message: '유저 없음' });

        io.emit('users:update', { type: 'EXIT', userId: deletedUser.id });

        res.status(200).json({ success: true, message: '사용자가 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '삭제 실패' });
    }
});
// 관리자 전용 유저 등급 변경
app.post('/api/admin/users/:userId/update-role', adminOnly, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { role } = req.body;
        // 관리자 자살 방지 로직: 요청을 보낸 관리자가 자신의 등급을 변경하려고 할 때 방지
        if (req.user.userId === userId && req.user.role === 'ADMIN') {
            return res.status(403).json({ message: '관리자는 자신의 등급을 변경할 수 없습니다.' });
        }

        // 데이터 에러 처리
        if (isNaN(userId)) return res.status(400).json({ message: '유효하지 않은 유저 ID입니다.' });
        if (!role) return res.status(400).json({ message: '업데이트할 등급(role)이 없습니다.' });
        // 등급 제어 ['USER', 'MANAGER']
        const isAllowedRole = ['USER', 'MANAGER'].includes(role);
        if (!isAllowedRole) return res.status(400).json({ message: '허용되지 않은 등급 권한입니다.' });
        // DB 제어
        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { $set: { role, updatedAt: getKSTNow() } },
            { new: true }
        );

        io.emit('users:update', { type: 'UPDATE' });

        res.status(200).json({ success: true, message: '등급이 성공적으로 변경되었습니다.', user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: '등급 변경 실패' });
    }
});
// 관리자 전용 특정 경기 기록 삭제(무효화) API
// io.emit('match:update', { type: 'DELETE', matchId: deletedMatch.matchId });
// 점수 롤백이 힘드므로 기록만 삭제
app.delete('/api/admin/matches/:matchId', adminOnly, async (req, res) => {
    try {
        const { matchId } = req.params;
        const deletedMatch = await Match.findByIdAndDelete(matchId);

        if (!deletedMatch) {
            return res.status(404).json({ message: '경기 기록을 찾을 수 없습니다.' });
        }

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