import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(persist((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    lastAction: null, // 마지막 활동 시간 기록

    // 업데이트 함수 
    // updatePresent 에 data를 실어 보내면 useAuthStore 전체 데이터에서 user 값에 patch
    updatePresent: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
    })),

}), {
    name: 'auth-storage', // localStorage에 저장될 키 이름
}));

export default useAuthStore;