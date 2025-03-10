import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { validateEnv, printEnvStatus } from './utils/envValidator';
import imageRoutes from './routes/imageRoutes';
import { errorHandler, AppError } from './middlewares';
import logger from './utils/logger';

// 验证环境变量
const envValidation = validateEnv();
printEnvStatus();

// 如果有缺失的必要环境变量，输出警告但继续运行
if (!envValidation.isValid) {
  logger.warn('警告: 缺少必要的环境变量:', envValidation.missingVars);
  logger.warn('应用可能无法正常工作，请检查.env文件');
}

// 如果有警告信息，输出警告
if (envValidation.warnings.length > 0) {
  logger.warn('环境变量警告:');
  envValidation.warnings.forEach(warning => logger.warn(`- ${warning}`));
}

// 强制使用真实API模式
if (config.useMockData) {
  logger.info('注意: 虽然USE_MOCK_DATA=true，但系统将强制使用真实API');
}

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/images', imageRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// 处理404错误
app.use((req, res, next) => {
  next(new AppError(`找不到路径: ${req.originalUrl}`, 404));
});

// 全局错误处理中间件
app.use(errorHandler);

// 连接MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    logger.info('MongoDB连接成功');
  })
  .catch(err => {
    logger.error('MongoDB连接失败:', err);
  });

// 启动服务器
app.listen(config.port, () => {
  logger.info(`服务器运行在端口 ${config.port}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 给进程一些时间来处理剩余的请求，然后退出
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 将未处理的Promise拒绝转换为未捕获的异常
  throw reason;
}); 
