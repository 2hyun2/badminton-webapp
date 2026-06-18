import { useCallback } from "react";
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket'],
    autoConnect: false,
});

export const useSocket = () => {

    const connectSocket = useCallback((userId: number) => {
        if (!socket.connected && userId) {
            socket.io.opts.query = { userId }; // 기본 쿼리 주입
            socket.auth = { userId }; // 일부 버전 호환용 auth 주입

            socket.connect();
            console.log(`소켓 연결 userId: ${userId}`);
        }
    }, []);

    const disconnectSocket = useCallback(() => {
        if (socket.connected) {
            socket.disconnect();
            console.log('소켓 연결 해제');
        }
    }, []);

    const socketEmit = useCallback((event: string, data: any) => {
        if (socket.connected) {
            socket.emit(event, data);
        } else {
            console.warn('Socket.io가 연결되지 않았습니다:', event, data);
        }
    }, []);

    // useCallback을 적용하여 컴포넌트가 리렌더링되어도 함수 주소값을 유지
    const socketOn = useCallback((event: string, callback: (...args: any[]) => void) => {
        socket.on(event, callback);
    }, []);

    const socketOff = useCallback((event: string, callback: (...args: any[]) => void) => {
        socket.off(event, callback);
    }, []);

    return { connectSocket, disconnectSocket, socketEmit, socketOn, socketOff, socket };
};