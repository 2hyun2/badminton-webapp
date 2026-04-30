import React, { useState, useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom';
import { Button } from '../common/Button';
import useMatchStore from "../../store/useMatchStore"; // 스토어 경로 확인!
import { ModalMatchCreate } from '../modal/ModalMatchCreate';



export const DefaultLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const [isLogin, setIsLogin] = useState(false)
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  const {
    startMatch,
    userList,
    getWaitingList,
    getWaitingCategory,
    fetchUsers,
  } = useMatchStore();

  const waitingList = getWaitingList();
  const waitingCategory = getWaitingCategory();

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStartMatch = async (selectedIds) => {
    const success = await startMatch(selectedIds);
    if (success) {
      alert("매칭 정보가 서버에 기록되었습니다!");
      setIsMatchModalOpen(false);
    } else {
      alert("서버 통신 오류가 발생했거나 인원이 부족합니다.");
    }
  };

  return (
    <div className="layout default">
      <div className="min-h-screen h-full flex justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white shadow-lg">
          <header className="relative flex justify-between items-center text-xl text-white font-bold bg-blue-600 py-2 px-4">
            <Link to={"/"}><h1>🏸 매니저</h1></Link>
            {/* <Button onClick={() => setIsMatchModalOpen(true)}>매칭 짜기</Button> */}
            <Button onClick={() => setIsMatchModalOpen(true)}>매칭 짜기</Button>
            <button onClick={() => toggleMenu()}
              className="p-1 focus:outline-none hover:bg-blue-700 rounded-md transition-colors">
              {isMenuOpen
                ? <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }

            </button>
            <div className={`
                absolute top-full left-0 w-full bg-blue-600 text-white shadow-xl z-10 overflow-hidden transition-all duration-300 ease-in-out
                ${isMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}
              `}>
              <nav className="flex flex-col border-t border-blue-500">
                <Link to={'/'} onClick={() => closeMenu()} className='text-right border-b py-2 px-4 transition-colors hover:text-blue-200'>Home</Link>
                {isLogin
                  ? <Link to={'/logOut'} onClick={() => closeMenu()} className='text-right border-b py-2 px-4 transition-colors hover:text-blue-200'>LogOut</Link>
                  : <Link to={'/login'} onClick={() => closeMenu()} className='text-right border-b py-2 px-4 transition-colors hover:text-blue-200'>Login</Link>
                }
                <Link to={'/record'} onClick={() => closeMenu()} className='text-right border-b py-2 px-4 transition-colors hover:text-blue-200'>Records</Link>
                <Link to={'/ranking'} onClick={() => closeMenu()} className='text-right border-b py-2 px-4 transition-colors hover:text-blue-200'>Rankings</Link>
              </nav>

            </div>
          </header>


          <main>
            <Outlet />
          </main>

          <footer>
            @ 2026 badminton side project by hyun
          </footer>

          {isMatchModalOpen && (
            <ModalMatchCreate
              userList={userList}
              waitingCategory={waitingCategory}
              onClose={() => setIsMatchModalOpen(false)}
              onMatchStart={handleStartMatch}
            />
          )}

        </div>
      </div>
    </div>
  )
}
