import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
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
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

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

    // Real-time suspension enforcement (company users only)
    if (user?.role !== 'SUPER_ADMIN' && user?.company?.id) {
      socketInstance.on('company:suspended', ({ companyId }) => {
        if (companyId === user.company.id) {
          navigate('/account-suspended', { replace: true });
        }
      });

      socketInstance.on('company:reactivated', async ({ companyId }) => {
        if (companyId === user.company.id) {
          try {
            await refreshUser();
            navigate('/dashboard', { replace: true });
          } catch {
            // If refresh fails the user will need to log in again
            navigate('/login', { replace: true });
          }
        }
      });
    }

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user?.company?.id, user?.role]);

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
