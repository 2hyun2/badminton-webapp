import React, { useEffect, useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { Button } from '../components/common/Button';

import useAuthStore from '../store/useAuthStore';
import { useAuthMutation } from '../hooks/useAuth';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { user } = useAuthStore();
    const { loginMutation } = useAuthMutation();

    const navigate = useNavigate();

    const goNavigate = () => navigate('/', { replace: true });

    useEffect(() => {
        if (user) {
            goNavigate();
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            alert('아이디와 비밀번호를 입력해 주세요.');
            return;
        }

        try {
            const result = await loginMutation.mutateAsync({username, password});
            if (result.success) goNavigate();
        } catch (error) { }
    };

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 text-center">로그인</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label-default">아이디</label>
                        <input type="text" className="input-default" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="아이디 입력" required />
                    </div>

                    <div>
                        <label className="label-default">비밀번호</label>
                        <input type="password" className="input-default" value={password} autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" required />
                    </div>

                    <Button type='submit' disabled={loginMutation.isPending} variant='blue' size='md'>
                        {loginMutation.isPending ? '로그인 중...' : '로그인'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-xs text-slate-500">
                    <Link to={'/join'} className='text-base'>아직 회원이 아니신가요? <span className="text-blue-500 font-bold">회원가입하기</span></Link>
                </div>
            </div>
        </>
    );
};
