import React, { useState } from 'react';
import { Button } from '../common/Button';
import { UserCard } from '../card/UserCard';

export const ModalMatchCreate = ({ me, userList, waitingList, onClose, onMatchStart }) => {
    const [matchType, setMatchType] = useState('DOUBLE');
    const [matchMode, setMatchMode] = useState(false); // false: 기본, true: FRIENDLY
    const [matchSlots, setMatchSlots] = useState([null, null, null, null]);

    const handleSelect = (clickedUser) => {
        const isIn = matchSlots.some(slot => slot && slot.id === clickedUser.id);

        if (isIn) {
            setMatchSlots(matchSlots.map(slot => slot && slot.id === clickedUser.id ? null : slot));
            return;
        }

        if (matchType === 'SINGLE') {
            if (matchSlots[0] !== null && matchSlots[3] !== null) return alert("자리가 없습니다!");
            setMatchSlots(prev => {
                const next = [...prev];
                next[next[0] === null ? 0 : 3] = clickedUser;
                return next;
            });
        } else {
            const emptyIndex = matchSlots.findIndex(slot => slot === null);
            if (emptyIndex === -1) return alert("자리가 없습니다!");
            setMatchSlots(prev => {
                const next = [...prev];
                next[emptyIndex] = clickedUser;
                return next;
            });
        }
    };

    const handleConfirm = () => {
        const activeSlots = matchSlots.filter(Boolean);
        if (matchType === 'SINGLE' && activeSlots.length !== 2) return alert("1대1은 2명이 필요합니다.");
        if (matchType === 'DOUBLE' && activeSlots.length !== 4) return alert("2대2는 4명이 필요합니다.");
        
        // 필요 시 matchMode를 onMatchStart에 함께 전달
        onMatchStart(activeSlots.map((u) => u.id), matchMode ? 'FRIENDLY' : 'RANKED');
    };

    const isConfirmDisabled = matchType === 'SINGLE' 
        ? (matchSlots[0] === null || matchSlots[3] === null) 
        : matchSlots.includes(null);

    const teamAIndices = matchType === 'SINGLE' ? [0] : [0, 1];
    const teamBIndices = matchType === 'SINGLE' ? [3] : [2, 3];

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3 className="modal-title">경기 매칭 보드</h3>
                
                {/* 모드 및 설정 */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        <Button onClick={() => { setMatchType('DOUBLE'); setMatchSlots([null, null, null, null]); }} variant={matchType === 'DOUBLE' ? 'blue' : 'gray'}>2 VS 2</Button>
                        <Button onClick={() => { setMatchType('SINGLE'); setMatchSlots([null, null, null, null]); }} variant={matchType === 'SINGLE' ? 'red' : 'gray'}>1 VS 1</Button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                        <input 
                            type="checkbox" 
                            checked={matchMode} 
                            onChange={(e) => setMatchMode(e.target.checked)} 
                        />
                        FRIENDLY 모드
                    </label>
                </div>

                {/* 경기판 */}
                <div className="flex gap-2 items-center justify-between mb-4">
                    <div className="flex-1 p-2 bg-blue-100 rounded-lg">
                        <div className="text-sm font-bold text-blue-600 mb-2">TEAM A</div>
                        {teamAIndices.map(i => (
                            <div key={i} className="mb-1 cursor-pointer" onClick={() => matchSlots[i] && handleSelect(matchSlots[i])}>
                                {matchSlots[i] ? <UserCard user={matchSlots[i]} /> : <div className="h-10 border-2 border-dashed border-blue-300 rounded" />}
                            </div>
                        ))}
                    </div>
                    <div className="font-black text-slate-400">VS</div>
                    <div className="flex-1 p-2 bg-red-100 rounded-lg">
                        <div className="text-sm font-bold text-red-600 mb-2">TEAM B</div>
                        {teamBIndices.map(i => (
                            <div key={i} className="mb-1 cursor-pointer" onClick={() => matchSlots[i] && handleSelect(matchSlots[i])}>
                                {matchSlots[i] ? <UserCard user={matchSlots[i]} /> : <div className="h-10 border-2 border-dashed border-red-300 rounded" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 대기자 명단 */}
                <div className="h-40 overflow-y-auto mb-4 bg-gray-50 p-2 rounded">
                    {Object.entries(waitingList).map(([cat, players]) => (
                        <div key={cat} className="mb-2">
                            <div className="text-xs font-bold text-gray-500 mb-1">{cat}</div>
                            <div className="flex flex-wrap gap-2">
                                {players.map(u => (
                                    <div key={u.id} onClick={() => handleSelect(u)} className={matchSlots.some(s => s?.id === u.id) ? "opacity-30" : "cursor-pointer"}>
                                        <UserCard user={u} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <Button onClick={onClose} variant="gray" size="flex">닫기</Button>
                    <Button onClick={handleConfirm} disabled={isConfirmDisabled} variant="blue" size="flex">경기 시작</Button>
                </div>
            </div>
        </div>
    );
};