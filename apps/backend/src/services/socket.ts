import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export const setupSocketHandlers = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Auth error'));
    try {
      (socket as any).user = jwt.verify(token, process.env.JWT_SECRET!);
      next();
    } catch { next(new Error('Auth error')); }
  });
  
  io.on('connection', (socket) => {
    const user = (socket as any).user;
    socket.join(`company:${user.companyId}`);
    socket.join(`user:${user.id}`);
    console.log(`User connected: ${user.id}`);
  });
};
