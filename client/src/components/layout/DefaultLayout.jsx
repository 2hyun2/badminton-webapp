import React, { useState } from 'react'
import { Outlet } from 'react-router-dom';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/api';

import { ModalMatchCreate } from '../modal/ModalMatchCreate';
import { useUsers } from '../../hooks/useUsers';
import { Header } from './Header';


export const DefaultLayout = () => {
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

    const queryClient = useQueryClient();

    const { userList, waitingCategory } = useUsers()

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
            <div className="min-h-screen h-full flex justify-center bg-gray-100">
                <div className="max-w-md w-full bg-white shadow-lg">
                    <Header onMatchCreate={() => setIsMatchModalOpen(true)} />

                    <main className='content-center w-full min-h-screen py-8 px-4'>
                        <Outlet />
                    </main>

                    {/* <footer className='fixed bottom-0'> */}
                        {/* @ 2026 badminton side project by hyun */}
                    {/* </footer> */}

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
