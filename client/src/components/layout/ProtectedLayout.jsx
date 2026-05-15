import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom';

import api from '../../hooks/api';

import { ModalMatchCreate } from '../modal/ModalMatchCreate';
import { useUsers } from '../../hooks/useUsers';
import { Header } from './Header';
import { ProtectedFooter } from './ProtectedFooter';
import useAuthStore from '../../store/useAuthStore';
import { ModalWaitOption } from '../modal/ModalWaitOption';


export const ProtectedLayout = () => {
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false); // 매칭 팝업 boolean
    const [waitTargetId, setWaitTargetId] = useState(null); // 모달 제어용 ID (기본값 null)

    const { me, user, userList, updateUsers, startMatchMutation, waitingCategory } = useUsers();

    const handleStartMatch = (selectedIds) => {
        startMatchMutation.mutate(selectedIds, {
            onSuccess: () => setIsMatchModalOpen(false)
        });
    }

    const handleWaitConfirm = async (selectedPref, selectedPartnerId) => {
        if (!me) return;
        
        let updates = [{ id: me.id, status: "대기중", preferredMatch: selectedPref }];
        
        if (selectedPartnerId) {
            const groupId = Date.now().toString();
            updates[0].groupId = groupId; // 본인에게도 groupId 부여
            updates.push({ id: selectedPartnerId, status: "대기중", preferredMatch: selectedPref, groupId: groupId });
        }

        try {
            await updateUsers.mutateAsync(updates);
        } catch (error) {
            console.error("상태 업데이트 실패:", error);
            alert("상태를 변경하는 중 오류가 발생했습니다.");
        }
        setWaitTargetId(null);
    };

    const toggleUserStatus = async () => {
        if (!me) return;

        if (me.status === "대기중") {
            const updates = [{ id: me.id, status: "휴식중", groupId: null }];
            // groupId가 있는 경우, 같은 그룹원(파트너)도 함께 휴식중으로 변경
            if (me.groupId) {
                const partners = userList.filter(user => user.groupId === me.groupId && user.id !== me.id);
                updates.push(...partners.map(user => ({ id: user.id, status: "휴식중", groupId: null })));
            }
            try {
                await updateUsers.mutateAsync(updates);
            } catch (error) {
                console.error("휴식 전환 실패:", error);
            }
        } else if (me.status === "휴식중") {
            setWaitTargetId(me.id);
        }
    };

        return (
            <div className="layout Protected">
                <div className={`flex justify-center min-h-screen bg-gray-100 h-screen`}>
                    <div className="max-w-md w-full bg-white shadow-lg flex flex-col min-h-screen">
                        <Header />

                        <main className='default-layout'>
                            <Outlet />
                        </main>

                        <ProtectedFooter 
                            me={me}
                            onMatchCreate={() => setIsMatchModalOpen(true)} 
                            onStatusToggle={toggleUserStatus}
                            isEntry={!!me}
                        />

                        {isMatchModalOpen && (
                            <ModalMatchCreate
                                me={me}
                                userList={userList}
                                waitingCategory={waitingCategory}
                                onClose={() => setIsMatchModalOpen(false)}
                                onMatchStart={handleStartMatch}
                            />
                        )}
                        {waitTargetId && (
                            <ModalWaitOption 
                                userList={userList}
                                waitTargetId={waitTargetId}
                                onClose={() => setWaitTargetId(null)}
                                onConfirm={handleWaitConfirm}
                            />
                        )}

                    </div>
                </div>
            </div>
        )
    }
