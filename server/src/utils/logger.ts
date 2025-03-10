import fs from 'fs';
import path from 'path';
import util from 'util';
import { maskSensitiveValue } from './envValidator';

// 日志级别
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// 日志配置
interface LoggerConfig {
  logDir: string;
  consoleOutput: boolean;
  fileOutput: boolean;
  logLevel: LogLevel;
  maxLogSize: number; // 单位：字节
}

// 默认配置
const defaultConfig: LoggerConfig = {
  logDir: path.join(__dirname, '../../../logs'),
  consoleOutput: true,
  fileOutput: true,
  logLevel: LogLevel.INFO,
  maxLogSize: 10 * 1024 * 1024 // 10MB
};

// 当前配置
let currentConfig: LoggerConfig = { ...defaultConfig };

// 创建日志目录
function ensureLogDir(): void {
  if (!fs.existsSync(currentConfig.logDir)) {
    try {
      fs.mkdirSync(currentConfig.logDir, { recursive: true });
    } catch (error) {
      console.error('创建日志目录失败:', error);
    }
  }
}

// 日志文件路径
function getLogFilePath(type: string): string {
  return path.join(currentConfig.logDir, `${type}.log`);
}

// 日志轮换
function rotateLogIfNeeded(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > currentConfig.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const newPath = `${filePath}.${timestamp}`;
        fs.renameSync(filePath, newPath);
      }
    }
  } catch (error) {
    console.error('日志轮换失败:', error);
  }
}

// 格式化数据
function formatData(data: any): string {
  if (!data) return '';
  
  if (typeof data === 'string') return data;
  
  try {
    // 处理敏感信息
    const sanitizedData = JSON.parse(JSON.stringify(data));
    
    // 屏蔽API密钥
    if (sanitizedData.headers && sanitizedData.headers.Authorization) {
      sanitizedData.headers.Authorization = maskSensitiveValue(sanitizedData.headers.Authorization);
    }
    
    if (sanitizedData.apiKey) {
      sanitizedData.apiKey = maskSensitiveValue(sanitizedData.apiKey);
    }
    
    return JSON.stringify(sanitizedData, null, 2);
  } catch (error) {
    return util.inspect(data, { depth: null, colors: false });
  }
}

// 写入日志文件
function writeToFile(filePath: string, message: string): void {
  if (!currentConfig.fileOutput) return;
  
  try {
    ensureLogDir();
    rotateLogIfNeeded(filePath);
    fs.appendFileSync(filePath, message + '\n');
  } catch (error) {
    console.error('写入日志文件失败:', error);
  }
}

// 日志记录函数
function log(level: LogLevel, message: string, data?: any, category: string = 'app'): void {
  // 检查日志级别
  const levels = Object.values(LogLevel);
  const currentLevelIndex = levels.indexOf(currentConfig.logLevel);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex < currentLevelIndex) return;
  
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${level}: ${message}`;
  
  // 控制台输出
  if (currentConfig.consoleOutput) {
    if (level === LogLevel.ERROR) {
      console.error(formattedMessage);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
    
    if (data) {
      const dataString = formatData(data);
      const truncatedData = dataString.length > 1000 
        ? dataString.substring(0, 1000) + '...(截断)' 
        : dataString;
      
      if (level === LogLevel.ERROR) {
        console.error(truncatedData);
      } else {
        console.log(truncatedData);
      }
    }
  }
  
  // 文件输出
  if (currentConfig.fileOutput) {
    let fileContent = formattedMessage;
    
    if (data) {
      const dataString = formatData(data);
      fileContent += `\n数据: ${dataString}`;
    }
    
    fileContent += '\n-----------------------------------\n';
    
    // 写入分类日志文件
    writeToFile(getLogFilePath(category), fileContent);
    
    // 同时写入按级别分类的日志文件
    writeToFile(getLogFilePath(level.toLowerCase()), fileContent);
  }
}

// 导出日志函数
export const logger = {
  debug: (message: string, data?: any, category: string = 'app') => 
    log(LogLevel.DEBUG, message, data, category),
  
  info: (message: string, data?: any, category: string = 'app') => 
    log(LogLevel.INFO, message, data, category),
  
  warn: (message: string, data?: any, category: string = 'app') => 
    log(LogLevel.WARN, message, data, category),
  
  error: (message: string, error?: any, category: string = 'app') => {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    log(LogLevel.ERROR, message, errorDetails, category);
  },
  
  api: (message: string, data?: any) => 
    log(LogLevel.INFO, message, data, 'api_calls'),
  
  apiError: (message: string, error?: any) => 
    log(LogLevel.ERROR, message, error, 'api_calls'),
  
  // 配置日志系统
  configure: (config: Partial<LoggerConfig>) => {
    currentConfig = { ...currentConfig, ...config };
    ensureLogDir();
    logger.info('日志系统配置已更新', { config: currentConfig }, 'system');
  },
  
  // 获取当前配置
  getConfig: (): LoggerConfig => ({ ...currentConfig })
};

// 初始化日志目录
ensureLogDir();

// 导出默认实例
export default logger; 