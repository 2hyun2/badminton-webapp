import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../hooks/api';

const useAuthStore = create(persist((set, get) => ({
    user: null,
    isLoading: false,
    error: null,
    lastAction: null, // 마지막 활동 시간 기록

    loginUser: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/login', { username, password });

            set({ user: response.data.user, isLoading: false, lastAction: Date.now() });
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || '로그인에 실패했습니다.';
            set({ isLoading: false, error: errorMsg });
            return { success: false, message: errorMsg };
        }
    },

    logoutUser: async () => {
        const currentUser = get().user;
        if (!currentUser) return;

        // 상태를 즉시 null로 설정하여 다른 인터셉터나 컴포넌트에서 중복 로그아웃을 방지
        set({ user: null, error: null, lastAction: null });

        // 사용자가 '입장' 상태였다면 비동기로 퇴장 처리 (결과를 기다리지 않음)
        if (currentUser.isPresent && currentUser.id) {
            try {
                await api.post('/users/exit', { userId: currentUser.id });
            } catch (error) {
                console.error('로그아웃 중 자동 퇴장 처리 실패:', error);
            }
        }
    },

    // 입장/퇴장 업데이트 함수
    updatePresent: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
    })),

    // 활동 시간 업데이트 함수
    updateActivity: () => {
        set({ lastAction: Date.now() });
    },

    checkId: async (username) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/check-id', { username });
            set({ isLoading: false });
            return response.data;

        } catch (error) {
            const errorMsg = error.response?.data?.message || '서버와 통신 중 에러가 발생했습니다.';
            set({ isLoading: false, error: errorMsg });
            return { isUnique: false, message: errorMsg }
        }
    },

    registerUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/register', userData);
            set({ isLoading: false });
            return response.data;

        } catch (error) {
            const errorMsg = error.response?.data?.message || '회원가입에 실패했습니다.';
            set({ isLoading: false, error: errorMsg });
            return { success: false, message: errorMsg };
        }
    },
}), {
    name: 'auth-storage', // localStorage에 저장될 키 이름
}));

export default useAuthStore;