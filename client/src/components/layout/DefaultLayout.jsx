import React, { useState } from 'react'
import { Outlet } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/api';

import { ModalMatchCreate } from '../modal/ModalMatchCreate';
import { useUsers } from '../../hooks/useUsers';
import { Header } from './Header';
import { Footer } from './Footer';
import useAuthStore from '../../store/useAuthStore';


export const DefaultLayout = () => {
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

    const queryClient = useQueryClient();

    const { userList, waitingCategory } = useUsers();
    const { user } = useAuthStore();


    const startMatchMutation = useMutation({
        mutationFn: async (selectedIds) => {
            const response = await api.post('/match/start', { selectedIds });
            return response.data;
        },
        onSuccess: () => {
            alert("매칭 정보가 등록되었습니다.");
            setIsMatchModalOpen(false);
            queryClient.invalidateQueries(['users']); // useQuery users 에 정보 업데이트
        },
        onError: (error) => {
            console.error(error);
            alert("서버 에러 || 인원 부족")
        }
    });

    const handleStartMatch = (selectedIds) => {
        startMatchMutation.mutate(selectedIds)
    }

    return (
        <div className="layout default">
            <div className={`flex justify-center min-h-screen bg-gray-100 ${user ? 'h-screen ' : 'h-full'}`}>
                <div className="max-w-md w-full bg-white shadow-lg flex flex-col min-h-screen">
                    <Header />

                    <main
                        className={`w-full p-4 overflow-hidden overflow-y-auto flex-1 content-center`}
                    >
                        <Outlet />
                    </main>

                    <Footer onMatchCreate={() => setIsMatchModalOpen(true)} />

                    {isMatchModalOpen && (
                        <ModalMatchCreate
                            userList={userList}
                            waitingCategory={waitingCategory}
                            onClose={() => setIsMatchModalOpen(false)}
                            onMatchStart={handleStartMatch}
                        />
                    )}

                </div>
            </div>
        </div>
    )
}
