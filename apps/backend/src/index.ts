// src/server.ts (Adapté à votre architecture existante)

import express, { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Routes existantes
import authRoutes from './controllers/auth.controller';
import articleRoutes from './controllers/articles.controller';
import clientRoutes from './controllers/clients.controller';
import invoiceRoutes from './controllers/invoices.controller';
import stockRoutes from './controllers/stock.controller';
import userRoutes from './controllers/users.controller';
import dashboardRoutes from './controllers/dashboard.controller';
import partnerRoutes from './controllers/partner.controller';

// Nouvelles routes
import supplierRoutes from './controllers/suppliers.controller';
import categoryRoutes from './controllers/categories.controller';
import documentRoutes from './controllers/documents.controller';
import companyRoutes from './routes/companies.routes';
import messageRoutes from './routes/message.routes';
import subscriptionRoutes from './routes/subscription.routes';

// Services
import { setupSocketHandlers } from './services/socket';
import { startCronJobs } from './cron';

// Middleware
import { errorHandler, notFound } from './middleware/error.middleware';

dotenv.config();

// ============================================================================
// INITIALIZE
// ============================================================================

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    // ? ['query', 'info', 'warn', 'error'] 
    ? ['error'] 
    : ['error'],
});

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// ROUTES - Existantes
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
// app.use('/api/clients', clientRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================================================
// ROUTES - Nouvelles
// ============================================================================

app.use('/api/suppliers', supplierRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/messages', messageRoutes);

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Gestion Commerciale API',
    version: '1.0.0',
    status: 'running'
  });
});

// ============================================================================
// SOCKET.IO & CRON JOBS
// ============================================================================

setupSocketHandlers(io);
startCronJobs();

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER START
// ============================================================================

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket enabled on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('\n🔄 Shutting down gracefully...');
  
  try {
    // Close HTTP server
    httpServer.close(() => {
      console.log('✅ HTTP server closed');
    });

    // Close Socket.IO
    io.close(() => {
      console.log('✅ WebSocket server closed');
    });

    // Disconnect Prisma
    await prisma.$disconnect();
    console.log('✅ Database disconnected');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught errors
process.on('unhandledRejection', (reason: any) => {
  console.error('❌ Unhandled Rejection:', reason);
  gracefulShutdown();
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

// Start the server
startServer();

export { io };