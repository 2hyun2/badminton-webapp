import React, { useState } from 'react';
import { Button } from '../common/Button';
import { UserCard } from '../card/UserCard';

export const ModalMatchCreate = ({ me, userList, waitingCategory, onClose, onMatchStart }) => {
    // State 경기 매칭 슬롯 default: [null, null, null, null]
    const [matchSlots, setMatchSlots] = useState(() => { // 파트너 존재 && 매칭 팝업시 TeamA 는 본인 && 파트너
        let initialSlots = [null, null, null, null];

        if (me && me.role !== 'ADMIN') {
            initialSlots[0] = me;

            if (me.groupId) {
                const partner = userList.find(u => u.id !== me.id && u.groupId === me.groupId);
                if (partner) initialSlots[1] = partner;
            }
        }
        return initialSlots;
    });

    const handleSelect = (clickedUser) => {
        // 슬롯에 이미 들어가 있는지 검증
        const isAlreadyIn = matchSlots.some(slot => slot && slot.id === clickedUser.id);

        if (isAlreadyIn) {
            if (me && me.role !== 'ADMIN') {
                const isMeOrPartner = clickedUser.id === me.id ||
                    (me.groupId && clickedUser.groupId === me.groupId);
                if (isMeOrPartner) {
                    alert("본인 || 파트너가 포함된 경기여야 합니다.");
                    return;
                }
            }

            const newSlots = matchSlots.map(slot => { // 슬롯 해제시 target?.groupdId 일시 같이 해제
                if (!slot) return null;
                if (slot.id === clickedUser.id || (clickedUser.groupId && clickedUser.groupId === slot.groupId)) return null;
                return slot;
            });
            setMatchSlots(newSlots);
            return;
        }

        const emptyCount = matchSlots.filter(slot => slot === null).length;

        if (clickedUser.groupId) { // target?.groupdId 2자리 필요
            if (emptyCount < 2) return alert("빈자리가 부족합니다!");
            const partner = userList.find(user => user.id !== clickedUser.id && user.groupId === clickedUser.groupId);
            let added = 0;
            setMatchSlots(matchSlots.map(slot => {
                if (slot === null && added === 0) { added++; return clickedUser; }
                if (slot === null && added === 1) { added++; return partner; }
                return slot;
            }));
        }
        else {
            if (emptyCount < 1) return alert("자리가 없습니다!");
            let added = false;
            setMatchSlots(matchSlots.map(slot => {
                if (slot === null && !added) { added = true; return clickedUser; }
                return slot;
            }));
        }
    };

    const handleConfirm = () => {
        const selectedIds = matchSlots.filter(Boolean).map((u) => u.id);
        onMatchStart(selectedIds);
    };

    const getAvg = (s1, s2) => s1 && s2 ? ((s1.rating + s2.rating) / 2).toFixed(0) : 0;

    return (
        <div className="modal-overlay">
            {/* 매칭 보드 UI 영역 */}
            <div className="modal-container">
                <h3 className="modal-title">경기 매칭 보드</h3>
                <div className="flex gap-2 items-center justify-between">
                    {/* Team A 슬롯 */}
                    <div className="space-y-2 flex-1 p-1 bg-blue-200 border border-blue-500 rounded-lg shadow">
                        <div className="text-sm font-bold text-blue-600">TEAM A</div>
                        <div className="flex flex-col gap-1">
                            {[0, 1].map(i => (
                                <div key={i} onClick={() => matchSlots[i] && handleSelect(matchSlots[i])} >
                                    {matchSlots[i] ? (
                                        <UserCard user={matchSlots[i]} />
                                    ) : (
                                        <div className="text-sm text-blue-300 font-bold text-center bg-white border-2 border-dashed border-blue-500 rounded p-1 overflow-hidden">+</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-slate-600 font-bold">평균: {getAvg(matchSlots[0], matchSlots[1])}</div>
                    </div>
                    <div className="italic font-black text-red-500">VS</div>
                    {/* Team B 슬롯 */}
                    <div className="space-y-2 flex-1 p-1 bg-red-200 border border-red-500 rounded-lg shadow">
                        <div className="text-sm font-bold text-red-600">TEAM B</div>
                        <div className="flex flex-col gap-1">
                            {[2, 3].map(i => (
                                <div key={i} onClick={() => matchSlots[i] && handleSelect(matchSlots[i])} >
                                    {matchSlots[i] ? (
                                        <UserCard user={matchSlots[i]} />
                                    ) : (
                                        <div className="text-sm text-red-300 font-bold text-center bg-white border-2 border-dashed border-red-500 rounded p-1 overflow-hidden">+</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-slate-600 font-bold">평균: {getAvg(matchSlots[2], matchSlots[3])}</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={onClose} variant="gray" size={'flex'}>닫기</Button>
                    <Button onClick={handleConfirm} disabled={matchSlots.includes(null)} variant="blue" size={'flex'}>경기 시작</Button>
                </div>

                <div className="flex-1 bg-gray-100 rounded-lg shadow p-2 overflow-hidden">
                    {Object.entries(waitingCategory).map(([category, players]) => (
                        <div key={category} className='mb-2'>
                            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                                {category} <span className="text-blue-500">{players.length}명</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {players.map((user) => {
                                    const isSelected = matchSlots.some((s) => s?.id === user.id);
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => handleSelect(user)}
                                            className={`cursor-pointer transition-all ${isSelected ? "opacity-30" : ""}`}
                                        >
                                            <UserCard user={user} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};