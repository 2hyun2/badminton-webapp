import React from 'react';
import { Link } from 'react-router-dom';

export const AdminIndex = () => {
    return (
        <>
            <div className="pages-title">ADMIN</div>
            <ul className='flex flex-col gap-4 justify-center text-center text-lg font-bold'>
                <li>
                    <Link to="/admin/users" className="group flex flex-col bg-white border border-slate-500 rounded-lg shadow-md py-4 px-2 transition-all duration-300 hover:text-white hover:bg-blue-500 hover:border-white">
                        유저 관리하기
                        <span className="text-sm text-slate-400 transition-colors duration-300 group-hover:text-white/80">[상태 변화, 비밀번호 초기화, 탈퇴]</span>
                    </Link>
                </li>
                <li>
                    <Link to="/admin/matches" className="group flex flex-col bg-white border border-slate-500 rounded-lg shadow-md py-4 px-2 transition-all duration-300 hover:text-white hover:bg-blue-500 hover:border-white">
                        기록 관리하기
                        <span className="text-sm text-slate-400 transition-colors duration-300 group-hover:text-white/80">[기록 삭제]</span>
                    </Link>
                </li>
            </ul>
        </>
    )
}