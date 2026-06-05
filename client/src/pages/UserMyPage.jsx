import React, { useState, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';


export const UserMyPage = () => {
    const { me, isLoading, updateUsers } = useUsers();
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
        birthday: '',
        gender: '',
        bio: '',
        isBirthdayPublic: false,
        // isGenderPublic: true,
    });

    // 데이터 로드 시 초기값 설정
    useEffect(() => {
        if (me) {
            setFormData({
                name: me.name || '',
                password: '',
                confirmPassword: '',
                birthday: me.birthday || '',
                gender: me.gender || 'MALE',
                bio: me.bio || '',
                isBirthdayPublic: me.isBirthdayPublic ?? false,
                // isGenderPublic: me.isGenderPublic ?? true,
            });
        }
    }, [me]);

    if (isLoading) return <Loading/>;
    if (!me) return <div className="p-10 text-center text-rose-500 font-bold">사용자 정보를 찾을 수 없습니다.</div>;

    const winRate = me.playCount > 0 ? ((me.wins / me.playCount) * 100).toFixed(1) : "0.0";

    const handleSave = async () => {
        if (!formData.password) {
            alert('보안을 위해 비밀번호를 입력해야 정보 수정이 가능합니다.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        try {
            const { confirmPassword, ...updateData } = formData;
            await updateUsers.mutateAsync({ id: me.id, ...updateData });
            alert('정보가 성공적으로 수정되었습니다.');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // 저장 후 비번 필드 비우기
        } catch (error) {
            alert('정보 수정 중 오류가 발생했습니다.');
        }
    };

    const roleLabels = {
        USER: '회원',
        ADMIN: '관리자'
    };

    return (
        <div className="space-y-4">
            <h2 className="pages-title">MY PAGE (정보 수정)</h2>

            {/* 핵심 프로필 카드 */}
            <section className="relative bg-slate-50 border border-slate-200 rounded-xl shadow-sm p-2 overflow-hidden">
                <div className="absolute top-2 right-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100  rounded px-2 py-1">
                        {roleLabels[me.role] || me.role}
                    </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 aspect-square bg-blue-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg border-2 border-white">
                        {me.gender === 'MALE' ? '👨' : '👩'}
                    </div>
                    <div className='flex flex-col gap-0.5'>
                        <p className="text-slate-400 font-medium">@{me.username} <b>(ID)</b></p>
                        <h3 className="text-lg font-bold text-slate-800">{me.name}</h3>
                    </div>
                </div>

                <div className="flex">
                    <div className="flex-1 bg-slate-100 border border-slate-200 rounded-lg shadow-sm p-2">
                        <span className="text-xs text-slate-400 font-bold block">ELO RATING</span>
                        <span className="text-lg font-bold text-slate-800 font-mono">{me.rating}</span>
                    </div>
                </div>
            </section>

            {/* 통계 그리드 */}
            <section className="grid grid-cols-2 gap-2">
                <div className="text-base text-slate-900 font-bold border border-slate-200 bg-slate-50 rounded-xl shadow-sm p-2">
                    <span className="">총 전적</span>
                    <div className="text-lg ">{me.playCount} 경기</div>
                    <div className="text-xs">
                        <span className="text-emerald-500">{me.wins}승</span> / <span className="text-rose-500">{me.losses}패</span>
                    </div>
                </div>

                <div className="text-base text-slate-900 font-bold border border-slate-200 bg-slate-50 rounded-xl shadow-sm p-2">
                    <span className="">승률</span>
                    <div className="text-lg font-black ">
                        {winRate}<small className="text-sm ml-0.5">%</small>
                    </div>
                    <div className="w-full h-2  bg-white border border-rose-200 overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${winRate}%` }}></div>
                    </div>
                </div>
            </section>

            {/* 정보 수정 폼 */}
            <section className="relative bg-slate-50 border border-slate-200 rounded-xl shadow-sm p-2">
                <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="label-default">이름</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-default"
                            placeholder="이름 입력"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                            <label className="label-default">생년월일</label>
                            <label className="text-[10px] text-slate-400 flex items-center gap-1 mb-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isBirthdayPublic}
                                    onChange={(e) => setFormData({ ...formData, isBirthdayPublic: e.target.checked })}
                                />
                                공개
                            </label>
                        </div>
                        <input
                            type="text"
                            value={formData.birthday} maxLength={6}
                            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                            className="input-default"
                            placeholder="YYYY.MM.DD"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="label-default">자기소개</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            maxLength={300} // 최대 300자 제한
                            className="input-default resize-none min-h-[100px]" // 크기 조절 막기 + 기본 최소 높이 지정
                        />
                    </div>

                    {/* <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                            <label className="label-default">성별</label>
                            <label className="text-[10px] text-slate-400 flex items-center gap-1 mb-1 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isGenderPublic}
                                    onChange={(e) => setFormData({...formData, isGenderPublic: e.target.checked})}
                                />
                                공개
                            </label>
                        </div>
                        <select 
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            className="input-default"
                        >
                            <option value="MALE">남성</option>
                            <option value="FEMALE">여성</option>
                        </select>
                    </div> */}

                    <div className="flex flex-col gap-1">
                        <label className="label-default">비밀번호 (본인 확인 및 변경)</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input-default"
                            placeholder="새 비밀번호 또는 현재 비밀번호"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="label-default">비밀번호 확인</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="input-default"
                            placeholder="비밀번호를 한번 더 입력하세요"
                        />
                    </div>
                </div>
            </section>

            <Button
                className='w-full'
                size={'flex'}
                variant={'blue'}
                onClick={handleSave}
                disabled={updateUsers.isPending}
            >
                {updateUsers.isPending ? '저장 중...' : '정보 저장하기'}
            </Button>
        </div>
    );
};