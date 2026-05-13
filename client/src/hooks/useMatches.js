import { useQuery } from "@tanstack/react-query";
import api from "./api";

export const useMatches = () => {
    // 경기 이력 데이터 불러오기
    const { data: matchHistory = [], isLoading, isError } = useQuery({
        queryKey: ['matchHistory'],
        queryFn: async () => {
            const response = await api.get('/match/history');
            return response.data;
        },
    });

    return { matchHistory, isLoading, isError };
};