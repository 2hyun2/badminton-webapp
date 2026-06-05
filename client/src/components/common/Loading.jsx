import React from 'react';

const loadingType = {
    loading: {
        gradient: 'linear-gradient(to right, #0051ff, #07daff)',
        textColor: 'text-blue-600'
    },
    error: {
        gradient: 'linear-gradient(to right, #ff3333, #ff8585)',
        textColor: 'text-red-500'
    }
};

export const Loading = ({ message = "로딩 중입니다.", type = 'loading' }) => {
    const currentStyle = loadingType[type] || loadingType.loading;

    return (
        <div className="relative flex justify-center items-center w-full h-full">
            <div className="w-[10rem] aspect-square rounded-full p-1 animate-[spin_1.5s_ease-in-out_infinite]" style={{ background: currentStyle.gradient }}></div>
            <div className={`absolute flex items-center justify-center w-[calc(10rem-0.5rem)] aspect-square text-sm font-bold text-center bg-white rounded-full p-1 break-keep whitespace-normal text-wrap ${currentStyle.textColor}`}>{message}</div>
        </div>
    );
};