import { useState } from 'react';

export const ModalAdminRoleUpdate = ({ user, roles, onAction, onClose }) => {
    const [newRole, setNewRole] = useState(user?.role || 'USER');

    const handleConfirm = () => {
        onAction('role', user, { role: newRole });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3 className="modal-title">{user?.name}님 등급 변경</h3>
                
                <div className="my-4">
                    <select 
                        value={newRole} 
                        onChange={(e) => setNewRole(e.target.value)}
                        className="border border-slate-300 rounded p-1 w-full"
                    >
                        {roles.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* 💡 변경을 확정하거나 모달을 닫을 버튼 배치 공간 예시 */}
                <div className="flex justify-end gap-2 text-xs font-bold">
                    <button onClick={onClose} className="px-3 py-1.5 bg-slate-200 rounded">취소</button>
                    <button onClick={handleConfirm} className="px-3 py-1.5 bg-indigo-600 text-white rounded">변경</button>
                </div>
            </div>
        </div>
    );
};