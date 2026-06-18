import dotenv from 'dotenv';
dotenv.config(); // 환경 변수(.env 파일) 로드

process.env.TZ = "Asia/Seoul"; // 타임존 설정

import express, { Application, Request, Response, NextFunction } from 'express'; // 웹 서버 프레임워크
import cors from 'cors'; // 교차 출처 공유 허용
import mongoose, { Document, Model } from 'mongoose'; // MongoDB 모델링 도구
import jwt from 'jsonwebtoken'; // JWT 토큰 생성 및 검증
import http, { Server } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io'; // 구조 분해 할당 이름 변경 (as 사용)
import bcrypt from 'bcrypt'; // 비밀번호 암호화 도구
import cron from 'node-cron'; // 스케줄러 추가
import rateLimit from 'express-rate-limit'; // 요청 제한 라이브러리
import { JwtPayload } from 'jsonwebtoken'; // jwt.verify의 반환 타입으로 사용

import { InterfaceUser, InterfaceMatch, InterfaceDailyRecord, InterfaceCounter, JwtPayload as CustomJwtPayload } from './types'

const app: Application = express();
const httpServer: Server = http.createServer(app);

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

// socket의 타입을 명시적으로 Socket으로 지정
io.on('connection', (socket: Socket) => {
    console.log('클라이언트 연결:', socket.id);

    // socket.handshake.query.userId는 string | string[] | undefined 타입일 수 있습니다.
    // 단일 userId를 기대하므로, 배열인 경우 첫 번째 요소를 사용합니다.
    let userId: string | undefined;
    const queryUserId = socket.handshake.query.userId;

    if (Array.isArray(queryUserId)) {
        userId = queryUserId[0]; // 배열인 경우 첫 번째 요소를 사용
    } else if (typeof queryUserId === 'string') {
        userId = queryUserId; // 문자열인 경우 그대로 사용
    }

    if (userId) {
        socket.join(`user_${userId}`);
    }
    socket.on('disconnect', () => console.log('연결 해제:', socket.id));
});

app.use(cors());
app.use(express.json());

// 서버 시작 시 카운터 동기화
const initializeCounters = async () => {
    try {
        const lastUser = await User.findOne().sort({ id: -1 });
        const currentMaxUserId = lastUser ? lastUser.id : 0;

        await Counter.findOneAndUpdate(
            { name: 'userId' },
            { $set: { seq: currentMaxUserId } },
            { upsert: true }
        );
        console.log(`userId 카운터 세팅 완료 ${currentMaxUserId}`);

        const lastMatch = await Match.findOne().sort({ matchId: -1 });
        const currentMaxMatchId = lastMatch ? lastMatch.matchId : 0;

        await Counter.findOneAndUpdate(
            { name: 'matchId' },
            { $set: { seq: currentMaxMatchId } },
            { upsert: true }
        );
        console.log(`matchId 카운터 세팅 완료 ${currentMaxMatchId}`);

    } catch (error) {
        console.error("카운터 초기화 실패:", error);
    }
};

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI as string)
    .then(async () => {
        await initializeCounters(); // DB 연결 카운터 동기화
        console.log("MongoDB 연결 성공")
    })
    // err의 타입을 Error로 지정
    .catch((err: Error) => console.log("MongoDB 연결 실패", err));

