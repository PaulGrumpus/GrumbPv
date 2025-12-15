'use client';

import React, { useState, useEffect, ReactNode, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { websocket } from "@/config/config";

export interface SocketInterface {
    socket: Socket | null;
    isConnected: boolean;
}

export const SocketCtx = React.createContext<SocketInterface>({
    socket: null,
    isConnected: false,
});

type Props = {
    children: ReactNode;
}
const SocketContextProvider = ({ children }: Props) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Only connect if WEBSOCKET_URI is defined
        if (!websocket.WEBSOCKET_URI) {
            console.warn('WebSocket URI is not defined');
            return;
        }

        // Initialize socket with connection options
        const newSocket: Socket = io(websocket.WEBSOCKET_URI, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = newSocket;

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Socket reconnection attempt:', attemptNumber);
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('Socket reconnection error:', error);
        });

        newSocket.on('reconnect_failed', () => {
            console.error('Socket reconnection failed after all attempts');
        });

        setSocket(newSocket);

        // Cleanup function
        return () => {
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setSocket(null);
            setIsConnected(false);
        };
    }, []);

    return (
        <SocketCtx.Provider value={{ socket, isConnected }}>
            {children}
        </SocketCtx.Provider>
    );
};

export default SocketContextProvider;