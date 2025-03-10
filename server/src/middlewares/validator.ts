import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * 验证请求体中的必填字段
 * @param requiredFields 必填字段数组
 */
export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      const message = `缺少必填字段: ${missingFields.join(', ')}`;
      return next(new AppError(message, 400));
    }
    
    next();
  };
};

/**
 * 验证请求参数中的必填字段
 * @param requiredParams 必填参数数组
 */
export const validateParams = (requiredParams: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingParams = requiredParams.filter(param => !req.params[param]);
    
    if (missingParams.length > 0) {
      const message = `缺少必填参数: ${missingParams.join(', ')}`;
      return next(new AppError(message, 400));
    }
    
    next();
  };
};

/**
 * 验证MongoDB ID格式
 * @param paramName 参数名称
 */
export const validateMongoId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!id || !mongoIdRegex.test(id)) {
      return next(new AppError(`无效的${paramName}格式`, 400));
    }
    
    next();
  };
}; 