// process.env.TZ = "Asia/Seoul" 서버 시간 설정 완료 newDate = 한국 시간
const getKSTNow = () => new Date();
const getToday = () => {
    const now = new Date();

    // getFullYear, getMonth, getDate는 TZ 설정(한국시간)을 따릅니다.
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // "2026-06-12"
};

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
const userSchema = new mongoose.Schema<InterfaceUser>({
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
const matchSchema = new mongoose.Schema<InterfaceMatch>({
    matchId: { type: Number, required: true },
    matchDate: { type: Date, default: getKSTNow },
    matchType: { type: String, default: 'DOUBLE', enum: ['SINGLE', 'DOUBLE'] },
    matchMode: { type: String, default: 'RANKED', enum: ['RANKED', 'FRIENDLY'] },
    matchStatus: { type: String, default: 'PLAYING', enum: ['PLAYING', 'FINISHED', 'VOID'] },
    teamA: [Number],
    teamB: [Number],
    scoreA: { type: Number, default: 0 },
    scoreB: { type: Number, default: 0 },
    winner: { type: String },
    eloDelta: { type: Number }
});
// 출석 스키마 리스트
const dailyRecordSchema = new mongoose.Schema<InterfaceDailyRecord>({
    date: { type: String, required: true }, // "YYYY-MM-DD"
    userId: { type: Number, required: true },
    entryTime: { type: Date },
    exitTime: { type: Date },
    startRating: { type: Number }, // 당일 시작 점수
    endRating: { type: Number },   // 당일 최종 점수
    matches: { type: Array },
})
// 카운터 스키마 양식
const counterSchema = new mongoose.Schema<InterfaceCounter>({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
})

// 인덱스 설정
matchSchema.index({ matchDate: -1 }); // 최신 경기순 조회 최적화
dailyRecordSchema.index({ date: 1, userId: 1 }, { unique: true }); // 동일 날짜에 유저당 기록 1개 보장
dailyRecordSchema.index({ date: -1 }); // 날짜별 조회 최적화

// (변수명, 스키마(구조), DB Table name: default = users)
// Model에 인터페이스를 적용하여 생성
const User: Model<InterfaceUser> = mongoose.model<InterfaceUser>("User", userSchema, "users");
const Match: Model<InterfaceMatch> = mongoose.model<InterfaceMatch>("Match", matchSchema, "matches");
const DailyRecord: Model<InterfaceDailyRecord> = mongoose.model<InterfaceDailyRecord>("DailyRecord", dailyRecordSchema, "daily_records");
const Counter: Model<InterfaceCounter> = mongoose.model<InterfaceCounter>("Counter", counterSchema, "counters");

// 카운터 DB 증가 함수
// 파라미터 name의 타입을 string으로 지정
const counterSequence = async (name: string) => {
    const counter = await Counter.findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } }, // seq 값을 무조건 1 증가 (동시 요청이 와도 DB가 순서를 보장함)
        { returnDocument: 'after', upsert: true } // 문서가 없으면 새로 생성(upsert: true)
    );
    // counter가 null일 수도 있으므로, 옵셔널 체이닝(?)을 사용하고 기본값을 0으로 설정
    return counter?.seq || 0;
}

// 아이디 중복 확인
app.post('/api/users/check-id', async (req: Request, res: Response): Promise<any> => {
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
app.post('/api/users/register', registerLimiter, async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password, birthday, name, gender } = req.body;
        if (!username || !password || !birthday || !name || !gender) return res.status(400).json({ message: '모든 필드를 입력해 주세요.' }); // 빈 값 존재시 error

        const existingUser = await User.findOne({ username }); // 아이디 중복 체크 한번 더 더블 체크
        if (existingUser) return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });

        // 고유 ID 발급 
        const nextId = await counterSequence('userId'); // 고유 ID 발급 (원자적 보장)
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화  - 암호화 된 비밀번호 설계자인 나도 모름 초기화만이 답.

        // schema 양식 - 필수값 넣기 - 없는 key 는 default || null
        const newUser = new User({ id: nextId, username, password: hashedPassword, birthday, name, gender }); // 한국인 기준 id = username 인데 db 상 이름은 username 이 맞다.
        await newUser.save();
        res.status(201).json({ success: true, message: '회원가입 완료!' });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});
