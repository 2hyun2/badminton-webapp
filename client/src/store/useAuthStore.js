import { create } from 'zustand';
import axios from 'axios';

const useAutoStore = create((set) => ({
  isLoading: false,
  error: null,

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