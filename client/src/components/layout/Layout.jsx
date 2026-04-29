import React from 'react'
import { Outlet, Link } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="layout default">
        <div className="min-h-screen h-full felx justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white shadow-lg">
                <header className="flex justify-between items-center text-xl text-white font-bold bg-blue-600 py-2 px-4">
                    <h1>🏸 매니저</h1>
                    {/* <Button onClick={() => setIsMatchModalOpen(true)}>매칭 짜기</Button> */}
                </header>

                <main>
                    <Outlet />
                </main>

                <footer>
                    @ 2026 badminton side project by hyun
                </footer>

            </div>
        </div>
    </div>
  )
}
