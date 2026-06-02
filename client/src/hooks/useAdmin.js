import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import useAuthStore from "../store/useAuthStore";

export const useAdmin = () => {

    const queryClient = useQueryClient(); // React Query 마스터키.
    const { user: authUser } = useAuthStore();

    const {
        data: adminUserList = [],
        isLoading: isAdminUsersLoading,
        refetch: refetchAdminUsers } = useQuery({
            queryKey: ['adminUsers'],
            queryFn: async () => {
                const response = await api.get('/admin/users');
                return response.data;
            },
        });

    const resetPasswordMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.post(`/admin/users/${userId}/reset-password`);
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message);
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const allowedRoles = ['USER', 'MANAGER'];
    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }) => {
            // 본인의 등급을 직접 변경하려는 경우 API 호출 전 차단
            if (authUser?.id === userId) throw new Error('본인의 등급은 스스로 변경할 수 없습니다.');

            const isAllowedRole = allowedRoles.includes(role);
            if (!isAllowedRole) throw new Error('허용되지 않은 등급입니다..');
            //  backend 에서 role 은 객체로 받음
            const response = await api.post(`admin/users/${userId}/update-role`, { role });
            return response.data;
        },
        onSuccess: (data) => {
            console.log("변경 완료된 유저 데이터:", data.user);
            alert(data.message);

            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.message || error.message;
            alert(errorMsg);
        }
    });

    const resetStatusMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.post(`/admin/users/${userId}/reset-status`);
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message);
            // 데이터 폭파 user, adminUser
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.delete(`/admin/users/${userId}`);
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message);

            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const deleteMatchMutation = useMutation({
        mutationFn: async (matchId) => {
            const response = await api.delete(`/admin/matches/${matchId}`);
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message || "해당 경기 기록이 삭제되었습니다.");

            // 경기 리스트 (['matchHistory'])  
            queryClient.invalidateQueries({ queryKey: ['matchHistory'] });
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    return {
        adminUserList, // 관리자용 userList
        isAdminUsersLoading, // 관리자용 로딩 상태
        refetchAdminUsers, // 관리자용 수동 새로고침 버튼용
        resetPasswordMutation, // 관리자용 비밀번호 초기화 함수
        updateRoleMutation, // 관리자용 등급 변경 함수
        allowedRoles, // 관리자 변경 등급 제한
        resetStatusMutation, // 관리자용 상태 초기화
        deleteUserMutation, // 관리자용 계정 삭제
        deleteMatchMutation // 관리자용 기록 삭제
    };
};