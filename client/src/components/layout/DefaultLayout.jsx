import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';

import useAuthStore from '../../store/useAuthStore';
import { DefaultFooter } from './DefaultFooter';


export const DefaultLayout = () => {

    return (
        <div className="layout Default">
            <div className={`flex justify-center min-h-screen bg-gray-100`}>
                <div className="flex flex-col min-h-screen justify-center max-w-md w-full bg-white shadow-lg ">
                    <main className={`w-full p-4 overflow-hidden content-center`}>
                        <Outlet />
                    </main>
                    <DefaultFooter />
                </div>
            </div>
        </div>
    )
}
