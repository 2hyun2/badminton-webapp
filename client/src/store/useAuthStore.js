import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../hooks/api';

const useAuthStore = create(persist((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    lastAction: null, // 마지막 활동 시간 기록

    loginUser: async (username, password) => {
        set({ isLoading: true, error: null }); // 로그인 시도: 로딩중
        try {
            // server에 username(ID), password 를 보내고 user, token 를 응답으로 받아온다.
            const response = await api.post('/users/login', { username, password });

            set({ user: response.data.user, token: response.data.token, isLoading: false, lastAction: Date.now() });
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || '로그인에 실패했습니다.';
            set({ isLoading: false, error: errorMsg });
            return { success: false, message: errorMsg };
        }
    },

    logoutUser: async () => {
        const currentUser = get().user; // zustand 내 user 정보 갖고오기
        if (!currentUser) return;

        set({ user: null, token: null, error: null, lastAction: null });

        if (currentUser.isPresent && currentUser.id) {
            try {
                await api.post('/users/exit', { userId: currentUser.id });
            } catch (error) {
                console.error('로그아웃 중 자동 퇴장 처리 실패:', error);
            }
        }
    },

    // 업데이트 함수 
    // updatePresent 에 data를 실어 보내면 useAuthStore 전체 데이터에서 user 값에 patch
    updatePresent: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
    })),

    // 활동 시간 업데이트 함수 *1시간 부재시 자동 로그아웃
    updateActivity: () => {
        set({ lastAction: Date.now() });
    },
    // 아이디 중복 체크
    checkId: async (username) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/check-id', { username });
            set({ isLoading: false });
            return response.data; // isUnique: true, message: '사용 가능한 아이디입니다.'

        } catch (error) {
            const errorMsg = error.response?.data?.message || '서버와 통신 중 에러가 발생했습니다.';
            set({ isLoading: false, error: errorMsg });
            return { isUnique: false, message: errorMsg }
        }
    },
    // 회원가입 return 값 단순
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