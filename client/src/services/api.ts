const API_URL = 'http://localhost:5001/api';

// 可选配置项
const API_CONFIG = {
  retryCount: 1,  // 失败重试次数
  retryDelay: 1000, // 重试间隔(毫秒)
  timeout: 30000,   // 超时时间(毫秒)
  useMockData: true, // 是否使用模拟数据（当后端不可用时）
};

// 模拟数据 - 当后端不可用时使用
const MOCK_DATA = {
  images: [
    'https://picsum.photos/seed/img1/512/512',
    'https://picsum.photos/seed/img2/512/512',
    'https://picsum.photos/seed/img3/512/512',
    'https://picsum.photos/seed/img4/512/512'
  ]
};

// 图像生成请求接口
export interface GenerateImageRequest {
  prompt: string;
  referenceImages?: string[];
  count?: number;
  width?: number;
  height?: number;
  referencedGeneratedImages?: string[];
  userId?: string;
  boardName?: string;
}

// 图像生成响应接口
interface GenerateImageResponse {
  success: boolean;
  data?: {
    id: string;
    prompt: string;
    optimizedPrompt: string;
    images: string[];
    boardName: string;
  };
  message?: string;
  error?: string;
}

/**
 * 增强的fetch请求，支持超时和重试
 */
async function enhancedFetch(url: string, options: RequestInit, retries = API_CONFIG.retryCount): Promise<Response> {
  try {
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const fetchOptions = {
      ...options,
      signal: controller.signal
    };
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP错误 ${response.status}: ${errorText || response.statusText}`);
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      // 检查是否因超时而中止
      if (error.name === 'AbortError') {
        throw new Error(`请求超时（${API_CONFIG.timeout / 1000}秒）`);
      }
      
      // 如果还有重试次数则重试
      if (retries > 0) {
        console.log(`请求失败，${API_CONFIG.retryDelay / 1000}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
        return enhancedFetch(url, options, retries - 1);
      }
    }
    
    throw error;
  }
}

/**
 * 使用模拟数据生成响应
 */
function generateMockResponse(prompt: string): GenerateImageResponse {
  console.log('使用模拟数据生成响应:', prompt);
  // 生成随机ID和标题
  const id = Math.random().toString(36).substring(2, 15);
  const boardName = prompt.split(' ').slice(0, 2).join(' ').toUpperCase();
  
  // 添加时间戳使URL唯一，避免浏览器缓存
  const timestamp = Date.now();
  const mockImages = MOCK_DATA.images.map(url => 
    url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`
  );
  
  return {
    success: true,
    data: {
      id,
      prompt,
      optimizedPrompt: `优化后的提示词: ${prompt}`,
      images: mockImages,
      boardName
    }
  };
}

/**
 * 生成图像
 * @param data 图像生成请求数据
 * @returns 生成的图像数据
 */
export const generateImage = async (data: GenerateImageRequest): Promise<GenerateImageResponse> => {
  try {
    // 检查是否使用模拟数据
    if (API_CONFIG.useMockData) {
      console.log('使用模拟数据模式...');
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateMockResponse(data.prompt);
    }
    
    console.log(`正在向 ${API_URL}/images 发送生成请求...`);
    
    const response = await enhancedFetch(`${API_URL}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('图像生成请求失败:', error);
    
    // 如果配置为使用模拟数据作为后备方案，则在API调用失败时返回模拟数据
    if (API_CONFIG.useMockData) {
      console.log('API调用失败，切换到模拟数据...');
      return generateMockResponse(data.prompt);
    }
    
    // 提供更详细的错误信息
    let errorMessage = '图像生成请求失败';
    let errorDetails = '';
    
    if (error instanceof Error) {
      errorDetails = error.message;
      
      // 检查常见的网络错误模式
      if (error.message.includes('Failed to fetch')) {
        errorDetails = '无法连接到服务器，请确保后端服务正在运行 (http://localhost:5001)';
      } else if (error.message.includes('NetworkError')) {
        errorDetails = '网络错误，请检查您的互联网连接';
      } else if (error.message.includes('CORS')) {
        errorDetails = '跨域请求错误，请检查服务器CORS配置';
      }
    }
    
    return {
      success: false,
      message: errorMessage,
      error: errorDetails,
    };
  }
};

/**
 * 获取用户的所有图像
 * @param userId 用户ID
 * @returns 用户的图像列表
 */
export const getUserImages = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/images/user/${userId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('获取用户图像失败:', error);
    return {
      success: false,
      message: '获取用户图像失败',
      error: (error as Error).message,
    };
  }
};

/**
 * 获取单个图像
 * @param imageId 图像ID
 * @returns 图像数据
 */
export const getImage = async (imageId: string) => {
  try {
    const response = await fetch(`${API_URL}/images/${imageId}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('获取图像失败:', error);
    return {
      success: false,
      message: '获取图像失败',
      error: (error as Error).message,
    };
  }
}; 