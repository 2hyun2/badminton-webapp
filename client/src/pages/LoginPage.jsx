import React from 'react'
import { Link } from 'react-router-dom'

export const LoginPage = () => {
  return (
    <div className="flex flex-col px-6 py-12 space-y-8">
      {/* 상단 타이틀 */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-800">환영합니다!</h2>
        <p className="text-slate-500 mt-2">배드민턴 매니저에 로그인하세요</p>
      </div>

      {/* 입력 폼 영역 */}
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600 ml-1">아이디</label>
          <input 
            type="text" 
            placeholder="example@badminton.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600 ml-1">비밀번호</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col gap-3">
        {/* 로그인 버튼 (실제로는 submit 용 button 추천) */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-[0.98]">
          로그인
        </button>

        {/* Link를 버튼처럼 꾸미기 (회원가입 이동) */}
        <Link 
          to="/join" 
          className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl text-center hover:bg-slate-50 transition-all"
        >
          회원가입
        </Link>
      </div>

      {/* 하단 링크 */}
      <div className="flex justify-center gap-4 text-sm text-slate-400">
        <button className="hover:text-blue-500">아이디 찾기</button>
        <span className="text-slate-200">|</span>
        <button className="hover:text-blue-500">비밀번호 찾기</button>
      </div>
    </div>
  )
}