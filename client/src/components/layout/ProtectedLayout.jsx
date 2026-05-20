import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

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

    const { user } = useAuthStore(); // 로그인 세션 정보는 AuthStore에서 직접 가져옵니다.
    const { me, userList, updateUsers, startMatchMutation, waitingCategory } = useUsers();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true })
        }
    }, [user, navigate])

    // 만약 로그인은 되어있는데(user 존재), 아직 서버에서 상세 정보(me)를 가져오는 중이라면 
    // 하위 컴포넌트나 UI가 깨지지 않도록 로딩 처리를 해줍니다.
    if (user && !me) return <div className="p-10 text-center">사용자 정보를 확인 중...</div>;

    const handleStartMatch = (selectedIds) => {
        startMatchMutation.mutate(selectedIds, {
            onSuccess: () => setIsMatchModalOpen(false)
        });
    }

    const handleWaitConfirm = async (selectedPref, selectedPartnerId) => {
        if (!me) return;

        let updates = [{ id: me.id, status: "WAITING", preferredMatch: selectedPref }];

        if (selectedPartnerId) {
            const groupId = Date.now().toString();
            updates[0].groupId = groupId; // 본인에게도 groupId 부여
            updates.push({ id: selectedPartnerId, status: "WAITING", preferredMatch: selectedPref, groupId: groupId });
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

        if (me.status === "WAITING") {
            const updates = [{ id: me.id, status: "RESTING", groupId: null }];
            // groupId가 있는 경우, 같은 그룹원(파트너)도 함께 휴식중으로 변경
            if (me.groupId) {
                const partners = userList.filter(user => user.groupId === me.groupId && user.id !== me.id);
                updates.push(...partners.map(user => ({ id: user.id, status: "RESTING", groupId: null })));
            }
            try {
                await updateUsers.mutateAsync(updates);
            } catch (error) {
                console.error("휴식 전환 실패:", error);
            }
        } else if (me.status === "RESTING") {
            setWaitTargetId(me.id);
        }
    };

    return (
        <div className="layout Protected">
            <div className={`flex justify-center min-h-screen bg-gray-100 h-screen`}>
                <div className="relative max-w-md w-full bg-white shadow-lg flex flex-col min-h-screen">
                    <Header />

                    <main className='default-layout relative [scrollbar-width:thin]'>
                        {/* 뒤로가기 버튼 */}
                        {location.pathname !== '/' && (
                            <button
                                onClick={() => navigate(-1)}
                                className="sticky top-0 z-100 text-slate-500 bg-white/80 backdrop-blur-sm p-1 m-0 rounded-md shadow-sm cursor-pointer transition-all ease-0.3 hover:bg-blue-500 hover:text-white hover:shadow-[0]"
                                aria-label="뒤로가기"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                        )}
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
