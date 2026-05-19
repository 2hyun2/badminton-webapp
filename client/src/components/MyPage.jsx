import React from 'react';
import { useUsers } from '../hooks/useUsers';

export const MyPage = () => {
    const { me, isLoading } = useUsers();

    if (isLoading) return <div className="p-10 text-center">사용자 정보를 불러오는 중...</div>;
    if (!me) return <div className="p-10 text-center text-rose-500 font-bold">사용자 정보를 찾을 수 없습니다.</div>;

    const winRate = me.playCount > 0 ? ((me.wins / me.playCount) * 100).toFixed(1) : "0.0";

    const statusLabels = {
        RESTING: '휴식 중',
        WAITING: '매칭 대기 중',
        PLAYING: '경기 진행 중',
        OFFLINE: '미입장'
    };

    const roleLabels = {
        USER: '회원',
        ADMIN: '관리자'
    };

    const matchLabels = {
        FREE: '자유',
        MIXED: '혼복',
        MALE_D: '남복',
        FEMALE_D: '여복'
    };

    return (
        <div className="space-y-4">
            <h2 className="pages-title">MY PAGE</h2>

            {/* 핵심 프로필 카드 */}
            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                        {roleLabels[me.role] || me.role}
                    </span>
                </div>
                
                <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-4xl shadow-lg border-2 border-white">
                        {me.gender === 'MALE' ? '👨‍🏸' : '👩‍🏸'}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">{me.name}</h3>
                        <p className="text-slate-400 font-medium">@{me.username}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-emerald-600">{statusLabels[me.status] || '상태 알 수 없음'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-xs text-slate-400 font-bold block mb-1">나의 티어</span>
                        <span className="text-lg font-black text-blue-600">{me.tier || 'UNRANKED'}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="text-xs text-slate-400 font-bold block mb-1">ELO RATING</span>
                        <span className="text-lg font-black text-slate-800 font-mono">{me.rating} <small className="text-[10px] text-slate-400">pt</small></span>
                    </div>
                </div>
            </section>

            {/* 통계 그리드 */}
            <section className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-center">
                    <span className="text-sm font-bold text-slate-400 block mb-2">총 전적</span>
                    <div className="text-xl font-black text-slate-800">
                        {me.playCount} <span className="text-xs font-normal text-slate-400">경기</span>
                    </div>
                    <div className="mt-2 text-xs font-bold text-slate-500">
                        <span className="text-emerald-500">{me.wins}승</span> / <span className="text-rose-500">{me.losses}패</span>
                    </div>
                </div>

                <div className="bg-blue-600 p-5 rounded-3xl shadow-md text-center">
                    <span className="text-sm font-bold text-blue-200 block mb-2">승률</span>
                    <div className="text-3xl font-black text-white font-mono leading-none">
                        {winRate}<small className="text-sm ml-0.5">%</small>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-blue-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${winRate}%` }}></div>
                    </div>
                </div>
            </section>

            {/* 정보 리스트 */}
            <section className="bg-slate-50 rounded-3xl p-2">
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500">생년월일</span>
                        <span className="text-sm font-bold text-slate-700">{me.birthday}</span>
                    </div>
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500">선호 종목</span>
                        <span className="text-sm font-bold text-blue-600">{matchLabels[me.preferredMatch] || '자유'}</span>
                    </div>
                </div>
            </section>

            <button 
                className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                onClick={() => alert('프로필 수정 기능은 준비 중입니다.')}
            >
                프로필 수정하기
            </button>
        </div>
    );
};