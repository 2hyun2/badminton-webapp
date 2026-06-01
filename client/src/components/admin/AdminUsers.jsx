import { useState } from 'react'
import { useAdmin } from '../../hooks/useAdmin'
import { UserCard } from '../card/UserCard'
import { ModalAdminRoleUpdate } from '../modal/ModalAdminRoleUpdate';

export const AdminUsers = () => {
    const {
        isAdminUsersLoading,
        adminUserList,
        resetStatusMutation,
        updateRoleMutation,
        allowedRoles,
        resetPasswordMutation,
        deleteUserMutation
    } = useAdmin();

    const [selectedUser, setSelectedUser] = useState(null);

    // ⚡ 공통으로 쓸 수 있는 헬퍼 함수 정의
    const handleAction = (actionType, user, data) => {
        if (actionType === 'status') {
            if (window.confirm(`${user.name}님의 상태를 초기화 하시겠습니까?`)) {
                resetStatusMutation.mutate(user.id);
            }
        } else if (actionType === 'password') {
            if (window.confirm(`${user.name}님의 비밀번호를 초기화('0000') 하시겠습니까?`)) {
                resetPasswordMutation.mutate(user.id);
            }
        } else if (actionType === 'delete') {
            if (window.confirm(`${user.name}님을 정말로 추방하시겠습니까?`)) {
                deleteUserMutation.mutate(user.id);
            }
        } else if (actionType === 'role') {
            if (window.confirm(`${user.name}님의 등급을 ${data.role}으로 변경하시겠습니까?`)) {
                updateRoleMutation.mutate({ userId: user.id, role: data.role });
            }
        }
    };

    if (isAdminUsersLoading) return <div>로딩 중...</div>;

    return (
        <>
            <h2 className="pages-title">ADMIN 유저 관리 리스트</h2>

            <ul className='space-y-2'>
                {adminUserList.map(user => (
                    <li key={user.id} className='flex gap-2 items-center justify-between border border-slate-100 rounded-lg shadow-md p-1'>
                        <UserCard user={user} onToggle={user.id} />

                        <div className="flex flex-wrap gap-1">
                            <button onClick={() => handleAction('status', user)} className="inline-block text-[10px] text-white font-bold bg-green-500 rounded shadow py-1 px-1.5 cursor-pointer" >상태 초기화</button>
                            <button onClick={() => handleAction('password', user)} className="inline-block text-[10px] text-white font-bold bg-blue-400 rounded shadow py-1 px-1.5 cursor-pointer" >비밀번호 초기화</button>
                            <button onClick={() => setSelectedUser(user)} className="inline-block text-[10px] text-white font-bold bg-amber-500 rounded shadow py-1 px-1.5 cursor-pointer" >등급 변경</button>
                            <button onClick={() => handleAction('delete', user)} className="inline-block text-[10px] text-white font-bold bg-red-600 rounded shadow py-1 px-1.5 cursor-pointer" >추방하기</button>
                        </div>
                    </li>
                ))}
            </ul>

            {selectedUser &&
                <ModalAdminRoleUpdate
                    user={selectedUser}
                    roles={allowedRoles}
                    onAction={handleAction}
                    onClose={() => setSelectedUser(null)}
                />
            }
        </>
    );
};