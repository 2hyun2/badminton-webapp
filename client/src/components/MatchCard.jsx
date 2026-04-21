import React from 'react'
import { UserCard } from './UserCard'


export const MatchCard = ({ players, onToggle }) => {
return (
    <div className="flex items-center justify-between w-full border border-red-100 bg-red-50/30 p-4 rounded-xl mb-4 shadow-sm">
      <div className="flex flex-col gap-2 flex-1 items-center">
        <span className="text-[10px] text-red-400 font-bold uppercase mb-1">Team A</span>
        <div className="flex flex-col gap-2">
          {players[0] && <UserCard user={players[0]}/>}
          {players[1] && <UserCard user={players[1]}/>}
        </div>
      </div>

      {/* <div className="px-4 flex flex-col items-center">
        <div className="w-[1px] h-8 bg-red-200"></div>
        <span className="my-2 font-black text-red-500 italic">VS</span>
        <div className="w-[1px] h-8 bg-red-200"></div>
      </div> */}

      <div className="flex flex-col gap-2 flex-1 items-center">
        <span className="text-[10px] text-red-400 font-bold uppercase mb-1">Team B</span>
        <div className="flex flex-col gap-2">
          {players[2] && <UserCard user={players[2]}/>}
          {players[3] && <UserCard user={players[3]}/>}
        </div>
      </div>
    </div>
  );
}
