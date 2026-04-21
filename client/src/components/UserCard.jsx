import React from 'react'

const statusColor = {
  "대기중": "text-blue-700 bg-blue-100 border-blue-200",
  "경기중": "text-red-700 bg-red-100 border-red-200",
  "휴식중": "text-emerald-700 bg-emerald-100 border-emerald-200"
};

export const UserCard = ({ user, onToggle }) => {
  return (
    <div
      onClick={() => onToggle(user.id)}
      className={`${statusColor[user.status] || "bg-gray-100"} inline-flex rounded-lg border p-1 cursor-pointer transition-all`}
    >
      <div className="flex items-center gap-1 font-semibold">
        <span className="text-base font-extrabold tracking-tight">
          {user.name}
        </span>
        <span className="text-[12px] font-medium px-2 py-0.5 rounded bg-white/75 text-slate-700 shadow-inner">
          {user.rating}점
        </span>
        {/* <span> */}
          {/* {user.playCount}판 */}
        {/* </span> */}
        {/* {user.status === "대기중" ? user.preferredMatch : null} */}
      </div>
    </div>
  );
};

