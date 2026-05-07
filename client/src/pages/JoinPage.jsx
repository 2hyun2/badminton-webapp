import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore'; // 스토어 경로를 프로젝트에 맞게 조절해 주세요!

export const JoinPage = ({ onClose, onSwitchToLogin }) => {
  // 📋 폼 입력값 상태 관리
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');

  // 🔒 아이디 중복 확인 여부 검증용 상태
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [checkedUsername, setCheckedUsername] = useState('');

  // ⚡ Zustand 스토어에서 필요한 함수와 로딩 상태 꺼내기
  const { checkId, registerUser, isLoading } = useAuthStore();

  // 1️⃣ 아이디 입력창이 바뀔 때 처리 (중복 확인 리셋)
  const handleIdChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    
    // 중복 확인을 통과한 아이디와 현재 입력된 아이디가 다르면 다시 중복 확인 하도록 락(Lock)을  겁니다.
    if (value !== checkedUsername) {
      setIsIdChecked(false);
    }
  };

  // 2️⃣ [중복 확인] 버튼 클릭 시
  const handleCheckIdClick = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('아이디를 입력해 주세요.');
      return;
    }

    const result = await checkId(username);
    if (result.isAvailable) {
      alert(result.message);
      setIsIdChecked(true);
      setCheckedUsername(username); // 통과한 아이디 저장
    } else {
      alert(result.message);
      setIsIdChecked(false);
    }
  };

  // 3️⃣ [가입 완료] 버튼 클릭 시 (최종 제출)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 빈 칸 검증
    if (!username || !password || !name || !gender) {
      alert('모든 항목을 입력해 주세요.');
      return;
    }

    // 중복 확인 절차를 밟았는지 최종 검증
    if (!isIdChecked || username !== checkedUsername) {
      alert('아이디 중복 확인을 먼저 진행해 주세요.');
      return;
    }

    // 서버로 보낼 데이터 바구니 조립
    const userData = { username, password, name, gender };

    // Zustand 스토어의 가입 함수 호출
    const result = await registerUser(userData);

    if (result.success) {
      alert(result.message); // "회원가입이 완료되었습니다!"
      if (onSwitchToLogin) onSwitchToLogin(); // 가입 성공 후 로그인 화면으로 전환
    } else {
      alert(result.message);
    }
  };

  return (
    <>
    {/* <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"> */}
      {/* 회원가입 카드 본체 */}
      <div className="flex flex-col align-center px-6 py-12 space-y-8">
        
        {/* 상단 타이틀 및 닫기 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">🏸 클럽 회원가입</h2>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 아이디 입력 영역 */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">아이디</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={handleIdChange}
                placeholder="아이디 입력"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={handleCheckIdClick}
                disabled={isIdChecked || isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isIdChecked
                    ? 'bg-emerald-100 text-emerald-700 cursor-default'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isIdChecked ? '확인 완료' : '중복 확인'}
              </button>
            </div>
          </div>

          {/* 비밀번호 입력 영역 */}
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

          {/* 이름(닉네임) 입력 영역 */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">이름 / 닉네임</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="실명 또는 전광판 표시 닉네임"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* 성별 선택 영역 (남/여 라디오 버튼) */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">성별 (매칭 필수 항목)</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="남성"
                  checked={gender === '남성'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                남성
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="여성"
                  checked={gender === '여성'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                여성
              </label>
            </div>
          </div>

          {/* 최종 회원가입 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 active:bg-emerald-700 transition-colors disabled:bg-slate-300"
          >
            {isLoading ? '처리 중...' : '코트 입장하기 (가입 완료)'}
          </button>
        </form>

        {/* 하단 로그인 이동 가이드 */}
        <div className="mt-4 text-center text-xs text-slate-500">
          이미 계정이 있으신가요?{' '}
          <button 
            onClick={onSwitchToLogin} 
            className="text-emerald-600 font-semibold hover:underline"
          >
            로그인하기
          </button>
        </div>
      </div>
    </>
  );
};