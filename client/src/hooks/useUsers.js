import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import axios from "axios";

export const useUsers = () => {

    // React Query 관리
    const queryClient = useQueryClient();

    // useQuery로 서버단에서 데이터 불러오기
    const { data: userList = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:5000/api/users');
            return response.data;
        },
    });

    // useQuery 업데이트
    const updateUserMutation = useMutation({
        mutationFn: async (updates) => {
            return await axios.post('http://localhost:5000/api/users/update', { updates });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    })

    const { restingList, waitingList, playingList, waitingCategory } = useMemo(() => {
        // const playing = userList.filter((user) => user.status === '경기중');
        const playing = Array.from(new Set(userList.filter(u => u.status === '경기중').map(u => u.matchId)) );
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
        waitingCategory,  // 종목별로 예쁘게 나뉜 대기중 명단 (자유, 남복, 여복, 혼복)
        isLoading, // 로딩 상태
        isError, // 에러 상태
        refetch, // 수동으로 새로고침이 필요할 때 쓸 함수
        updateUsers: updateUserMutation.mutate // 
    };
}