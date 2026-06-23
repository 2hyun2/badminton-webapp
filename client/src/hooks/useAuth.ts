import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InterfaceUser } from '../types/badminton';
import api from './api';
import useAuthStore from '../store/useAuthStore';


interface AuthResponse {
    user?: InterfaceUser,
    token?: string,
    isUnique?: boolean,
    success?: boolean,
    message: string
}

export const useAuthMutation = () => {

    const checkIdMutation = useMutation({
        mutationFn: async (username: InterfaceUser) => {
            const response = await api.post<AuthResponse>('/users/check-id', { username });
            return response.data
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || '아이디 중복체크 에러';
            alert(errorMessage);
        }
    });

    const registerMutation = useMutation({
        mutationFn: async (userData: InterfaceUser) => {
            const response = await api.post<AuthResponse>('/users/register', userData)
            return response.data;
        },
        onSuccess: (data) => {
            alert(data?.message)
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || '회원가입 에러'
            alert(errorMessage);
        }
    })

    const loginMutation = useMutation({
        mutationFn: async ({ username, password }: InterfaceUser) => {
            const response = await api.post<AuthResponse>('/users/login', { username, password })
            return response.data
        },
        onSuccess: (data) => {
            useAuthStore.setState({
                user: data.user ?? null,
                token: data.token ?? null,
                lastAction: Date.now()
            })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || '로그인 에러'
            alert(errorMessage);
        }
    });

    const logoutMutation = useMutation({
        mutationFn: async (id: InterfaceUser) => {
            const response = await api.post('/users/exit', { id });
            return response.data
        },
        onSuccess: (data) => {
            useAuthStore.setState({
                user: null,
                token: null,
                lastAction: Date.now()
            })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || '로그아웃 에러'
            alert(errorMessage);
        }
    })

    return {
        checkIdMutation,
        registerMutation,
        loginMutation,
        logoutMutation
    };
}
