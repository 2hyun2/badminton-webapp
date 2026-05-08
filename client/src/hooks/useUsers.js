import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import api from "./api";

export const useUsers = () => {

    // React Query 관리
    const queryClient = useQueryClient();
    // 경기 종료 중인 상태를 관리하기 위한 state (기존 코드에서 누락됨)
    const [endingMatchId, setEndingMatchId] = useState(null);

    // useQuery로 서버단에서 데이터 불러오기
    const { data: userList = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/users/present'); // 현장에 있는 유저만 가져오도록 변경
            return response.data;
        },
    });

    // useQuery 업데이트
    const updateUserMutation = useMutation({
        mutationFn: async (updates) => {
            return await api.post('/users/update', { updates });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    })

    const entryMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.post('/users/entry', { userId });
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const exitMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.post('/users/exit', { userId });
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const endMatchMutation = useMutation({
        mutationFn: async (matchData) => {
            const response = await api.post('/match/end', matchData);
            return response.data;
        },
        onSuccess: (data) => {
            alert(data.message);
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEndingMatchId(null);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.message || "오류가 발생했습니다.";
            alert(errorMsg);
        }
    });

    const { restingList, waitingList, playingList, waitingCategory } = useMemo(() => {
        // const playing = userList.filter((user) => user.status === '경기중');
        const playing = Array.from(new Set(userList.filter(u => u.status === '경기중').map(u => u.matchId)));
        const resting = userList.filter((user) => user.status === '휴식중');
        const waiting = userList.filter((user) => user.status === '대기중');

        const groups = { "자유": [], "혼복": [], "남복": [], "여복": [] };
        waiting.forEach((user) => {
            const pref = (user.preferredMatch === "" || user.preferredMatch === "자유")
                ? "자유"
                : user.preferredMatch;
            if (groups[pref]) groups[pref].push(user);
        });

        return {
            restingList: resting,
            waitingList: waiting,
            waitingCategory: groups,
            playingList: playing,
        };
    }, [userList]); // 원본 userList 가 변경시마다 부분 업데이트

    return {
        userList, // 원본 유저 데이터
        playingList, // 경기중 명단
        restingList, // 휴식중 명단
        waitingList, // 대기중 명단
        waitingCategory,  // 대기중 명단 [자유, 남복, 여복, 혼복]
        isLoading, // 로딩 상태
        isError, // 에러 상태
        refetch, // 수동으로 새로고침이 필요할 때 쓸 함수
        endMatchMutation, // 경기 결과 POST
        entryMutation,   // 입장 처리
        exitMutation,    // 퇴장 처리
        updateUsers: updateUserMutation.mutate, // 유저 업데이트에 필요한 함수
        endingMatchId, // 현재 종료 처리 중인 경기 ID
        setEndingMatchId // 경기 종료 상태 변경 함수
    };
}