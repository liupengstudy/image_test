// 读取.env文件中的环境变量
import dotenv from 'dotenv';
import path from 'path';
import { AppConfig } from './types/config';

// 加载.env文件
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

// 配置对象
export const config: AppConfig = {
  // 服务器端口
  port: Number(process.env.PORT) || 5001,
  
  // MongoDB配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dream_machine'
  },
  
  // 是否使用模拟数据
  useMockData: process.env.USE_MOCK_DATA === 'true',
  
  // 阿里云通义万相API配置
  aliyun: {
    apiKey: process.env.ALIYUN_API_KEY || '',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1'
  },
  
  // 阿里云QWQ模型配置
  qwq: {
    apiKey: process.env.QWQ_API_KEY || '',
    baseUrl: process.env.QWQ_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  }
}; 