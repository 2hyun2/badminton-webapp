import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';

export const ModalWaitOption = ({ userList, waitTargetId, onClose, onConfirm }) => {
    const [selectedPref, setSelectedPref] = useState("자유");
    const [selectedPartnerId, setSelectedPartnerId] = useState("");
    
    const modalRef = useRef(null);

    // 모달 오픈 시 컨테이너에 포커스
    useEffect(() => {
        if (modalRef.current) modalRef.current.focus();
    }, []);

    const handleConfirm = () => {
        onConfirm(selectedPref, selectedPartnerId);
    };

    const handleKeyDown = (e) => {
        if (e.nativeEvent.isComposing) return;

        // ESC는 어디서든 작동하게 유지
        if (e.key === 'Escape') {
            onClose();
        }
        
        // 엔터 로직: 현재 포커스된 요소가 버튼이 아닐 때만 handleConfirm 실행
        // (버튼 위에서 엔터 치면 onClick이 자동으로 발생하기 때문)
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            handleConfirm();
        }
    };

    const prefTypes = ["자유", "혼복", "남복", "여복"];

    return (
        <div 
            className="modal-overlay" 
            onClick={(e) => e.target === e.currentTarget ? onClose() : null}
        >
            <div 
                className="modal-container" 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                <h3 className="modal-title">대기열 등록</h3>

                {/* 버튼 영역: Tab 키로 이동 가능 */}
                <div className="flex justify-center gap-2 mb-6">
                    {prefTypes.map(type => (
                        <Button
                            key={type}
                            onClick={() => setSelectedPref(type)}
                            // 포커스 되었을 때나 선택되었을 때 시각적 효과
                            variant={selectedPref === type ? 'blue' : 'gray'}
                            size="md"
                            className="focus:ring-2 focus:ring-blue-400 outline-none"
                        >
                            {type}
                        </Button>
                    ))}
                </div>

                <div className="mb-6">
                    <select
                        value={selectedPartnerId}
                        onChange={(e) => setSelectedPartnerId(e.target.value)}
                        className="w-full p-3 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
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
                </div>

                <div className="flex gap-2">
                    <Button onClick={onClose} size='md' variant="gray" className="flex-1">취소</Button>
                    <Button onClick={handleConfirm} size='md' variant="blue" className="flex-1">등록</Button>
                </div>
            </div>
        </div>
    );
};  