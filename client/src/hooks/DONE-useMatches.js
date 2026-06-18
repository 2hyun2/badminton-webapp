import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "./api";

export const useMatches = (filterConfig = { type: 'period', value: 'total' }) => {
    // filterConfig: { type: 'period', value: 'total' | 'weekly' | 'monthly' }
    // OR { type: 'months', value: '1' | '2' | '3' | '4' | '5' }

    const queryClient = useQueryClient();
    const [endingMatchId, setEndingMatchId] = useState(null);

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

    const startMatchMutation = useMutation({
        mutationFn: async (selectedIds) => {
            const response = await api.post('/match/start', { selectedIds });
            return response.data;
        },
        onSuccess: () => {
            // alert("매칭 정보가 등록되었습니다.");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['matchHistory'] });
        },
    });

    const endMatchMutation = useMutation({
        mutationFn: async (matchData) => {
            const response = await api.post('/match/end', matchData);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.message) alert(data.message);
            
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['matchHistory'] });
            
            setEndingMatchId(null);
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.message || "오류가 발생했습니다.";
            alert(errorMsg);
        }
    });

    return { 
        matchHistory, 
        isLoading, 
        isError,
        startMatchMutation,
        endMatchMutation,
        endingMatchId,
        setEndingMatchId
    };
};