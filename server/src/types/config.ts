/**
 * 应用配置接口
 */
export interface AppConfig {
  // 服务器端口
  port: number;
  
  // MongoDB配置
  mongodb: {
    uri: string;
  };
  
  // 是否使用模拟数据
  useMockData: boolean;
  
  // 阿里云通义万相API配置
  aliyun: {
    apiKey: string;
    baseUrl: string;
  };
  
  // 阿里云QWQ模型配置
  qwq: {
    apiKey: string;
    baseUrl: string;
  };
}

/**
 * 环境变量验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
} 