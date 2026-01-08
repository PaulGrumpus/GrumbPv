import { Socket, Server } from 'socket.io';
import { notifications } from '@prisma/client';

let ioInstance: Server | null = null;

export const emitNotification = (userId: string, notification: notifications) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit('newNotification', notification);
};

export const notification_socket_route = (socket: Socket, io: Server) => {
  ioInstance = io;
  socket.on('joinUserRoom', (userId: string) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
  });
};
