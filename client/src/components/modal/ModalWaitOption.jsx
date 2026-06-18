import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';

export const ModalWaitOption = ({ userList, waitTargetId, onClose, onConfirm }) => {
    const [selectedPref, setSelectedPref] = useState("자유"); // 대기열 카테고리 default: 자유
    const [selectedPartnerId, setSelectedPartnerId] = useState(""); // 파트너 선택
    
    const modalRef = useRef(null);

    useEffect(() => {
        if (modalRef.current) modalRef.current.focus();
    }, []);

    const handleConfirm = () => {
        onConfirm(selectedPref, selectedPartnerId);
    };

    const prefTypes = ["자유", "혼복", "남복", "여복"];

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget ? onClose() : null} >
            <div 
                className="modal-container" 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                <h3 className="modal-title">대기열 등록</h3>

                <div className="flex justify-center gap-2">
                    {prefTypes.map(type => (
                        <Button key={type} onClick={() => setSelectedPref(type)} variant={selectedPref === type ? 'blue' : 'gray'} size="flex" className="focus:ring-2 focus:ring-blue-400 outline-none">{type}</Button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <Button onClick={onClose} size='md' variant="gray" className="flex-1">취소</Button>
                    <Button onClick={handleConfirm} size='md' variant="blue" className="flex-1">등록</Button>
                </div>
            </div>
        </div>
    );
};  