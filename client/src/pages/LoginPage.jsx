import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate ,Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { me, loginUser, isLoading } = useAuthStore();

    const  navigate = useNavigate();

    const goNavigate = () => navigate('/', { replace: true });

    useEffect(() => {
        if (me) {
            goNavigate();
        }
    }, [me]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            alert('아이디와 비밀번호를 입력해 주세요.');
            return;
        }

        const result = await loginUser(username, password);
        if (result.success) {
            result.message !== undefined ? alert(result.message) : null;
            goNavigate();
        } else {
            alert(result.message);
        }
    };

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 text-center">로그인</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label-default">아이디</label>
                        <input
                            type="text" className="input-default" value={username}
                            onChange={(e) => setUsername(e.target.value)} placeholder="아이디 입력" required
                        />
                    </div>
                    <div>
                        <label className="label-default">비밀번호</label>
                        <input
                            type="password" className="input-default" value={password} autoComplete="current-password"
                            onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" required
                        />
                    </div>

                    {/* 로그인 버튼 */}
                    <Button
                        type='submit' disabled={isLoading} variant='blue' size='md'
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </Button>
                </form>

                {/* etc */}
                <div className="mt-4 text-center text-xs text-slate-500">
                    <Link to={'/join'} className='text-base'>아직 회원이 아니신가요? <span className="text-blue-500 font-bold">회원가입하기</span></Link>
                </div>
            </div>
        </>
    );
};
