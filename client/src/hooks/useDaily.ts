import api from "./api";
import { useQuery, useMutation } from "@tanstack/react-query";

interface MatchItem {
    matchId: number;
    result: string;
    ratingChange: number;
    time: string;
}

interface DailyResponse {
    userId: number;
    date: string;
    entryTime: string;
    matches?: MatchItem[] | null;
    startRating: number;
    endRating?: number;
    exitTime?: string;
}

export const useDaily = (userId?: number) => {
    return useQuery({
        queryKey: ['daily', userId],
        queryFn: async () => {
            const response = await api.get<DailyResponse[]>(`/daily/one/${userId}`);
            return response.data;
        },
        enabled: !!userId
    })
}

// export const useDaily = () => {

//     const getDailyData = useMutation({
//         mutationFn: async (id: number) => {
//             const response = await api.get<DailyResponse[]>(`/daily/one/${id}`);
//             return response.data;
//         },
//         onSuccess: (data) => {
//             console.log(data);
//             console.log('daily 기록 갯수', data.length);
//         },
//         onError: (error: any) => {
//             alert(error?.response?.data?.message || '데일리 데이터 오류')
//         }
//     });

//     return { getDailyData };
// };