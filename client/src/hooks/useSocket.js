import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket'], 
    autoConnect: true,         
});

export const useSocket = () => {

    const socketEmit = (event, data) => {
        if (socket.connected) {
            socket.emit(event, data);
        } else {
            console.warn('Socket.io가 연결되지 않았습니다:', event, data);
        }
    };

    const socketOn = (event, callback) => {
        socket.on(event, callback);
    };

    const socketOff = (event, callback) => {
        socket.off(event, callback);
    };

    return { socketEmit, socketOn, socketOff, socket };
};