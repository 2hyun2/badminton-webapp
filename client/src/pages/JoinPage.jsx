import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { Button } from '../components/common/Button';
import { useNavigate, Link } from 'react-router-dom';

export const JoinPage = () => {
    const navigate = useNavigate();
    const goNavigate = () => navigate('/login');
    // 회원가입 입력값 state
    const [username, setUsername] = useState(''); // string
    const [password, setPassword] = useState(''); // string
    const [birthday, setBirthday] = useState(''); // string
    const [name, setName] = useState(''); // string
    const [gender, setGender] = useState(''); // string && input[type="radio"]

    // 상태 변화 state
    const [isIdChecked, setIsIdChecked] = useState(false); // 아이디 중복 체크: boolean
    const [checkedUsername, setCheckedUsername] = useState(''); // 중복체크 통과: boolean

    // zustand - 아이디 중복체크 로직, 회원 가입 진행 로직, 로딩중
    const { checkId, registerUser, isLoading } = useAuthStore();

    // 아이디 입력값 && 중복체크 => username
    const handleIdChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        // 아이디 입력값과, 중복체크한 아이디가 같은지 체크
        if (value !== checkedUsername) {
            setIsIdChecked(false);
        }
    };
    // 아이디 중복체크 버튼 => 중복 체크 로직
    const handleCheckIdClick = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            alert('아이디를 입력해 주세요.');
            return;
        }

        const result = await checkId(username);
        // result.isAvailable = boolean
        if (result.isAvailable) {
            alert(result.message);
            setIsIdChecked(true);
            setCheckedUsername(username);
            goNavigate()
        } else {
            alert(result.message);
            setIsIdChecked(false);
        }
    };
    // 요청 전 최종 체크
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password || !birthday || !name || !gender) {
            alert('모든 항목을 입력해 주세요.');
            return;
        }

        if (!isIdChecked || username !== checkedUsername) {
            alert('아이디 중복 확인을 먼저 진행해 주세요.');
            return;
        }

        const userData = { username, password, birthday, name, gender };
        const result = await registerUser(userData);

        if (result.success) {
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    return (
        <>
            <div className="space-y-4">

                <h2 className="text-xl font-bold text-slate-800 text-center">회원가입</h2>
                {/* 회원가입 폼 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label-default" htmlFor='userName'>아이디</label>
                        <div className="flex gap-2">
                            <input
                                type="text" className="input-default" value={username} id='userName'
                                onChange={handleIdChange} placeholder="아이디 입력" required
                            />
                            <Button
                                onClick={handleCheckIdClick} disabled={isIdChecked || isLoading}
                                variant={isIdChecked ? "gray" : "blue"} size="sm"
                            >
                                {isIdChecked ? '확인 완료' : '중복 확인'}
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="label-default" htmlFor='userPassword'>비밀번호</label>
                        <input
                            type="password" className="input-default" value={password} id='userPassword'
                            onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" required
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className='flex-1'>
                            <label className="label-default" htmlFor='userBirthday'>생년월일</label>
                            <input
                                type="text" val className="input-default"ue={birthday} id='userBirthday' maxLength={6}
                                onChange={(e) => setBirthday(e.target.value)} placeholder="생년월일 ex: 970208" required
                            />
                        </div>
                        <div className='flex-1'>
                            <label className="label-default" htmlFor='userName'>이름</label>
                            <input
                                type="text" className="input-default" value={name} id='userName'
                                onChange={(e) => setName(e.target.value)} placeholder="이름" required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label-default">성별</label>
                        <div className="flex gap-4 mt-2">
                            <label className="label-radio">
                                <input
                                    type="radio" className="input-radio" name="gender"
                                    value="남성" checked={gender === '남성'} onChange={(e) => setGender(e.target.value)}
                                />
                                남성
                            </label>
                            <label className="label-radio">
                                <input
                                    type="radio" className="input-radio" name="gender"
                                    value="여성" checked={gender === '여성'} onChange={(e) => setGender(e.target.value)}
                                />
                                여성
                            </label>
                        </div>
                    </div>

                    {/* 회원 가입 버튼 */}
                    <Button
                        type='submit' disabled={isLoading} variant='blue' size='md'
                    >
                        {isLoading ? '회원가입 중...' : '회원가입'}    
                    </Button>
                </form>

                {/* etc */}
                <div className="mt-4 text-center text-xs text-slate-500">
                    
                    <Link to={'/login'} className='text-base'>이미 계정이 있으신가요?  <span className="text-blue-500 font-bold">로그인하기</span></Link>
                </div>
            </div>
        </>
    );
};