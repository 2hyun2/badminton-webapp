
  // User 모델의 데이터 타입
export interface InterfaceUser {
    id: number;
    username: string;
    password?: string; // select: false 인 필드는 조회 불가능 선택적 
    birthday: string;
    name: string;
    gender: string;
    tier: string | null;
    rating: number;
    status: string;
    matchId?: number | null;
    isPresent: boolean;
    entryTime: Date | null;
    exitTime: Date | null;
    matchSlot: number | null;
    groupId: string | null;
    preferredMatch: string | null;
    playCount: number;
    wins: number;
    losses: number;
    role: string;
    joinedAt: Date;
    updatedAt: Date;
    bio: string;
    todayPlayCount: number;
    isBirthdayPublic: boolean;
    isGenderPublic: boolean;
}
  // Match 모델의 데이터 타입
export interface InterfaceMatch {
    matchId: number;
    matchDate: Date;
    matchType?: string;
    teamA: number[];
    teamB: number[];
    scoreA: number;
    scoreB: number;
    winner?: string;
    eloDelta?: number;
}
  // DailyRecord 모델의 데이터 타입
export interface InterfaceDailyRecord {
    date: string;
    userId: number;
    entryTime?: Date;
    exitTime?: Date;
    startRating?: number;
    endRating?: number;
    matches?: any[]; // matches 구조가 구체적이지 않다면 일단 any[] 로 지정
}
  // Counter 모델의 데이터 타입
export interface InterfaceCounter {
    name: string;
    seq: number;
}

// JWT 토큰의 페이로드 인터페이스 정의
export interface JwtPayload {
    userId: number;
    role: string;
    iat?: number; // Issued At (선택적)
    exp?: number; // Expiration Time (선택적)
}

declare global {
    namespace Express {
        interface Request { user?: JwtPayload; } // 해독된 JWT 토큰 정보
    }
}