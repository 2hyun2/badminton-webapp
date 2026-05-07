import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';

export const LoginPage = ({ onClose, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { loginUser, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    const result = await loginUser(username, password);

    if (result.success) {
      alert(result.message);
      onClose();
    } else {
      alert(result.message);
    }
  };

  return (
    <>
      <div className="flex flex-col align-center px-6 py-12 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">🏸 클럽 로그인</h2>
          {/* <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ✕
          </button> */}
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 아이디 입력 */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디 입력"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 active:bg-slate-900 transition-colors disabled:bg-slate-300"
          >
            {isLoading ? '로그인 중...' : '클럽 입장하기'}
          </button>
        </form>

        {/* 하단 회원가입 이동 링크 */}
        <div className="mt-6 text-center text-xs text-slate-500">
          아직 회원이 아니신가요?{' '}
          <button 
            onClick={onSwitchToRegister} 
            className="text-emerald-600 font-semibold hover:underline"
          >
            회원가입하기
          </button>
        </div>

      </div>
    </>
  );
};