// 로그인
app.post('/api/users/login', async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username }).select('+password'); // user 라는 객체 - { 유저 찾기: username(ID) + .select('+password')로 비밀번호 추가 요청 }
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        const userData = user.toObject(); // 데이터를 객체로 변환
        delete userData.password; // 객체 - password 항목 삭제

        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.id, role: user.role }, // 토큰에 들어갈 정보 Payload
            process.env.JWT_SECRET as string, // .env - secret key
            { expiresIn: '1h' } // 토큰 유효 기간 설정 (예: 1시간)
        );

        res.status(200).json({ success: true, user: userData, token });
    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({ message: '서버 에러' });
    }
});
// 전체 유저 조회
app.get('/api/users', async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await User.find() // 데이터 찾기 (Read) - 유저 전체 *비밀번호는 schema 에서 제외함*
        res.status(200).json(users);
    } catch (error) {
        console.error('유저 조회 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
})
// 전체 유저 조회 - 입장 상태인 유저만
app.get('/api/users/present', async (req: Request, res: Response): Promise<any> => {
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
app.post('/api/users/entry', async (req: Request, res: Response): Promise<any> => {
    try {
        console.log(req.body);
        const userId = parseInt(req.body.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: '유효하지 않은 유저 ID입니다.' });
        }

        const updatedUser = await User.findOneAndUpdate( // 데이터 찾기 && 수정/삭제 (Find & Modify)
            { id: userId }, // 조건: id === id
            { isPresent: true, status: "RESTING", entryTime: getKSTNow(), exitTime: null, updatedAt: getKSTNow() }, // 데이터 변경
            { returnDocument: 'after' } // updatedUser 에 변경값 넣기
        );

        if (!updatedUser) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

        // DaliyRecord 입장
        await DailyRecord.findOneAndUpdate(
            { date: getToday(), userId: userId },
            { $setOnInsert: { startRating: updatedUser.rating, entryTime: getKSTNow() } },
            { upsert: true }
        );

        io.emit('users:update', { type: 'ENTRY', user: updatedUser }); // socket - users:update 부가 데이터 { type: 'ENTRY' }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});
// 로그인 => 퇴장
// io.emit('users:update', { type: 'EXIT', userId });
app.post('/api/users/exit', async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = parseInt(req.body.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: '유효하지 않은 유저 ID입니다.' });
        }

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
                message: `${exitingUser.name} 유저의 퇴장으로 인해 경기 강제 종료`
            })
        }

        // 유저 한명 서버에 업데이트
        await User.updateOne(
            { id: userId }, // 조건
            { isPresent: false, status: "OFFLINE", groupId: null, exitTime: getKSTNow(), updatedAt: getKSTNow() } // 데이터
        );

        // DaliyRecord 퇴장
        await DailyRecord.updateOne(
            { date: getToday(), userId: userId },
            { $set: { exitTime: getKSTNow(), endRating: exitingUser.rating } }
        )

        io.emit('users:update', { type: 'EXIT', user: exitingUser });  // socket - users:update 부가 데이터 { type: 'EXIT', userId }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

/** UPDATE API */
// 미들웨어(Middleware) 함수: API 본 요청이 실행되기 '중간(Middle)'에 가로채서 검사하는 역할입니다.
// Express.js 미들웨어의 3번째 인자는 무조건 스위치 next 가 존재
// 일반 유저 인증 미들웨어
const userAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // 토큰이 제대로 넘어왔는지 확인
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 토큰 해독 및 검증 (.env의 JWT_SECRET 사용)
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;

        // 해독된 정보(로그인할 때 넣은 userId, role 등)를 req.user에 저장
        req.user = decoded; // CustomJwtPayload 타입으로 할당

        // 통과! 다음 본 API 로직으로 이동
        next();
    } catch (error) {
        console.error('토큰 검증 에러:', error);
        return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
};
// 관리자 확인 미들웨어
const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization; // request: header - authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) { // Bearer [토큰문자열] - 통신 규약(HTTP 표준)
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1]; // 위 값에서 공백을 기준으로 0번이 아닌 1번째 값 

    try {
        // jwt.verify: 서버만 알고 있는 비밀키(JWT_SECRET)를 이용해 토큰이 위조되지 않았는지, 기한이 안 지났는지 검증하고 해독(decoded)
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;
        req.user = decoded; // 요청 객체에 사용자 정보 추가
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
        }

        next(); // 통과
    } catch (error) {
        console.error('토큰 검증 에러:', error);
        return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
};

// 업데이트 가능한 목록 (InterfaceUser의 키값들만 허용하도록 타입 지정: keyof InterfaceUser 적용)
const ALLOWED_USER_FIELDS: Array<keyof InterfaceUser> = [
    'name', 'birthday', 'gender', 'preferredMatch', 'status',
    'groupId', 'password', 'isBirthdayPublic', 'isGenderPublic', 'bio'
];

