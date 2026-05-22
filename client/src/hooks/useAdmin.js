import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

export const useAdmin = () => {

    const queryClient = useQueryClient(); // React Query 마스터키.    

    const { data: adminUserList = [],  isLoading: isAdminUsersLoading, refetch: refetchAdminUsers } = useQuery({
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
        resetStatusMutation, // 관리자용 상태 초기화
        deleteUserMutation, // 관리자용 계정 삭제
        deleteMatchMutation // 관리자용 기록 삭제
    };
};