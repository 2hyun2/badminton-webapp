import React, { useState } from 'react';
import { Button } from '../common/Button';
import { UserCard } from '../UserCard';

export const ModalMatchCreate = ({ userList, waitingCategory, onClose, onMatchStart }) => {
  const [matchSlots, setMatchSlots] = useState([null, null, null, null]);

  const handleSelect = (clickedUser) => {
    const isAlreadyIn = matchSlots.some(slot => slot && slot.id === clickedUser.id);

    if (isAlreadyIn) {
      const newSlots = matchSlots.map(slot => {
        if (!slot) return null;
        if (slot.id === clickedUser.id || (clickedUser.groupId && clickedUser.groupId === slot.groupId)) return null;
        return slot;
      });
      setMatchSlots(newSlots);
      return;
    }

    const emptyCount = matchSlots.filter(slot => slot === null).length;

    if (clickedUser.groupId) {
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
    const selectedIds = matchSlots.map(u => u.id);
    onMatchStart(selectedIds);
  };

  const getAvg = (s1, s2) => s1 && s2 ? ((s1.rating + s2.rating) / 2).toFixed(0) : 0;

  return (
    <div className="modal-overlay">
      {/* 매칭 보드 UI 영역 */}
      <div className="modal-container">
        <h3 className="modal-title">경기 매칭 보드</h3>
        <div className="flex w-full max-w-md justify-between items-center gap-2 mb-4">
          {/* Team A 슬롯 */}
          <div className="flex-1 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs font-bold text-blue-600  mb-2">TEAM A</div>
            {[0, 1].map(i => (
              <div
                key={i}
                className="mb-1 cursor-pointer transition-all hover:scale-[0.98]"
                onClick={() => matchSlots[i] && handleSelect(matchSlots[i])}
              >
                {matchSlots[i] ? (
                  <UserCard user={matchSlots[i]} onToggle={() => { }} />
                ) : (
                  <div className="h-12 bg-white border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center text-sm text-blue-300 font-bold">+ </div>
                )}
              </div>
            ))}
            <div className="text-[10px]  text-gray-400">평균: {getAvg(matchSlots[0], matchSlots[1])}</div>
          </div>
          <div className="italic font-black text-red-500">VS</div>
          {/* Team B 슬롯 */}
          <div className="flex-1 p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs font-bold text-red-600  mb-2">TEAM B</div>
            {[2, 3].map(i => (
              <div
                key={i}
                className="mb-1 cursor-pointer transition-all hover:scale-[0.98]"
                onClick={() => matchSlots[i] && handleSelect(matchSlots[i])}
              >
                {matchSlots[i] ? (
                  <UserCard user={matchSlots[i]} onToggle={() => { }} />
                ) : (
                  <div className="h-12 bg-white border-2 border-dashed border-red-200 rounded-lg flex items-center justify-center text-sm text-red-300 font-bold">+</div>
                )}
              </div>
            ))}
            <div className="text-[10px]  text-gray-400">평균: {getAvg(matchSlots[2], matchSlots[3])}</div>
          </div>
        </div>

        <div className="w-full max-w-md flex gap-2">
          <Button onClick={onClose} variant="gray" className="flex-1">닫기</Button>
          <Button onClick={handleConfirm} disabled={matchSlots.includes(null)} variant="blue" className="flex-1">경기 시작</Button>
        </div>

        <div className="flex-1 rounded overflow-y-auto">
          <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
            {Object.entries(waitingCategory).map(([category, players]) => (
              <div key={category} className='mb-2'>
                <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  {category} <span className="text-blue-500">{players.length}명</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {players.map((user) => {
                    const isSelected = matchSlots.some((s) => s?.id === user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelect(user)}
                        className={`cursor-pointer transition-all ${isSelected ? "opacity-30 scale-95" : "hover:scale-100"}`}
                      >
                        <UserCard user={user} onToggle={() => { }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};