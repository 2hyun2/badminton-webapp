import React, { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import api from '../../hooks/api';

import { useUsers } from '../../hooks/useUsers';
import useAuthStore from '../../store/useAuthStore';

export const AdminLayout = () => {
    const { user, token } = useAuthStore(); 
    const { me, userList, updateUsers, waitingCategory } = useUsers();

    const navigate = useNavigate();

    useEffect(() => {
        if (me !== null) {
            if (me && me.role !== 'ADMIN') {
                alert("관리자 권한이 없습니다.");
                navigate('/', { replace: true });
            }
        }
    }, [user, token, me, navigate]);

    return (
        <div className='space-y-8'>
        {/* // <div className="layout ADMIN flex content-center justify-center"> */}
            <Outlet />
        {/* </div> */}
        </div>
    )
}
