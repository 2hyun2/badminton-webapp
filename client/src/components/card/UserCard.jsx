import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mars, Venus } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';

// 성별에 따른 text, bg
const genderColor = {
    "MALE": "text-blue-700 bg-blue-100",
    "남성": "text-blue-700 bg-blue-100",
    "FEMALE": "text-rose-700 bg-rose-100",
    "여성": "text-rose-700 bg-rose-100"
};
// 상태에 따른 border
const statusBorderColor = {
    "RESTING": "border-emerald-500", 
    "WAITING": "border-blue-500", 
    "PLAYING": "border-red-500", 
    "OFFLINE": "text-slate-400 bg-slate-50 border-slate-200 opacity-80"
};

export const UserCard = ({ user, onNavigate }) => {
    const navigate = useNavigate();
    const handleUserClick = (id) => { 
        if (onNavigate) navigate(`/record/${id}`);
    }

    const GenderIcon = user?.gender === 'MALE' || user?.gender === '남성' ? Mars : Venus;

    const getStatusColor = () => {
        if (!user?.isPresent || user?.status === 'OFFLINE') return statusBorderColor["OFFLINE"];

        const genderClass = genderColor[user?.gender] || "";
        const statusClass = statusBorderColor[user?.status] || "";

        return `${genderClass} ${statusClass}`.trim();
    };

    const cardStyle = getStatusColor();

    return (
        <div 
            onClick={() => handleUserClick(user?.id)}
            className={`inline-flex items-center justify-between py-1 px-1.5 border-l-4 rounded-[2px] shadow transition-all duration-300 cursor-pointer ${cardStyle}`}
        >
            <div className="flex items-center gap-1 text-xs">
                {/* <GenderIcon size={16} /> */}
                <span className="font-bold">{user?.name}</span>
                <span className="inline-block text-[80%] leading-none font-bold bg-white/80 rounded shadow p-[2px] opacity-80">{user?.rating}</span>
            </div>
        </div>
    );
};