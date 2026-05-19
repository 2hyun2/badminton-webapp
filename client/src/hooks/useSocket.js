import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

// Socket.io 서버 주소 (서버의 PORT와 동일해야 합니다)
const SOCKET_SERVER_URL = 'http://localhost:5000';

export const useSocket = () => {
    const socketRef = useRef(null);
    const updateActivity = useAuthStore(state => state.updateActivity);

    useEffect(() => {
        // 소켓 연결 초기화
        socketRef.current = io(SOCKET_SERVER_URL, {
            transports: ['websocket'], // polling을 건너뛰고 바로 websocket 사용
            forceNew: true,            // 새로운 연결 강제
        });

        // 연결 성공 시 이벤트
        socketRef.current.on('connect', () => {
            // console.log('Socket.io 서버에 연결되었습니다:', socketRef.current.id);
        });

        // 서버로부터 'world' 이벤트 수신 (서버 예시 코드에 맞춰)
        socketRef.current.on('any_event_from_server', (message) => {
            // console.log('서버로부터 "world" 메시지 수신:', message);
            updateActivity(); // 서버에서 데이터가 올 때도 활동으로 간주
            alert(`서버 메시지: ${message}`); // 클라이언트에게 알림
        });

        // 연결 해제 시 이벤트
        socketRef.current.on('disconnect', () => {
            // console.log('Socket.io 서버와 연결이 해제되었습니다.');
        });

        // 연결 에러 발생 시 이벤트
        socketRef.current.on('connect_error', (err) => {
            // console.error('Socket.io 연결 에러:', err.message);
        });

        // 컴포넌트 언마운트 시 소켓 연결 해제
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []); // 컴포넌트 마운트 시 한 번만 실행

    // 이벤트를 서버로 보내는 함수
    const emit = (event, data) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('Socket.io가 연결되지 않아 이벤트를 보낼 수 없습니다:', event, data);
        }
    };

    // 서버로부터 이벤트를 수신하는 함수
    const on = (event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    };

    // 이벤트 리스너를 제거하는 함수
    const off = (event, callback) => {
        if (socketRef.current) {
            socketRef.current.off(event, callback);
        }
    };

    return { emit, on, off, socket: socketRef.current };
};