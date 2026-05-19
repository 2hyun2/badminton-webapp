import React from 'react'
// import { Mars, Venus, VenusMars } from 'lucide-react';
import { Mars, Venus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
const statusColor = {
  "대기중": {
    '남성': "text-blue-700 bg-blue-100 border-blue-200",
    '여성': "text-rose-700 bg-rose-100 border-rose-200"
  },
  "경기중": "text-red-700 bg-red-100 border-red-200",
  "휴식중": "text-emerald-700 bg-emerald-100 border-emerald-200"
};

export const UserCard = ({ user, onToggle }) => {
  const GenderIcon = user.gender === '남성' ? Mars : Venus;

  // 색상을 결정하는 로직 분리
  const getStatusColor = () => {
    const config = statusColor[user.status];
    
    // '대기중'처럼 성별 구분이 필요한 경우
    if (typeof config === 'object' && config !== null) {
      return config[user.gender] || "bg-gray-100";
    }
    
    // '경기중', '휴식중'처럼 단일 문자열인 경우
    return config || "bg-gray-100";
  };

  return (
    <div
      onClick={() => onToggle?.(user.id)}
      className={`${getStatusColor()} inline-flex rounded-lg border p-1`}
    >
      <div className="flex items-center gap-1">
        <GenderIcon size={12} className="" />
        <span className="text-sm font-semibold">
          {user.name}
        </span>
        <span className="text-xs font-medium py-0.25 px-1 rounded bg-white text-slate-700 shadow-inner">
          {user.rating}
        </span>
        
        {/* 우측 정렬 아이템들 */}
        <div className="flex items-center gap-1">
          {user.groupId && (
            <span className="text-[10px] text-red-500 font-bold">
              {user.groupId.slice(0, 4)}
            </span>
          )}
          {/* {user.playCount !== 0 && (
            <span className="text-[10px] opacity-70">
              {user.playCount}회
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
};
