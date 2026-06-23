import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import api from './api';
import useAuthStore from "../store/useAuthStore";
import { useSocket } from "./useSocket";
import useMatchStore from "../store/useMatchStore";

import { ISocketUpdate } from '../types/types_socket';
import { InterfaceUser, InterfaceMatch } from '../types/badminton'

export const useUsers = () => {
    // zustand /store
    const { user: authUser, updatePresent } = useAuthStore(); // 구조분해할당을 통해 authUser로 이름을 치환;
    const setUserList = useMatchStore((state) => state.setUserList); // useMatchStore
    // socket  /hook
    const { socketOn, socketOff } = useSocket(); // useSocket
    //  Tanstack Query
    const queryClient = useQueryClient(); // React Query master key;
    // useEffect from 'react';
    useEffect(() => {
        const socketUpdate = (data: ISocketUpdate) => { // 유저 정보 업데이트에 의한 유저 업데이트
            queryClient.invalidateQueries({ queryKey: ['users'] }); // 모든 socket type에 유저 상태 업데이트
            queryClient.invalidateQueries({ queryKey: ['matchHistory'] }); // 경기 내역도 함께 업데이트

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
                } else if (data.type === 'UPDATE') {
                }
            }
        }

        socketOn('users:update', socketUpdate); // socket 연결 
        socketOn('matches:update', socketUpdate); // 경기 정보 업데이트 연결 

        return () => { // unmount시 청소
            if (socketOff) socketOff('users:update', socketUpdate);
            if (socketOff) socketOff('matches:update', socketUpdate);
        };
    }, [socketOn, socketOff, queryClient, authUser])

    // useQuery 데이터 불러오기
    const { data: userList = [], isLoading, isError, refetch } = useQuery<InterfaceUser[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('users');
            const data = response.data;
            setUserList(data); // zustand - useMatchStore 에 다이렉트로 데이터 꽂기
            return data;
        }
    })
    // update - userMutation
    const updateUserMutation = useMutation({
        mutationFn: async (data: Partial<InterfaceUser> | Partial<InterfaceUser>[]) => {
            return await api.post('/users/update', { updates: data });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || '유저 정보 업데이트 실패');
        }
    });
    // update - userEntry
    const entryMutation = useMutation({
        mutationFn: async (data: { id: number }) => { // id 를 entry로 보내 해당 ID 출석
            const response = await api.post('/users/entry', { id: data });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            updatePresent({ isPresent: true, status: 'RESTING' });
        },
        onError: (error: any) => {
            alert('failed to update entryMutation')
        }
    });
    // update - userExit
    const exitMutation = useMutation({
        mutationFn: async (data: { id: number }) => { // id 를 entry로 보내 해당 ID 퇴장
            const response = await api.post('/users/exit', { id: data });
            return response.data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            updatePresent({ isPresent: false, status: '' });
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || '퇴장 처리 실패')
        }
    })

    // useMemo를 활용한 isPresentUser - categories
    const userStatusData = useMemo(() => {
        // '자신'
        const myInfo = authUser ? userList.find(user => user.id === authUser.id) : null;
        // return list
        const presentList: InterfaceUser[] = [];
        const restingList: InterfaceUser[] = [];
        const waitingList: Record<string, InterfaceUser[]> = {
            '자유': [], '혼복': [], '남복': [], '여복': [],
        };
        const playingList: InterfaceUser[] = [];

        // 계산 로직
        userList.forEach((user: InterfaceUser) => {
            if (user.isPresent) {
                presentList.push(user);
                if (user.status === 'RESTING') restingList.push(user);
                if (user.status === 'PLAYING') playingList.push(user);
                if (user.status === 'WAITING') {
                    const preferredMatch = user.preferredMatch || '자유';
                    if (waitingList[preferredMatch]) {
                        waitingList[preferredMatch].push(user);
                    }
                }
            }
        })

        return {
            myInfo,
            presentList,
            restingList,
            waitingList,
            playingList
        }
    }, [userList, authUser])

    return {
        userList,
        isLoading,
        isError,
        refetch,
        me: userStatusData.myInfo,
        presentList: userStatusData.presentList,
        restingList: userStatusData.restingList,
        waitingList: userStatusData.waitingList,
        playingList: userStatusData.playingList,
        updateUserMutation,
        entryMutation,
        exitMutation
    };
}