const app = require('./app');
const prisma = require('./config/database');

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Run Prisma introspection/check internally?
const startServer = async () => {
  try {
    // Optionally connect to prisma to ensure DB connection is working on startup
    await prisma.$connect();
    console.log('Database connected successfully.');

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Graceful shutdown on SIGTERM
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...', err);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing server gracefully...');
      server.close(() => {
         console.log('Process terminated.');
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// trigger nodemon restart