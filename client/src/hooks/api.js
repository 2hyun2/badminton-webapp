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
                logoutUser();
                alert("1시간 동안 활동이 없어 보안을 위해 자동 로그아웃되었습니다.");
                window.location.href = "/login";
            }
            return Promise.reject(new Error("Session expired"));
        }

        // 활동 시간 갱신
        updateActivity();
    }
    return config;
});

export default api;
