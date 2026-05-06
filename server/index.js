require("dotenv").config();
const express = require("express"); // 서버 개설
const cors = require("cors"); // 타 도메인 요청 허용
const mongoose = require("mongoose");

const fs = require("fs"); // 파일 시스템 모듈
const path = require("path") // 경로 설정 모듈
const bcrypt = require('bcrypt')

const app = express(); // express 객체 생성

app.use(cors()); // 타 도메인으로부터의 API 요청을 허용
app.use(express.json()); // 클라이언트가 보낸 JSON 데이터를 req.body에 담아줌

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.log("MongoDB 연결 실패:", err));

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

// 아이디 중복 확인
app.post('/api/users/check-id', async (req, res) => {
  try {
    const { username } = req.body;

    // 아이디 입력 여부 확인
    if (!username) return res.status(400).json({ isAvailable: false, message: '아이디를 입력해 주세요.' })
    // DB에서 동일한 username이 있는지 조회
    const existingUser = await User.findOne({ username });

    if (existingUser) return res.status(400).json({ isAvailable: false, message: '이미 사용 중인 아이디입니다.' });
    // 중복된 아이디가 없으면 사용 가능 반환
    return res.status(200).json({ isAvailable: true, message: '사용 가능한 아이디입니다.' });

  } catch (error) {
    console.error('아이디 중복 체크 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password, name, gender } = req.body;

    // 필수 입력값 검증
    if (!username || !password || !name || !gender) {
      return res.status(400).json({ message: '모든 정보를 입력해 주세요.' });
    }

    // [최종 수비] 가입 처리 직전 한 번 더 아이디 중복 체크
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 고유 id 자동 생성 알고리즘 (1씩 증가)
    // id를 기준으로 내림차순(-1) 정렬하여 가장 숫자가 큰 최근 유저 1명만 가져옴
    const lastUser = await User.findOne().sort({ id: -1 });
    // 유저가 한 명도 없으면 1번, 있으면 마지막 번호 + 1
    const nextId = lastUser ? lastUser.id + 1 : 1;

    // 비밀번호 암호화 (서버도 모르게 왜곡된 해시값 생성)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // (rating, status, role, 전적 데이터 등은 스키마의 default 값이 있으므로 적지 않아도 자동 삽입!)
    const newUser = new User({
      id: nextId,           // 위에서 계산한 숫자 ID 필수 기입
      username,
      password: hashedPassword, // 암호화된 비밀번호 저장
      name,
      gender
    });
    // DB에 최종 저장
    await newUser.save();

    return res.status(201).json({ success: true, message: '회원가입이 완료되었습니다!' });

  } catch (error) {
    console.error('회원가입 처리 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

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
// 경기 종료 및 Elo 반영
app.post("/api/match/end", async (req, res) => {
  const { matchId, winnerTeam, scoreA, scoreB } = req.body;
  const K = 32;

  try {
    // 경기 참여 ID DB에서 추출 
    const participants = await User.find({ matchId: matchId });
    if (participants.length < 4 && winnerTeam !== 'cancel') {
      return res.status(400).json({ message: "인원이 부족합니다." });
    } // 경기 인원이 4명 미만이거나 결과 값이 취소가 아닐시에 에러 400 && message

    // 레이팅 계산 AI 한테 요청했음
    const teamA = participants.filter(u => u.matchSlot === 0 || u.matchSlot === 1);
    const teamB = participants.filter(u => u.matchSlot === 2 || u.matchSlot === 3);

    const getAvg = (team) => team.reduce((acc, u) => acc + u.rating, 0) / team.length;
    const avgA = getAvg(teamA);
    const avgB = getAvg(teamB);

    const expectedA = 1 / (1 + Math.pow(10, (avgB - avgA) / 400));
    const ratingChange = Math.round(K * ((winnerTeam === 'A' ? 1 : 0) - expectedA));

    // DB 에서 추출한 경기 유저 업데이트 반복문
    for (const user of participants) {
      const isTeamA = user.matchSlot === 0 || user.matchSlot === 1; // 유저가 팀 A 였는가 *Boolean
      const isWin = (winnerTeam === 'A' && isTeamA) || (winnerTeam === 'B' && !isTeamA);
      // 승리팀이 A && A팀 일시, 승리팀 B && A팀 아닐시 ** 승리 
      const change = isTeamA ? ratingChange : -ratingChange;

      await User.updateOne(
        { id: user.id },
        {
          status: "휴식중",
          matchId: null,
          matchSlot: null,
          groupId: null,
          playCount: winnerTeam === 'cancel' ? user.playCount : user.playCount + 1,
          wins: isWin ? user.wins + 1 : user.wins,
          losses: (winnerTeam !== 'cancel' && !isWin) ? user.losses + 1 : user.losses,
          rating: winnerTeam === 'cancel' ? user.rating : user.rating + change
        }
      );
    }

    // 경기 값 취소가 아닐시 DB Match 에 report 생성 및 저장
    if (winnerTeam !== 'cancel') {
      await Match.create({
        matchId,
        teamA: teamA.map(u => u.id),
        teamB: teamB.map(u => u.id),
        scoreA,
        scoreB,
        winner: winnerTeam,
        eloDelta: Math.abs(ratingChange)
      });
    }

    const updatedList = await User.find();
    res.status(200).json({ message: "결과 반영 완료", updatedList });
  } catch (err) {
    res.status(500).json({ message: "결과 처리 중 오류 발생" });
  }
});

// 유저 상태 업데이트
app.post("/api/users/update", async (req, res) => {
  const { updates } = req.body;

  try {
    for (const update of updates) {
      const { id, ...fields } = update;
      await User.updateOne({ id }, fields);
    }
    const updatedList = await User.find().sort({ rating: -1 });
    res.status(200).json({ message: "유저 업데이트 성공", updatedList });
  } catch (error) {
    res.status(500).json({ message: "유저 업데이트 실패" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 아주 잘 돌아가고 있습니다!`);
});