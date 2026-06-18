import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from './api';

export const useMatches = (filterConfig = { type: 'period', value: 'total' }) => {
    // filterConfig: { type: 'period', value: 'total' | 'weekly' | 'monthly' }
    // OR { type: 'months', value: '1' | '2' | '3' | '4' | '5' }

    const queryClient = useQueryClient();
    const [endingMatchId, setEndingMatchId] = useState(null);

    // 매치 기록 불러오기 옵션 type, value 존재
    const { data: matchHistory = [], isLoading, isError } = useQuery({
        queryKey: ['matchHistory', filterConfig.type, filterConfig.value],
        queryFn: async () => {
            let queryString = `/match/history?`;
            if (filterConfig.type === 'months') {
                queryString += `months=${filterConfig.value}`;
            } else { // filterConfig.type === 'period'
                queryString += `period=${filterConfig.value}`;
            }
            const response = await api.get(queryString);
            return response.data;
        }
    });
    // 경기 시작 players, matchType, matchMode 
    const startMatchMutation = useMutation({
        mutationFn: async ({ matchPlayer, matchType, matchMode }: {
            matchPlayer: (number | null)[],
            matchType: 'SINGLE' | 'DOUBLE',
            matchMode: 'RANKED' | 'FRIENDLY',
        }) => {
            const response = await api.post('/match/start', { matchPlayer, matchType, matchMode });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['matchHistory'] });
        },
        onError: (error) => {
            alert(error?.message);
        }
    });

    const endMatchMutation = useMutation({
        mutationFn: async ({ matchId, winner, scoreA, scoreB }: {
            matchId: number,
            winner: 'A' | 'B' | 'VOID',
            scoreA: number,
            scoreB: number,
        }) => {
            const response = await api.post('/match/end', { matchId, winner, scoreA, scoreB });
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['matchHistory'] });
            setEndingMatchId(null);
        },
        onError: (error) => {
            alert(error?.message);
        }
    })

    return {
        matchHistory,
        isLoading,
        isError,
        startMatchMutation,
        endMatchMutation,
        endingMatchId,
        setEndingMatchId
    }
}
