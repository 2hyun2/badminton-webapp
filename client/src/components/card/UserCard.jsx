import React from 'react'
import { Mars, Venus } from 'lucide-react';
const statusColor = {
    "WAITING": {
        "MALE": "text-blue-700 bg-blue-100 border-blue-200",
        "남성": "text-blue-700 bg-blue-100 border-blue-200",
        "FEMALE": "text-rose-700 bg-rose-100 border-rose-200",
        "여성": "text-rose-700 bg-rose-100 border-rose-200"
    },
    "PLAYING": "text-red-700 bg-red-100 border-red-200",
    "RESTING": "text-emerald-700 bg-emerald-100 border-emerald-200",
    "OFFLINE": "text-slate-400 bg-slate-50 border-slate-200 opacity-80"
};

export const UserCard = ({ user, onToggle }) => {
    const GenderIcon = user.gender === 'MALE' || user.gender === '남성' ? Mars : Venus;

    // 색상을 결정하는 로직 분리
    const getStatusColor = () => {
        if (!user.isPresent || user.status === 'OFFLINE') {
            return statusColor["OFFLINE"];
        }

        const config = statusColor[user.status];
        if (typeof config === 'object' && config !== null) {
            return config[user.gender] || "bg-slate-500";
        }
        return config || "bg-slate-500";
    };

    return (
        <div
            onClick={onToggle ? () => onToggle(user.id) : undefined}
            className={`
                ${getStatusColor()} 
                inline-flex items-center rounded-lg border p-1 transition-all
                ${onToggle  ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}
            `}
        >
            <div className="flex items-center gap-1">
                <GenderIcon size={12} className="" />
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-slate-900 font-medium bg-white border border-slate-500/50 rounded py-0.25 px-0.5">{user.rating}</span>

                <div className="flex items-center gap-1">
                    {user.groupId && (
                        <span className="text-[10px] text-red-500 font-bold">
                            {user.groupId.slice(0, 4)}
                        </span>
                    )}
                    {/* {user.todayPlayCount !== 0 && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 px-1 rounded">
                            {user.todayPlayCount}회
                        </span>
                    )} */}
                </div>
            </div>
        </div>
    );
};
