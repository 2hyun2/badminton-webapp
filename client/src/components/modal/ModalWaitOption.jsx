import React, { useState } from 'react';
import { Button } from '../common/Button';

export const ModalWaitOption = ({ userList, waitTargetId, onClose, onConfirm }) => {
    const [selectedPref, setSelectedPref] = useState("");
    const [selectedPartnerId, setSelectedPartnerId] = useState("");

    const handleConfirm = () => {
        onConfirm(selectedPref, selectedPartnerId);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget ? onClose() : null}  >
            <div className="modal-container">
                <h3 className="modal-title">대기열 등록</h3>

                <div className="flex justify-center gap-2">
                    {["자유", "혼복", "남복", "여복"].map(type => (
                        <Button
                            key={type}
                            onClick={() => setSelectedPref(type)}
                            variant={selectedPref === type ? 'blue' : 'gray'}
                            size="md"
                        >
                            {type}
                        </Button>
                    ))}
                </div>

                <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="p-3 border rounded-lg text-sm bg-gray-50"
                >
                    <option value="">파트너 없음 (개인 신청)</option>
                    {userList
                        .filter(u => u.status === "휴식중" && u.id !== waitTargetId)
                        .map(partner => (
                            <option key={partner.id} value={partner.id}>
                                {partner.name} ({partner.gender})
                            </option>
                        ))
                    }
                </select>

                <div className="flex gap-2 mt-2">
                    <Button onClick={onClose} children={"취소"} size='md' variant="gray" className="flex-1" />
                    <Button onClick={handleConfirm} children={"대기석으로 이동"} size='md' variant="blue" className="flex-1" />
                </div>
            </div>
        </div>
    );
};