"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        data: err.data || null,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Cannot ${req.method} ${req.originalUrl}`
    });
};
exports.notFoundHandler = notFoundHandler;
