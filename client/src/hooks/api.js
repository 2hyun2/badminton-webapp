import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

let isLoggingOut = false; // 알림 중복 및 무한 루프 방지용 플래그

api.interceptors.request.use((config) => {
    const { user, lastAction, logoutUser, updateActivity } = useAuthStore.getState();

    if (user && lastAction) {
        const now = Date.now();
        const sessionTimeout = 1 * 60 * 60 * 1000; // 1시간

        if (now - lastAction > sessionTimeout) {
            if (!isLoggingOut) {
                isLoggingOut = true;
                logoutUser().then(() => {
                    alert("1시간 동안 활동이 없어 보안을 위해 자동 로그아웃되었습니다.");
                    window.location.href = "/login";
                });
            }
            return Promise.reject(new Error("Session expired"));
        }

        // 활동 시간 갱신
        updateActivity();
    }
    return config;
});

// 서버에서 보내는 응답에 대한 인터셉터 추가
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { logoutUser } = useAuthStore.getState();
        
        // 서버가 401(미인증) 또는 403(권한없음 - 세션만료 대용)을 보낸 경우
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
