import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Get backend URL from environment or use window.location.origin for dev
const getBackendUrl = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl) {
    return socketUrl;
  }
  // For development, use window.location.origin
  return window.location.origin;
};

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    const backendUrl = getBackendUrl();
    const socketInstance = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      // Join company room if company user
      if (user?.company?.id) {
        socketInstance.emit('join:company', user.company.id);
      }
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user?.company?.id]);

  const subscribe = (event, callback) => {
    if (!socket) return () => {};
    socket.on(event, callback);
    return () => socket.off(event, callback);
  };

  return (
    <SocketContext.Provider value={{ socket, connected, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
