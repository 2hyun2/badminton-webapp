import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    const { user, lastAction, logoutUser, updateActivity } = useAuthStore.getState();

    if (user && lastAction) {
        const now = Date.now();
        const threeHours = 1 * 60 * 60 * 1000; // 1시간을 밀리초로 계산

        if (now - lastAction > threeHours) {
            logoutUser();
            alert("1시간 동안 활동이 없어 보안을 위해 자동 로그아웃되었습니다.");
            window.location.href = "/login";
            return Promise.reject("Session expired");
        }

        // 활동 시간 갱신
        updateActivity();
    }
    return config;
});

export default api;
