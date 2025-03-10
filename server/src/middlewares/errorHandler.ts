import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * 自定义错误类
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 默认错误状态码和消息
  let statusCode = 500;
  let message = '服务器内部错误';
  let isOperational = false;
  
  // 如果是自定义AppError，使用其状态码和消息
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    // 处理Mongoose验证错误
    statusCode = 400;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'CastError') {
    // 处理Mongoose类型转换错误
    statusCode = 400;
    message = '无效的ID格式';
    isOperational = true;
  } else if (err.name === 'JsonWebTokenError') {
    // 处理JWT错误
    statusCode = 401;
    message = '无效的令牌';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    // 处理JWT过期错误
    statusCode = 401;
    message = '令牌已过期';
    isOperational = true;
  }
  
  // 记录错误日志
  if (isOperational) {
    logger.warn(`操作错误: ${message}`, { statusCode, path: req.path });
  } else {
    logger.error(`系统错误: ${err.message}`, err);
  }
  
  // 开发环境下返回详细错误信息
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && !isOperational && { stack: err.stack }),
  });
}; 