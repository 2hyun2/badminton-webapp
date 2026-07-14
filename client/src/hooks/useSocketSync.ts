import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import useAuthStore from '../store/useAuthStore';
import { ISocketUpdate } from '../types/types_socket';

export const useSocketSync = () => {
    const { user: authUser } = useAuthStore();
    const { socketOn, socketOff } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        const socketUpdate = (data: ISocketUpdate) => {
            // 1. 전역 React Query 캐시 새로고침 (이거 하나로 온 동네 컴포넌트가 다 업데이트됨)
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['matchHistory'] });

            // 2. 자동 퇴장 처리 (딱 1번만 실행됨)
            if (authUser && data.userId === authUser.id) {
                if (data.type === 'EXIT') {
                    useAuthStore.setState((state: any) => ({
                        token: null,
                        user: state.user
                            ? { ...state.user, isPresent: false, status: '' }
                            : null
                    }));
                    alert('1시간 동안 활동이 없어 자동 퇴장되었습니다.');
                    window.location.href = '/login';
                }
            }
        };

        socketOn('users:update', socketUpdate);
        socketOn('matches:update', socketUpdate);

        return () => {
            if (socketOff) socketOff('users:update', socketUpdate);
            if (socketOff) socketOff('matches:update', socketUpdate);
        };
    }, [socketOn, socketOff, queryClient, authUser]);
};