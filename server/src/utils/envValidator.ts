/**
 * 环境变量验证工具
 * 用于验证必要的环境变量是否已正确设置
 */
import { ValidationResult } from '../types/config';

/**
 * 验证必要的环境变量
 * @returns 验证结果对象
 */
export function validateEnv(): ValidationResult {
  const requiredVars = [
    'PORT',
    'MONGODB_URI',
    'ALIYUN_API_KEY',
    'QWQ_API_KEY'
  ];
  
  const optionalVars = [
    'USE_MOCK_DATA',
    'QWQ_BASE_URL'
  ];
  
  const missingVars: string[] = [];
  const warnings: string[] = [];
  
  // 检查必要的环境变量
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else if (process.env[varName] === '') {
      warnings.push(`${varName} 已设置但为空值`);
    }
  }
  
  // 检查API密钥格式
  if (process.env.ALIYUN_API_KEY && !process.env.ALIYUN_API_KEY.startsWith('sk-')) {
    warnings.push('ALIYUN_API_KEY 格式可能不正确，应以 sk- 开头');
  }
  
  if (process.env.QWQ_API_KEY && !process.env.QWQ_API_KEY.startsWith('sk-')) {
    warnings.push('QWQ_API_KEY 格式可能不正确，应以 sk- 开头');
  }
  
  // 检查可选环境变量
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      warnings.push(`可选环境变量 ${varName} 未设置，将使用默认值`);
    }
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings
  };
}

/**
 * 屏蔽敏感信息
 * @param value 原始值
 * @returns 屏蔽后的值
 */
export function maskSensitiveValue(value: string): string {
  if (!value) return '';
  if (value.length <= 5) return '*'.repeat(value.length);
  return value.substring(0, 5) + '*'.repeat(Math.min(10, value.length - 5));
}

/**
 * 打印环境变量状态（安全方式）
 */
export function printEnvStatus(): void {
  console.log('-------------------------- 环境变量状态 --------------------------');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('PORT:', process.env.PORT || '5001 (默认)');
  console.log('MONGODB_URI:', maskSensitiveValue(process.env.MONGODB_URI || ''));
  console.log('USE_MOCK_DATA:', process.env.USE_MOCK_DATA || 'false (默认)');
  console.log('ALIYUN_API_KEY:', maskSensitiveValue(process.env.ALIYUN_API_KEY || ''));
  console.log('QWQ_API_KEY:', maskSensitiveValue(process.env.QWQ_API_KEY || ''));
  console.log('QWQ_BASE_URL:', process.env.QWQ_BASE_URL || '(使用默认URL)');
  console.log('-------------------------------------------------------------------');
} 