const API_URL = 'http://localhost:5001/api';

// 图像生成请求接口
interface GenerateImageRequest {
  prompt: string;
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
 * 生成图像
 * @param data 图像生成请求数据
 * @returns 生成的图像数据
 */
export const generateImage = async (data: GenerateImageRequest): Promise<GenerateImageResponse> => {
  try {
    const response = await fetch(`${API_URL}/images`, {
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
    return {
      success: false,
      message: '图像生成请求失败',
      error: (error as Error).message,
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