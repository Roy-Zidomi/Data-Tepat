require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/error.middleware');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Built-in Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// Routes
app.use('/api/v1', routes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;