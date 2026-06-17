import React, { useState, useMemo } from 'react';
import { useUsers } from '../hooks/useUsers';
import { UserCard } from '../components/card/UserCard';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';

export const UserListPage = () => {
    const { userList, isLoading } = useUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [chooseSort, setChooseSort] = useState('rating');

    const filteredUsers = useMemo(() => {
        if (!userList) return [];

        const filtered = userList.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (chooseSort === 'name') return filtered.sort((a, b) => a.name.localeCompare(b.name));
        if (chooseSort === 'rating') return filtered.sort((a, b) => b.rating - a.rating);
        if (chooseSort === 'isPresent') return filtered.sort((a, b) => (b.isPresent - a.isPresent) || (b.rating - a.rating));

        return filtered;
    }, [userList, searchTerm, chooseSort]);

    if (isLoading) return <Loading />;

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h2 className="pages-title">회원 목록</h2>
            </div>

            <input 
                type="text" 
                placeholder="이름 검색" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="input-default" 
            />

            {/* 💡 어떤 버튼이 활성화되어 있는지 눈에 띄도록 테두리나 스타일을 추가하면 UI가 훨씬 좋아집니다. */}
            <div className="flex gap-1">
                <Button size='flex' className={`border-2 ${chooseSort === 'rating' ? 'border-red-600' : 'border-white'}`} variant={'red'} onClick={() => setChooseSort('rating')} >점수순</Button>
                <Button size='flex' className={`border-2 ${chooseSort === 'name' ? 'border-blue-600' : 'border-white'}`} variant={'blue'} onClick={() => setChooseSort('name')} >이름순</Button>
                <Button size='flex' className={`border-2 ${chooseSort === 'isPresent' ? 'border-emerald-600' : 'border-white'}`} variant={'emerald'} onClick={() => setChooseSort('isPresent')} >출석순</Button>
            </div>

            <div className="space-y-2">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between bg-white border border-slate-300 rounded-lg shadow py-1 px-2">
                            <UserCard user={user} onNavigate={true} />
                            <div className="text-right">
                                <span className="block text-xs text-black font-bold">Elo: {user.rating}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-400 text-sm">검색 결과가 없습니다.</div>
                )}
            </div>
        </div>
    );
};