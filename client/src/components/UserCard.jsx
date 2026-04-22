import React from 'react'
// import { Mars, Venus, VenusMars } from 'lucide-react';
import { Mars, Venus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
const statusColor = {
  "대기중": "text-blue-700 bg-blue-100 border-blue-200",
  "경기중": "text-red-700 bg-red-100 border-red-200",
  "휴식중": "text-emerald-700 bg-emerald-100 border-emerald-200"
};
// {
// name,
// gender
// tier,
// rating,
// status,
// matchId,
// preferredMatch,
// playCount,
// joinedAt,
// wins,
// losses,
// groupId
// }

export const UserCard = ({ user, onToggle }) => {
  const GenderIcon = user.gender === '남' ? Mars : Venus;
  return (
    <div
      onClick={() => onToggle(user.id)}
      className={`${statusColor[user.status] || "bg-gray-100"} inline-flex rounded-lg border p-1 cursor-pointer transition-all`}
    >
      <div className="flex items-center gap-1 w-full font-semibold">
        <GenderIcon size={16} className="opacity-80" />
        <span className="text-base font-extrabold tracking-tight">
          {user.name}
        </span>
        <span className="text-[12px] font-medium py-0.5 px-1 rounded bg-white/75 text-slate-700 shadow-inner">
          {user.rating}
        </span>
        {user.groupId ?
          <span className="text-[10px] text-red-500 ml-auto"> {user.groupId.slice(0, 4)}</span>
          : null}
        {user.playCount !== 0 ?
          <span className="text-[10px] ml-auto">{user.playCount}</span>
          : null}
      </div>
    </div>
  );
};

