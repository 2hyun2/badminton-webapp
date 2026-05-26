import axios from "axios";
import useAuthStore from "../store/useAuthStore";

/* 
    데이터 가져오기 (Read)
     - api.get("/users") : 전체 유저 목록 가져오기
     - api.get("/users/1") : 1번 유저 한 명의 상세 정보 가져오기
     - api.get("/users", { params: { isPresent: true } }) 
        : 주소 뒤에 ?isPresent=true 붙여서 현재 입장 중인 유저만 필터링해서 가져오기

    데이터 추가 (Create)
     - api.post("/users", { name: "홍길동", rating: 1500 }) 
        
    데이터 전체 수정 (Update - 덮어쓰기)
     - api.put("/users/1", { name: "임꺽정", rating: 1600, status: "휴식중" }) 
        : 1번 유저의 데이터를 보낸 내용으로 통째로 갈아 끼우기 (보내지 않은 필드는 빈값 처리될 수 있음)
        
    데이터 일부 수정 (Update - 조각 수정)
     - api.patch("/users/1", { $set: { status: "경기중" } }) 
        : 1번 유저의 상태'만' 쏙 바꾸기 (나머지 이름이나 점수는 그대로 유지)

    데이터 삭제 (Delete)
     - api.delete("/users/10") : 10번 유저 삭제하기 (보통 어떤 걸 지울지 주소 뒤에 ID를 붙여서 보냄)

    
    Instance
     - const api = axios.create({ baseURL: "http://localhost:5000/api" })
        : 매번 긴 서버 주소 안 적어도 되게 기본 주소를 장착한 우리 팀 전용 통신 도구 만들기
        
    Request Interceptor
     - api.interceptors.request.use((config) => { ... })
        : 백엔드로 요청 신호가 출발하기 직전에 낚아채서, "이 사람 잠수 중인가?" 활동 시간을 체크하거나 
          헤더에 로그인 토큰을 자동으로 꼽아주는 만능 필터
          
    Response Interceptor
     - api.interceptors.response.use((res) => res, (error) => { ... })
        : 백엔드에서 에러 응답(401 세션만료, 403 권한없음 등)이 돌아왔을 때, 
          화면에 에러가 터지기 전에 먼저 가로채서 "자동 로그아웃 및 로그인 페이지 이동" 시켜버리는 파수꾼
*/
const api = axios.create({ // 기본 baseURL 편리성 설정
    baseURL: "http://localhost:5000/api",
});

let isLoggingOut = false; // 중복 방지 토글

// axios request - 중간 개입  
api.interceptors.request.use((config) => {
    // zustand에서 값 갖고옴 api.js 는 react component 가 아니라 () 이 아닌 getState() 로 불러옴
    const { user, token, lastAction, logoutUser, updateActivity } = useAuthStore.getState();

    if (user && lastAction && token) {
        const now = Date.now();
        const sessionTimeout = 1 * 60 * 60 * 1000; // 1시간

        if (now - lastAction > sessionTimeout) { // 현재 시간과 마지막 행동 시간이 다를시 로그아웃 
            if (!isLoggingOut) {
                isLoggingOut = true;
                logoutUser().then(() => { // 로그아웃 요청후 alert, location
                    alert("1시간 동안 활동이 없어 보안을 위해 자동 로그아웃되었습니다.");
                    window.location.href = "/login";
                });
            }
            // axios 종료 
            return Promise.reject(new Error("Session expired"));
        }
        if (token) config.headers.Authorization = `Bearer ${token}`;
        // 활동 시간 갱신
        updateActivity(); // set({ lastAction: Date.now() });
    }
    return config;
});

// axios response - 중간 개입 
api.interceptors.response.use(
    (response) => response, // 통신 성공
    async (error) => { // 에러
        const { logoutUser } = useAuthStore.getState();
        
        // 에러 401 || 403
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (!isLoggingOut) {
                isLoggingOut = true;
                await logoutUser();
                alert("세션이 만료되어 자동으로 로그아웃되었습니다.");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