// 업데이트 총괄 
app.post('/api/users/update', userAuth, async (req: Request, res: Response): Promise<any> => {
    try {
        const { updates } = req.body;
        if (!updates) return res.status(400).json({ message: '업데이트할 데이터가 없습니다.' });

        // 값이 배열이든 단일 객체든 Partial<InterfaceUser>[] (일부 정보만 있는 유저 배열) 타입으로 통일
        const items: Partial<InterfaceUser>[] = Array.isArray(updates) ? updates : [updates];

        const bulkOps = await Promise.all(items
            .filter(user => user.id)
            .map(async (user) => {
                // Mongoose $set에 들어갈 객체 타입 (동적 할당을 위해 Record 사용)
                const filtered: Record<string, any> = { updatedAt: getKSTNow() };

                for (const key of ALLOWED_USER_FIELDS) {
                    if (user[key] !== undefined && (key === 'password' ? user[key] !== '' : true)) {
                        if (key === 'password') {
                            // bcrypt.hash는 문자열을 요구하므로 as string으로 단언
                            filtered[key] = await bcrypt.hash(user[key] as string, 10);
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

        if (bulkOps.length > 0) await User.bulkWrite(bulkOps);

        io.emit('users:update', { type: 'UPDATE' });

        res.status(200).json({ success: true, message: '정보가 업데이트되었습니다.' });
    } catch (error) {
        console.error('유저 업데이트 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 경기 시작 
app.post("/api/match/start", async (req: Request, res: Response): Promise<any> => {
    // 프론트에서 오는 matchPlayer가 숫자 배열(number[])임을 명시
    const { matchPlayer, matchType, matchMode }: 
        { matchPlayer: (number | null)[], matchType: 'SINGLE' | 'DOUBLE', matchMode: 'RANKED' | 'FRIENDLY' } 
        = req.body;
    
    if (!matchPlayer || !Array.isArray(matchPlayer) || matchPlayer.length === 0) {
        return res.status(400).json({ message: "선택된 플레이어가 없습니다." });
    }

    const newMatchId = await counterSequence('matchId');

    // if (!matchPlayer || matchPlayer.length !== 4) { return res.status(400).json({ message: "인원이 충분하지 않습니다." }) }
    if (!matchType) { return res.status(400).json({ message: '매치 타입이 정해지지 않았습니다.' }) }
    if (!matchMode) { return res.status(400).json({ message: '매치 모드가 정해지지 않았습니다..' }) }

    try {
        const bulkOps = matchPlayer
            .filter(id => id !== null) // ID가 null인 경우 제외 (방어 로직)
            .map((id, index) => ({
                updateOne: {
                    filter: { id },
                    update: { $set: { status: "PLAYING", matchId: newMatchId, matchSlot: index, groupId: null, updatedAt: getKSTNow() } }
                }
            }));

        await User.bulkWrite(bulkOps);

        matchPlayer.forEach(id => {
            io.to(`user_${id}`).emit('match:update', {
                userId: id,
                type: 'START',
                matchId: newMatchId,
                matchType: matchType,
                matchMode: matchMode,
                teamA: matchPlayer.slice(0, 2),
                teamB: matchPlayer.slice(2, 4)
            });
        })

        await Match.create({
            matchId: newMatchId,
            matchDate: getKSTNow(),
            matchType: matchType || 'DOUBLE', // SINGLE or DOUBLE
            matchMode: matchMode || 'RANKED', // RANKED or FRIENDLY (기본값 RANKED)
            matchStatus: 'PLAYING',
            teamA: matchPlayer.slice(0, 2).filter(id => id !== null),
            teamB: matchPlayer.slice(2, 4).filter(id => id !== null),
        })

        io.emit('users:update', { type: 'UPDATE' });
        io.emit('matches:update', { type: 'UPDATE' });

        res.status(200).json({ message: "매칭 성공" });
    } catch (error) {
        res.status(500).json({ message: "매칭 실패" });
    }
});

// 경기 종료 
app.post("/api/match/end", async (req: Request, res: Response): Promise<any> => {
    const { matchId, winner, scoreA, scoreB } = req.body;
    if (!matchId) return res.status(400).json({ message: "매치 ID가 필요합니다." });

    const K = 32;

    try {
        // DB matches 에서 해당 경기 찾음
        const thisMatch = await Match.findOne({ matchId: matchId });
        if (!thisMatch) return res.status(404).json({ message: "매치를 찾을 수 없습니다." });

        // Match 정보에서 참가자 ID 리스트를 바로 가져오기
        const { teamA: teamAPlayer, teamB: teamBPlayer } = thisMatch;
        const matchedUser = await User.find({ id: { $in: [...teamAPlayer, ...teamBPlayer] } });

        // VOID 처리: 경기 무효 (아무것도 기록 안 함)
        if (winner === 'VOID' || winner === 'cancel') {
            await User.updateMany({ id: { $in: [...teamAPlayer, ...teamBPlayer] } }, { $set: { status: "RESTING", matchId: null, matchSlot: null, updatedAt: getKSTNow() } });
            
            await Match.deleteOne({ matchId: matchId });

            // WebSocket 이벤트 발생: 유저 상태 및 매치 목록 업데이트
            io.emit('users:update', { type: 'UPDATE' });
            io.emit('matches:update', { type: 'UPDATE' });
            [...teamAPlayer, ...teamBPlayer].forEach(id => {
                io.to(`user_${id}`).emit('match:update', { type: 'VOID', matchId: matchId });
            });
            return res.status(200).json({ message: "무효 처리 완료" });
        }

        // matchMode 분기
        const isFriendly = thisMatch.matchMode === 'FRIENDLY';
        const teamA = matchedUser.filter(u => thisMatch.teamA.includes(u.id));
        const teamB = matchedUser.filter(u => thisMatch.teamB.includes(u.id));

        // 2. 레이팅 계산 (친선이면 0, 아니면 계산)
        let ratingChange = 0;
        if (!isFriendly) {
            const avgA = teamA.reduce((acc, u) => acc + u.rating, 0) / teamA.length;
            const avgB = teamB.reduce((acc, u) => acc + u.rating, 0) / teamB.length;
            const expectedA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
            ratingChange = Math.round(K * ((winner === 'A' ? 1 : 0) - expectedA));
        }

        // 3. DB 업데이트 (BulkWrite)
        const bulkOps = matchedUser.map(user => {
            const isTeamA = thisMatch.teamA.includes(user.id);
            const isWin = (winner === 'A' && isTeamA) || (winner === 'B' && !isTeamA);
            const change = isTeamA ? ratingChange : -ratingChange;

            const updateDoc: any = {
                $set: { status: "RESTING", matchId: null, matchSlot: null, updatedAt: getKSTNow() },
                $inc: { playCount: 1, todayPlayCount: 1, wins: isWin ? 1 : 0, losses: isWin ? 0 : 1 }
            };

            // 레이팅은 친선이 아닐 때만 inc
            if (!isFriendly) updateDoc.$inc.rating = change;

            return { updateOne: { filter: { id: user.id }, update: updateDoc } };
        });

        await User.bulkWrite(bulkOps);

        // 4. 경기 완료 상태 저장
        await Match.updateOne({ matchId }, { $set: { matchStatus: 'FINISHED', winner: winner, eloDelta: Math.abs(ratingChange) } });

        // WebSocket 이벤트 발생: 유저 상태 및 매치 목록 업데이트
        io.emit('users:update', { type: 'UPDATE' });
        io.emit('matches:update', { type: 'UPDATE' });
        [...teamAPlayer, ...teamBPlayer].forEach(id => {
            io.to(`user_${id}`).emit('match:update', { 
                type: 'END', 
                matchId: matchId, 
                matchType: thisMatch.matchType,
                matchMode: thisMatch.matchMode,
                matchStatus: thisMatch.matchStatus,
                winner: winner,
                teamA: teamAPlayer,
                teamB: teamBPlayer,
                eloDelta: Math.abs(ratingChange)
            });
        });


        res.status(200).json({ message: "정상 반영 완료" });
    } catch (err) {
        res.status(500).json({ message: "오류 발생" });
    }
});

// 경기 내역
app.get('/api/match/history', async (req: Request, res: Response): Promise<any> => {
    try {
        // req.query에서 넘어온 값들이 문자열임을 단언(Type Assertion)
        const period = req.query.period as string | undefined;
        const months = req.query.months as string | undefined;

        // MongoDB 쿼리 객체는 구조가 동적이므로 Record<string, any> 사용
        let query: Record<string, any> = {};

        if (period === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            query.matchDate = { $gte: oneWeekAgo };
        } else if (period === 'monthly') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            query.matchDate = { $gte: oneMonthAgo };
        } else if (months) {
            const numMonths = parseInt(months, 10);
            if (isNaN(numMonths)) return res.status(400).json({ message: '유효하지 않은 개월 수입니다.' });
            const NMonthsAgo = new Date();
            NMonthsAgo.setMonth(NMonthsAgo.getMonth() - numMonths);
            query.matchDate = { $gte: NMonthsAgo };
        }

        const history = await Match.find(query).sort({ matchDate: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 경기 내역 - 특정 유저 의 기록 갖고오기
app.get('/api/match/history/:userId', async (req: Request, res: Response): Promise<any> => {
    try {
        const paramUserId = req.params.userId;
        const userId = parseInt(Array.isArray(paramUserId) ? paramUserId[0] : paramUserId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ message: '유효하지 않은 유저 ID입니다.' });
        }

        const history = await Match.find({
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

// 관리자 전용 유저 리스트 불러오기 (일반 유저 불러오기랑 아직 별 차이 없음)
app.get('/api/admin/users', adminOnly, async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await User.find();
        res.status(200).json(users.map(user => user.toObject())); // toObject()를 사용하여 mongoose 객체에서 일반 객체로 변환
    } catch (error) {
        res.status(500).json({ message: '서버 에러' });
    }
});

// 관리자 전용 비밀번호 초기화 API (URL에 타겟 유저 번호를 달고 요청합니다)
app.post('/api/admin/users/:id/reset-password', adminOnly, async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = parseInt(req.params.id as string, 10); // 10진수로 숫자형 변환, url 은 숫자로 들어옴 as string

        if (isNaN(userId)) { return res.status(400).json({ message: '유효하지 않은 유저 ID입니다.' }) }

        const hashedPassword = await bcrypt.hash("0000", 10);
        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { $set: { password: hashedPassword } },
            { returnDocument: 'after' }
        );
        if (!updatedUser) return res.status(404).json({ message: 'DB에 해당 유저가 존재하지 않습니다.' });

        res.status(200).json({ success: true, message: '비밀번호가 0000으로 초기화되었습니다.', user: updatedUser.toObject() });
    } catch (error) {
        res.status(500).json({ message: '초기화 실패' });
    }
});

// 유저 상태 강제 초기화 (경기 중 -> 휴식 중으로 복구)
app.post('/api/admin/users/:userId/reset-status', adminOnly, async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = parseInt(req.params.userId as string, 10);

        if (isNaN(userId)) { return res.status(400).json({ message: '유효하지 않은 유저 ID입니다.' }) }

        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { $set: { status: "RESTING", matchId: null, matchSlot: null} },
            { returnDocument: 'after' }
        );
        if (!updatedUser) return res.status(404).json({ message: 'DB에 해당 유저가 존재하지 않습니다.' });

        io.emit('users:update', { type: 'UPDATE', userId: updatedUser.id, status: updatedUser.status });

        res.status(200).json({ success: true, message: '유저 상태가 초기화되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '상태 변경 실패' });
    }
});

// 관리자 전용 유저 삭제(강퇴) API
app.delete('/api/admin/users/:userId/delete-account', adminOnly, async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = parseInt(req.params.userId as string, 10);

        if (isNaN(userId)) { return res.status(400).json({ message: '유효하지 않은 유저 ID입니다.' }) }

        const deletedUser = await User.findOneAndDelete({ id: userId });
        if (!deletedUser) return res.status(404).json({ message: 'DB에 해당 유저가 존재하지 않습니다.' });

        io.emit('users:update', { type: 'EXIT', userId: deletedUser.id });

        res.status(200).json({ success: true, message: '사용자가 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '삭제 실패' });
    }
});

// 관리자 전용 유저 등급 변경
app.post('/api/admin/users/:userId/update-role', adminOnly, async (req: Request, res: Response): Promise<any> => {
    try {
        const paramUserId = req.params.userId;
        const userId = parseInt(Array.isArray(paramUserId) ? paramUserId[0] : paramUserId, 10);

        if (isNaN(userId)) return res.status(400).json({ message: '유효하지 않은 유저 ID입니다.' });

        const { role } = req.body;

        // req.user는 앞서 전역 타입 확장을 통해 에러 없이 접근 가능합니다.
        if (req.user?.userId === userId && req.user?.role === 'ADMIN') {
            return res.status(403).json({ message: '관리자는 자신의 등급을 변경할 수 없습니다.' });
        }
        if (!role) return res.status(400).json({ message: '업데이트할 등급(role)이 없습니다.' });

        const isAllowedRole = ['USER', 'MANAGER'].includes(role);
        if (!isAllowedRole) return res.status(400).json({ message: '허용되지 않은 등급 권한입니다.' });

        const updatedUser = await User.findOneAndUpdate(
            { id: userId },
            { $set: { role, updatedAt: getKSTNow() } },
            { returnDocument: 'after' }
        );

        io.emit('users:update', { type: 'UPDATE' });

        res.status(200).json({ success: true, message: '등급이 성공적으로 변경되었습니다.', user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: '등급 변경 실패' });
    }
});

// 관리자 전용 특정 경기 기록 삭제(무효화) API
app.delete('/api/admin/matches/:matchId/delete-match', adminOnly, async (req: Request, res: Response): Promise<any> => {
    try {
        const matchId = parseInt(req.params.matchId as string, 10);

        if (isNaN(matchId)) { return res.status(400).json({ message: '유효하지 않은 경기 ID입니다.' }) }

        const targetMatch = await Match.findOne({ matchId: matchId });
        if (!targetMatch) return res.status(404).json({ message: 'DB에 해당 경기가 존재하지 않습니다.' });

        const matchDateStr = new Date(targetMatch.matchDate).toISOString().split('T')[0];
        const participants = [...targetMatch.teamA, ...targetMatch.teamB];
        const delta = targetMatch.eloDelta || 0;
        const isToday = matchDateStr === getToday();

        const userUpdateOps = participants.map(userId => {
            const isTeamA = targetMatch.teamA.includes(userId);
            const isWin = (targetMatch.winner === 'A' && isTeamA) || (targetMatch.winner === 'B' && !isTeamA);

            // 동적으로 속성($inc.todayPlayCount)을 추가하기 위해 any 타입으로 선언
            const update: any = {
                $inc: {
                    playCount: -1,
                    wins: isWin ? -1 : 0,
                    losses: isWin ? 0 : -1,
                    // rating: isWin ? -delta : delta
                },
                $set: { updatedAt: getKSTNow() }
            };
            if (isToday) update.$inc.todayPlayCount = -1;

            return {
                updateOne: {
                    filter: { id: userId },
                    update: update
                }
            };
        });

        if (userUpdateOps.length > 0) await User.bulkWrite(userUpdateOps);

        const dailyUpdateOps = participants.map(userId => {
            const isTeamA = targetMatch.teamA.includes(userId);
            const isWin = (targetMatch.winner === 'A' && isTeamA) || (targetMatch.winner === 'B' && !isTeamA);

            return {
                updateOne: {
                    filter: { date: matchDateStr, userId: userId },
                    update: {
                        // $inc: { endRating: isWin ? -delta : delta },
                        $pull: { matches: { matchId: targetMatch.matchId } }
                    }
                }
            };
        });

        if (dailyUpdateOps.length > 0) {
            await DailyRecord.bulkWrite(dailyUpdateOps);
        }

        // 이미 위에서 parseInt를 했으므로 Number()로 다시 감쌀 필요가 없습니다.
        const deletedMatch = await Match.findOneAndDelete({ matchId: matchId });

        if (!deletedMatch) return res.status(404).json({ message: '삭제할 경기를 찾지 못했습니다.' });

        io.emit('match:update', { type: 'DELETE', matchId: deletedMatch.matchId });
        io.emit('users:update', { type: 'UPDATE' });

        res.status(200).json({ success: true, message: '경기 기록이 삭제되었습니다.' });
    } catch (error) {
        console.error('경기 기록 삭제 에러:', error);
        res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
});

// 서버 실행
const PORT = process.env.PORT || 5000;

httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`서버 실행 실패: ${PORT}번 포트가 이미 사용 중입니다. 기존 프로세스를 종료해 주세요.`);
    }
});

httpServer.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

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
     - User.findOneAndUpdate({ id: 1 }, { status: "휴식중" }, { returnDocument: 'after' }) 
        : (1타 2피) 1번 유저 상태를 수정하고, 그 '수정된 최신 데이터'를 바로 가져오기 
        : { returnDocument: 'after' } 필수 아닌 명시 필요 
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