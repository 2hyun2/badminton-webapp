import React from 'react';
import { UserCard } from './UserCard';
import { Button } from './common/Button';


export const MatchCard = ({ matchId, players, onOpenModal }) => {
  // 1. 팀 나누기 (슬롯 순서대로 들어온다고 가정: 0,1은 A팀 / 2,3은 B팀)
  const teamAPlayers = players.slice(0, 2);
  const teamBPlayers = players.slice(2, 4);

  // 2. 평균 레이팅 계산 함수
  const calculateAvg = (teamPlayers) => {
    if (teamPlayers.length === 0) return 0;
    const sum = teamPlayers.reduce((acc, p) => acc + p.rating, 0);
    return Math.round(sum / teamPlayers.length);
  };

  const avgA = calculateAvg(teamAPlayers);
  const avgB = calculateAvg(teamBPlayers);

  return (
    <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
      {/* 카드 상단 헤더 */}
      <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500">MATCH #{String(matchId).slice(-4)}</span>
        <Button onClick={() => onOpenModal(matchId)} variant="outline" size="sm">결과 입력</Button>
      </div>

      <div className="p-4 flex items-center gap-4">
        {/* TEAM A */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-xs font-black text-blue-600">TEAM A</span>
            <span className="text-[10px] font-bold text-slate-400">Avg. {avgA}</span>
          </div>
          {teamAPlayers.map(player => (
            <UserCard key={player.id} user={player} onToggle={() => {}} />
          ))}
        </div>

        {/* VS 구분선 */}
        <div className="flex flex-col items-center">
          <div className="w-[1px] h-10 bg-slate-200 mb-2"></div>
          <span className="text-sm font-black text-red-500 italic">VS</span>
          <div className="w-[1px] h-10 bg-slate-200 mt-2"></div>
        </div>

        {/* TEAM B */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-xs font-black text-red-600">TEAM B</span>
            <span className="text-[10px] font-bold text-slate-400">Avg. {avgB}</span>
          </div>
          {teamBPlayers.map(player => (
            <UserCard key={player.id} user={player} onToggle={() => {}} />
          ))}
        </div>
      </div>

      {/* 레이팅 차이(밸런스) 표시 (선택 사항) */}
      <div className="bg-slate-50 text-center py-1 text-[9px] text-slate-400 border-t">
        팀 전력 차이: {Math.abs(avgA - avgB)}pt
      </div>
    </div>
  );
};