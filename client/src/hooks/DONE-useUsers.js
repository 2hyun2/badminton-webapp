import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import api from "./api";
import useAuthStore from "../store/useAuthStore";
import { useSocket } from "./useSocket";
import useMatchStore from "../store/useMatchStore";

export const useUsers = () => {

    //* zustand
    const { user: authUser, updatePresent } = useAuthStore(); // 구조분해할당을 통해 authUser로 이름을 변경(치환)하여 사용합니다.
    const setUserList = useMatchStore((state) => state.setUserList); // const { setUserList } = useMatchStore(); 전체 불러오기 금지 (state) => state.setUserList 로 내부 setUserList 함수만 소환
    //* socket
    const { socketOn, socketOff } = useSocket(); // hook - useSocket
    //* react-query
    const queryClient = useQueryClient(); // React Query 마스터키.    
    //* useEffect
    useEffect(() => {
        const handleUserUpdate = (data) => { // socket 'users:update' 전송시 
            queryClient.invalidateQueries({ queryKey: ['users'] }); // Query 'users' 초기화
        };
        const handleMatchUpdate = (data) => { // socket 'match:update' 전송시
            queryClient.invalidateQueries({ queryKey: ['users'] }); // Query 'users' 초기화
        };

        // socket on 연결
        socketOn('users:update', handleUserUpdate);
        socketOn('match:update', handleMatchUpdate);

        return () => { // useEffect 청소
            if (socketOff) {
                socketOff('users:update', handleUserUpdate);
                socketOff('match:update', handleMatchUpdate);
            }
        };
    }, [socketOn, socketOff, queryClient]);

    // useQuery 데이터 불러오기 위에는 선언부 실제 코드는 여기부터
    const { data: userList = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            const data = response.data;
            setUserList(data); // zustand - useMatchStore 에 다이렉트로 데이터 꽂기
            return data;
        },
    });

    // useMutation 업데이트 필요 함수
    const updateUserMutation = useMutation({
        mutationFn: async (updates) => {
            return await api.post('/users/update', { updates });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    })

    // useMutation 입장 처리
    const entryMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.post('/users/entry', { userId });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            updatePresent({ isPresent: true, status: "RESTING" });
            if (data.message || data.message !== undefined) alert(data.message);
        },
    });
    // useMutation 퇴장 처리
    const exitMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.post('/users/exit', { userId });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            // updatePresent를 사용하여 Zustand 스토어 업데이트
            updatePresent({ isPresent: false, status: "" });
            if (data.message || data.message !== undefined) alert(data.message);
        },
    });

const { presentList, restingList, waitingList, playingList, waitingCategory, me } = useMemo(() => {
        // 1. 현재 체육관에 출석한 전체 유저
        const presentList = userList.filter((user) => user.isPresent);

        // 2. 출석 유저 중 '휴식중' / '대기중' 상태 분류
        const resting = presentList.filter((user) => user.status === 'RESTING');
        const waiting = presentList.filter((user) => user.status === 'WAITING');

        // 3. [복구 완료] 경기 중인 유저들을 matchId(코트)별로 그룹화 및 팀(A/B) 배정
        const playingMatchesMap = userList.reduce((acc, u) => {
            if (u.status === 'PLAYING' && u.matchId) {
                if (!acc[u.matchId]) acc[u.matchId] = { matchId: u.matchId, teamA: [], teamB: [] };
                // matchSlot 0, 1은 Team A / 2, 3은 Team B
                if (u.matchSlot === 0 || u.matchSlot === 1) acc[u.matchId].teamA.push(u);
                if (u.matchSlot === 2 || u.matchSlot === 3) acc[u.matchId].teamB.push(u);
            }
            return acc;
        }, {});
        
        // 맵으로 묶인 경기들을 최신 매치(matchId 역순)가 위로 오도록 배열로 정렬
        const playing = Object.values(playingMatchesMap).sort((a, b) => b.matchId - a.matchId);

        // 4. 실시간 서버 데이터가 반영된 '나'의 최신 정보
        const myInfo = authUser
            ? userList.find(u => u.id === authUser.id)
            : null;

        // 5. 대기자들을 선호 종목별로 카테고리화
        const groups = { "자유": [], "혼복": [], "남복": [], "여복": [] };
        waiting.forEach(u =>
            groups[u.preferredMatch || "자유"]?.push(u));

        // 6. 가공 완료된 부품들 리턴
        return {
            presentList: presentList,
            restingList: resting,
            waitingList: waiting,
            playingList: playing, 
            waitingCategory: groups,
            me: myInfo
        };
    }, [userList, authUser]); // 원본 userList나 로그인 정보가 변경될 때마다 업데이트

    return {
        userList, // 원본 유저 데이터
        presentList, // 출석 유저 데이터
        me, // 실시간 업데이트되는 '나'의 정보
        restingList, // 휴식중 명단
        waitingList, // 대기중 명단
        waitingCategory,  // 대기중 명단 [자유, 남복, 여복, 혼복]
        playingList,
        isLoading, // 로딩 상태
        isError, // 에러 상태
        refetch, // 수동으로 새로고침이 필요할 때 쓸 함수
        entryMutation,   // 입장 처리
        exitMutation,    // 퇴장 처리
        updateUsers: updateUserMutation, // 유저 업데이트에 필요한 함수
    };
}