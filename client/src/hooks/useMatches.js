import { useQuery } from "@tanstack/react-query";
import api from "./api";

export const useMatches = (filterConfig = { type: 'period', value: 'total' }) => {
    // filterConfig: { type: 'period', value: 'total' | 'weekly' | 'monthly' }
    // OR { type: 'months', value: '1' | '2' | '3' | '4' | '5' }

    // 경기 이력 데이터 불러오기
    const { data: matchHistory = [], isLoading, isError } = useQuery({
        queryKey: ['matchHistory', filterConfig.type, filterConfig.value], // filterConfig가 바뀔 때마다 새로 fetching
        queryFn: async () => {
            let queryString = `/match/history?`;
            if (filterConfig.type === 'months') {
                queryString += `months=${filterConfig.value}`;
            } else { // filterConfig.type === 'period'
                queryString += `period=${filterConfig.value}`;
            }
            const response = await api.get(queryString);
            return response.data;
        },
    });

    return { matchHistory, isLoading, isError };
};