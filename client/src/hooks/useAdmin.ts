import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import useAuthStore from '../store/useAuthStore';

import { InterfaceUser, InterfaceMatch } from '../types/badminton';

export const useAdmin = () => {
    const queryClient = useQueryClient();
    const { user: authUser } = useAuthStore();

    const { data: adminUserList = [], isLoading, isError, refetch } = useQuery<InterfaceUser[]>({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const response = await api.get('/admin/users');
            return response.data;
        }
    });

    const resetPasswordMutation = useMutation({ // 비밀번호 초기화
        mutationFn: async (id) => {
            const response = await api.post(`/admin/users/${id}/reset-password`);
            return response.data
        },
        onSuccess: (data) => {
            alert(data.message)
        },
        onError: (data) => {
            alert(data.message)
        },
    });

    // 유저 등급 변경 관리자 본인은 변경불가 관리자 이동시 서버 관리자 문의
    const allowedRoles = ['USER', 'MANAGER'] as const;
    type Role = typeof allowedRoles[number];

    const updateRoleMutation = useMutation({
        mutationFn: async ({ id, role }: { id: number, role: Role }) => {
            if (authUser?.id === id) throw new Error('본인의 등급은 변경 불가입니다. 서버 관리자에게 문의하세요.');

            const isAllowedRole = allowedRoles.includes(role);
            if (!isAllowedRole) throw new Error('누구세요. 가세요라.');

            const response = await api.post('/admin/users/:userId/update-role', { role })
            return response.data;
        },
        onSuccess: (data) => {
            alert(data?.message)
            queryClient.invalidateQueries({ queryKey: ['users'] })
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
        },
        onError: (error) => {
            alert(error?.message);
        }
    });
    // 유저 상태 에러시 상태 초기화
    const resetStatusMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.post(`/admin/users/${id}/reset-status`);
            return response.data;
        },
        onSuccess: (data) => {
            alert(data?.message);
        },
        onError: (error) => {
            alert(error?.message);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            if (authUser.id === id) throw Error('본인의 아이디는 삭제 불가입니다.');
            const response = await api.delete(`/admin/users/${id}/delete-account`);
            return response.data;
        },
        onSuccess: (data) => {
            alert(data?.message);
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            alert(error?.message);
        }
    });

    const deleteMatchMutation = useMutation({
        mutationFn: async (matchId) => {
            const response = await api.delete(`/admin/matches/${matchId}/delete-match`);
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message || "해당 경기 기록이 삭제되었습니다.");
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['matchHistory'] });
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    return {
        adminUserList, // 관리자용 userList
        isLoading, // 로딩
        isError, // 에러
        refetch,
        resetPasswordMutation, // 관리자용 비밀번호 초기화 함수
        updateRoleMutation, // 관리자용 등급 변경 함수
        allowedRoles, // 관리자 변경 등급 제한
        resetStatusMutation, // 관리자용 상태 초기화
        deleteUserMutation, // 관리자용 계정 삭제
        deleteMatchMutation // 관리자용 기록 삭제
    };
}