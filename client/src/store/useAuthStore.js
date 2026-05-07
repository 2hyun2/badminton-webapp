import { create } from 'zustand';
import axios from 'axios';

const useAutoStore = create((set) => ({
    user: null,
    isLoading: false,
    error: null,

    loginUser: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/users/login', { username, password });

            set({ user: response.data.user, isLoading: false });
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || '로그인에 실패했습니다.';
            set({ isLoading: false, error: errorMsg });
            return { success: false, message: errorMsg };
        }
    },

    // 4️⃣ [Action] 로그아웃 (스토어 비우기)
    logoutUser: () => {
        set({ user: null, error: null });
        alert('로그아웃 되었습니다.');
    },

    checkId: async (username) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/users/check-id', { username });
            set({ isLoading: false });
            return response.data;

        } catch (error) {
            const errorMsg = error.response?.data?.message || '서버와 통신 중 에러가 발생했습니다.';
            set({ isLoading: false, error: errorMsg });
            return { isAvailable: false, message: errorMsg }
        }
    },

    registerUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/users/register', userData);
            set({ isLoading: false });
            return response.data;

        } catch (error) {
            const errorMsg = error.response?.data?.message || '회원가입에 실패했습니다.';
            set({ isLoading: false, error: errorMsg });
            return { success: false, message: errorMsg };
        }
    }
}))

export default useAutoStore;