import { useState } from 'react'
import { useAdmin } from '../hooks/useAdmin'
import { UserCard } from '../components/card/UserCard'
import { ModalAdminRoleUpdate } from '../components/modal/ModalAdminRoleUpdate';
import { timeAgo } from '../utils/timeAgo'

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
    // 시간 순 정렬
    const sortedUsers = [...adminUserList].sort((a, b) => {
        // entryTime이 없는 경우 예외 처리
        if (!a.entryTime) return 1;
        if (!b.entryTime) return -1;

        return new Date(b.entryTime) - new Date(a.entryTime);
    });

    // confirm => action
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

    if (!adminUserList) return <div>로딩 중...</div>;

    return (
        <>
            <h2 className="pages-title">ADMIN 유저 관리 리스트</h2>

            <ul className='space-y-2'>
                {sortedUsers.map(user => (
                    <li key={user.id} className=''>
                        <details className='border border-slate-100 rounded-lg shadow-md p-2 cursor-pointer transition-all duration-300 hover:border-slate-500 open:border-slate-900'>

                            <summary className="flex gap-2 items-center justify-between">
                                <UserCard user={user} onNavigate={true} />
                                <span className='text-xs text-slate-400'>{timeAgo(user.entryTime)}</span>
                            </summary>

                            <div className="flex flex-wrap gap-1 justify-end mt-2">
                                <button onClick={() => handleAction('status', user)} className="inline-block text-xs text-white font-bold bg-green-500 rounded shadow py-1 px-1.5 cursor-pointer" >상태 초기화</button>
                                <button onClick={() => handleAction('password', user)} className="inline-block text-xs text-white font-bold bg-blue-400 rounded shadow py-1 px-1.5 cursor-pointer" >비밀번호 초기화</button>
                                <button onClick={() => setSelectedUser(user)} className="inline-block text-xs text-white font-bold bg-amber-500 rounded shadow py-1 px-1.5 cursor-pointer" >등급 변경</button>
                                <button onClick={() => handleAction('delete', user)} className="inline-block text-xs text-white font-bold bg-red-600 rounded shadow py-1 px-1.5 cursor-pointer" >추방하기</button>
                            </div>
                        </details>
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