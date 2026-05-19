import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import api from "./api";
import useAuthStore from "../store/useAuthStore";
import { useSocket } from "./useSocket";
import useMatchStore from "../store/useMatchStore";

export const useUsers = () => {
    // useAuthStore 불러오기
    const { user: authUser, updatePresent } = useAuthStore();
    const setUserList = useMatchStore((state) => state.setUserList);

    // React Query 관리
    const queryClient = useQueryClient();
    const [endingMatchId, setEndingMatchId] = useState(null);
    const { on, off } = useSocket(); // off 함수가 있다고 가정합니다.

    // 소켓 이벤트 분류 및 자동 리프레시 로직
    useEffect(() => {
        const handleUserUpdate = (data) => {
            // console.log(`[Socket] 유저 상태 변경 감지 (${data.type})`);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        };

        const handleMatchUpdate = (data) => {
            // console.log(`[Socket] 매치 상태 변경 감지 (${data.type})`);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        };

        // 유저 업데이트 알림을 받으면 목록 새로고침
        on('users:update', handleUserUpdate);
        // 매치 업데이트 알림을 받으면 목록 새로고침
        on('match:update', handleMatchUpdate);

        return () => {
            if (off) {
                off('users:update', handleUserUpdate);
                off('match:update', handleMatchUpdate);
            }
        };
    }, [on, off, queryClient]);

    // useQuery 데이터 불러오기
    const { data: userList = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users');
            const data = response.data;
            setUserList(data); // 매칭 스토어와 동기화
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

    // 매칭 시작 Mutation (Layout에서 이동)
    const startMatchMutation = useMutation({
        mutationFn: async (selectedIds) => {
            const response = await api.post('/match/start', { selectedIds });
            return response.data;
        },
        onSuccess: () => {
            alert("매칭 정보가 등록되었습니다.");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

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
    // useMutation 경기 결과 입력
    const endMatchMutation = useMutation({
        mutationFn: async (matchData) => {
            const response = await api.post('/match/end', matchData);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.message) alert(data.message);
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEndingMatchId(null);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.message || "오류가 발생했습니다.";
            alert(errorMsg);
        }
    });

    const { presentList, restingList, waitingList, playingList, waitingCategory, me } = useMemo(() => {
        const presentList = userList.filter((user) => user.isPresent);
        // 경기 중인 유저들을 matchId별로 그룹화
        const playingMatchesMap = userList.reduce((acc, u) => {
            if (u.status === 'PLAYING' && u.matchId) {
                if (!acc[u.matchId]) acc[u.matchId] = { matchId: u.matchId, teamA: [], teamB: [] };
                // matchSlot 0, 1은 Team A / 2, 3은 Team B
                if (u.matchSlot === 0 || u.matchSlot === 1) acc[u.matchId].teamA.push(u);
                if (u.matchSlot === 2 || u.matchSlot === 3) acc[u.matchId].teamB.push(u);
            }
            return acc;
        }, {});

        const playing = Object.values(playingMatchesMap).sort((a, b) => b.matchId - a.matchId);
        const resting = presentList.filter((user) => user.status === 'RESTING');
        const waiting = presentList.filter((user) => user.status === 'WAITING');

        const myInfo = authUser 
            ? userList.find(u => u.id === authUser.id) 
            : null;

        const groups = { "자유": [], "혼복": [], "남복": [], "여복": [] };
        waiting.forEach(u => 
            groups[u.preferredMatch || "자유"]?.push(u));

        return {
            presentList: presentList,
            restingList: resting,
            waitingList: waiting,
            waitingCategory: groups,
            playingList: playing,
            me: myInfo
        };
    }, [userList, authUser]); // 원본 userList나 로그인 정보가 변경될 때마다 업데이트

    return {
        userList, // 원본 유저 데이터
        presentList, // 출석 유저 데이터
        playingList, // 경기중 명단
        me, // 실시간 업데이트되는 '나'의 정보
        restingList, // 휴식중 명단
        waitingList, // 대기중 명단
        waitingCategory,  // 대기중 명단 [자유, 남복, 여복, 혼복]
        isLoading, // 로딩 상태
        isError, // 에러 상태
        refetch, // 수동으로 새로고침이 필요할 때 쓸 함수
        endMatchMutation, // 경기 결과 POST
        startMatchMutation, // 매칭 시작 POST
        entryMutation,   // 입장 처리
        exitMutation,    // 퇴장 처리
        updateUsers: updateUserMutation, // 유저 업데이트에 필요한 함수
        endingMatchId, // 현재 종료 처리 중인 경기 ID
        setEndingMatchId // 경기 종료 상태 변경 함수
    };
}