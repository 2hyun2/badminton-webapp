import { useState } from 'react';
import { Button } from '../common/Button';
import { UserCard } from '../card/UserCard';

export const ModalMatchCreate = ({ waitingList, onClose, onMatchStart }) => {
    const [matchConfig, setMatchConfig] = useState({
        type: '', // SINGLE, DOUBLE
        mode: '' // RANKED, FRIENDLY
    });
    const [matchSlots, setMatchSlots] = useState([null, null, null, null]);

    const handleTypeChange = (newType) => {
        setMatchConfig(prev => ({ ...prev, type: newType }));
        setMatchSlots([null, null, null, null]);
    };

    const handleModeChange = (newMode) => {
        setMatchConfig(prev => ({ ...prev, mode: newMode }));
        setMatchSlots([null, null, null, null]);
    };

    const handleSelect = (clickedUser) => {
        const isIn = matchSlots.some(slot => slot && slot.id === clickedUser.id);

        if (isIn) {
            setMatchSlots(matchSlots.map(slot => slot && slot.id === clickedUser.id ? null : slot));
            return;
        }

        if (matchConfig.type === 'SINGLE') {
            if (matchSlots[0] !== null && matchSlots[2] !== null) return alert("자리가 없습니다!");
            setMatchSlots(prev => {
                const next = [...prev];
                next[next[0] === null ? 0 : 2] = clickedUser;
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
        if (matchConfig.type === 'SINGLE') {
            if (matchSlots[0] === null || matchSlots[2] === null) {
                return alert("1대1은 양쪽 팀에 각 1명씩 필요합니다.");
            }
        } else {
            if (matchSlots.includes(null)) {
                return alert("2대2는 4명이 모두 필요합니다.");
            }
        }
        // 백엔드가 원하는 대로 객체 배열을 ID 배열로 변환해서 전송
        onMatchStart({
            // matchPlayer: matchSlots.filter(slot => slot !== null).map(slot => slot.id),
            matchPlayer: matchSlots.map(slot => slot ? slot.id : null),
            matchType: matchConfig.type,
            matchMode: matchConfig.mode
        });
    };

    const isConfirmDisabled = matchConfig.type === 'SINGLE'
        ? (matchSlots[0] === null || matchSlots[2] === null)
        : matchSlots.includes(null);

    const teamAIndices = matchConfig.type === 'SINGLE' ? [0] : [0, 1];
    const teamBIndices = matchConfig.type === 'SINGLE' ? [2] : [2, 3];

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3 className="modal-title">
                    경기 매칭 보드 <br />
                    <span className='text-sm '>{matchConfig.type} {matchConfig.mode}</span>
                </h3>

                {matchConfig.type !== '' && matchConfig.mode !== ''
                    ? (
                        <div className='space-y-8'>
                            <div className="flex gap-2 items-center justify-between">
                                <div className="space-y-1 flex-1 bg-blue-100 rounded-lg shadow-lg p-2">
                                    <div className="text-sm font-bold text-blue-600">TEAM A</div>
                                    {teamAIndices.map(i => (
                                        <div key={i} className="cursor-pointer" onClick={() => matchSlots[i] && handleSelect(matchSlots[i])}>
                                            {matchSlots[i] ? <UserCard user={matchSlots[i]} /> : <div className="h-10 border-2 border-dashed border-blue-300 rounded shadow-sm" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="font-black text-red-500">VS</div>
                                <div className="space-y-1 flex-1 bg-red-100 rounded-lg shadow-lg p-2">
                                    <div className="text-sm font-bold text-red-600">TEAM B</div>
                                    {teamBIndices.map(i => (
                                        <div key={i} className="cursor-pointer" onClick={() => matchSlots[i] && handleSelect(matchSlots[i])}>
                                            {matchSlots[i] ? <UserCard user={matchSlots[i]} /> : <div className="h-10 border-2 border-dashed border-red-300 rounded shadow-sm" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 bg-gray-100 border border-slate-300 rounded-lg shadow-lg p-2">
                                {Object.entries(waitingList).map(([category, players]) => (
                                    <div key={category} className="space-y-2 border-b border-slate-300 pb-2">
                                        <div className="text-sm font-bold text-gray-500 mb-1">{category}</div>
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
                        </div>
                    )
                    : (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <span className="font-bold text-sm">경기 인원</span>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleTypeChange('DOUBLE')} variant={matchConfig.type === 'DOUBLE' ? 'blue' : 'gray'} size='flex'>2 VS 2</Button>
                                    <Button onClick={() => handleTypeChange('SINGLE')} variant={matchConfig.type === 'SINGLE' ? 'red' : 'gray'} size='flex'>1 VS 1</Button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="font-bold text-sm">매칭 모드</span>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleModeChange('RANKED')} variant={matchConfig.mode === 'RANKED' ? 'blue' : 'gray'} size='flex'>랭크전</Button>
                                    <Button onClick={() => handleModeChange('FRIENDLY')} variant={matchConfig.mode === 'FRIENDLY' ? 'red' : 'gray'} size='flex'>친선전</Button>
                                </div>
                            </div>
                        </div>
                    )

                }
                <div className="flex gap-2">
                    <Button onClick={onClose} variant="gray" size="flex">닫기</Button>
                    {matchConfig.type !== '' && matchConfig.mode !== '' &&
                    <Button onClick={handleConfirm} disabled={isConfirmDisabled} variant="blue" size="flex">경기 시작</Button>
                    }
                </div>
            </div>
        </div>
    );
};