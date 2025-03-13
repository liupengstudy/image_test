const API_URL = 'http://localhost:5001/api';

// 可选配置项
const API_CONFIG = {
  retryCount: 1,  // 失败重试次数
  retryDelay: 1000, // 重试间隔(毫秒)
  timeout: 30000,   // 超时时间(毫秒)
  useMockData: false, // 是否使用模拟数据（当后端不可用时）
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
  aspectRatio?: string; // 添加宽高比参数
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

// 头脑风暴类别接口
export interface BrainstormCategory {
  id: string;
  name: string;
  displayName: string;
}

// 创意提示接口
export interface CreativePrompt {
  description: string;
  previewPrompt?: string;
  image?: string; // 预览图片URL，如果有的话
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
function generateMockResponse(request: GenerateImageRequest): GenerateImageResponse {
  console.log('使用模拟数据生成响应:', request.prompt, '宽高比:', request.aspectRatio);
  // 生成随机ID和标题
  const id = Math.random().toString(36).substring(2, 15);
  const boardName = request.prompt.split(' ').slice(0, 2).join(' ').toUpperCase();
  
  // 添加时间戳使URL唯一，避免浏览器缓存
  const timestamp = Date.now();
  const mockImages = MOCK_DATA.images.map(url => 
    url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`
  );
  
  return {
    success: true,
    data: {
      id,
      prompt: request.prompt,
      optimizedPrompt: `优化后的提示词: ${request.prompt} (宽高比: ${request.aspectRatio || '默认'})`,
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
  // 定义超时时间常量
  const customTimeout = 60000; // 60秒
  
  try {
    // 检查是否使用模拟数据
    if (API_CONFIG.useMockData) {
      console.log('使用模拟数据模式...');
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateMockResponse(data);
    }
    
    console.log(`正在向 ${API_URL}/images 发送生成请求...`, data);
    
    // 克隆请求数据以确保参数正确
    const requestData = {
      prompt: data.prompt,
      aspectRatio: data.aspectRatio || '1:1', // 确保有默认值
      userId: data.userId,
      boardName: data.boardName
    };
    
    console.log('请求参数:', JSON.stringify(requestData));
    
    // 使用更长的超时时间
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), customTimeout);
    
    const response = await fetch(`${API_URL}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP错误 ${response.status}:`, errorText);
      throw new Error(`HTTP错误 ${response.status}: ${errorText || response.statusText}`);
    }

    const result = await response.json();
    console.log('API响应:', result);
    return result;
  } catch (error) {
    console.error('图像生成请求失败:', error);
    
    // 如果配置为使用模拟数据作为后备方案，则在API调用失败时返回模拟数据
    if (API_CONFIG.useMockData) {
      console.log('API调用失败，切换到模拟数据...');
      return generateMockResponse(data);
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
      } else if (error.name === 'AbortError') {
        errorDetails = `请求超时 (${customTimeout/1000}秒)，服务器响应时间过长`;
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

/**
 * 获取所有头脑风暴类别
 * @returns 头脑风暴类别列表
 */
export const getBrainstormCategories = async (): Promise<BrainstormCategory[]> => {
  try {
    if (API_CONFIG.useMockData) {
      // 模拟数据
      return [
        { id: 'landscapes', name: 'landscapes', displayName: '风景' },
        { id: 'characters', name: 'characters', displayName: '人物' },
        { id: 'abstract', name: 'abstract', displayName: '抽象' },
        { id: 'animals', name: 'animals', displayName: '动物' },
        { id: 'fantasy', name: 'fantasy', displayName: '奇幻' },
        { id: 'scifi', name: 'scifi', displayName: '科幻' }
      ];
    }
    
    const response = await enhancedFetch(`${API_URL}/brainstorm/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('获取头脑风暴类别失败:', error);
    
    // 如果API调用失败，返回模拟数据
    return [
      { id: 'landscapes', name: 'landscapes', displayName: '风景' },
      { id: 'characters', name: 'characters', displayName: '人物' },
      { id: 'abstract', name: 'abstract', displayName: '抽象' },
      { id: 'animals', name: 'animals', displayName: '动物' },
      { id: 'fantasy', name: 'fantasy', displayName: '奇幻' },
      { id: 'scifi', name: 'scifi', displayName: '科幻' }
    ];
  }
};

/**
 * 获取特定类别的创意提示
 * @param category 类别ID
 * @param count 返回提示的数量
 * @returns 创意提示列表
 */
export const getCreativePrompts = async (category: string, count: number = 4): Promise<CreativePrompt[]> => {
  try {
    if (API_CONFIG.useMockData) {
      // 根据类别返回模拟数据
      const mockPrompts = getMockPromptsByCategory(category, count);
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟延迟
      return mockPrompts;
    }
    
    const response = await enhancedFetch(`${API_URL}/brainstorm/${category}?count=${count}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error(`获取类别 "${category}" 的创意提示失败:`, error);
    
    // 如果API调用失败，返回模拟数据
    return getMockPromptsByCategory(category, count);
  }
};

/**
 * 根据类别获取模拟提示数据
 */
const getMockPromptsByCategory = (category: string, count: number): CreativePrompt[] => {
  const allMockPrompts: Record<string, CreativePrompt[]> = {
    'landscapes': [
      { description: "壮观的山脉日落，金色阳光穿过云层，照亮山峰，形成剪影效果，高清摄影", image: "https://picsum.photos/seed/landscape1/200" },
      { description: "宁静的湖泊清晨，薄雾笼罩，倒映着周围的树木和山脉，梦幻般的氛围", image: "https://picsum.photos/seed/landscape2/200" },
      { description: "冰雪覆盖的森林，阳光透过树枝间隙，形成光束，雪花缓缓飘落，冬日童话", image: "https://picsum.photos/seed/landscape3/200" },
      { description: "热带海滩日落，金色和紫色的天空，宁静的海浪轻抚沙滩，椰子树剪影", image: "https://picsum.photos/seed/landscape4/200" }
    ],
    'characters': [
      { description: "神秘的女巫在古老森林中，被荧光植物环绕，手持法杖，细节丰富的写实风格", image: "https://picsum.photos/seed/character1/200" },
      { description: "未来战士，半机械化身体，站在城市废墟中，背景是霓虹灯光，赛博朋克风格", image: "https://picsum.photos/seed/character2/200" },
      { description: "古代将军身着精美盔甲，站在山顶眺望远方，战场迷雾缭绕，史诗般的氛围", image: "https://picsum.photos/seed/character3/200" },
      { description: "深海探险家在发光海洋生物环绕的海底遗迹中，佩戴高科技潜水设备，蓝色光芒", image: "https://picsum.photos/seed/character4/200" }
    ],
    'abstract': [
      { description: "流动的颜色漩涡，混合蓝色、紫色和金色，如同宇宙星云，抽象表现主义", image: "https://picsum.photos/seed/abstract1/200" },
      { description: "几何形状构成的城市天际线，鲜艳的霓虹色调，数字艺术风格，简约主义", image: "https://picsum.photos/seed/abstract2/200" },
      { description: "分形艺术，无限递归的螺旋图案，渐变色彩，数学美学与艺术的结合", image: "https://picsum.photos/seed/abstract3/200" },
      { description: "液态金属流动形成的抽象雕塑，反射周围环境光线，超现实主义风格", image: "https://picsum.photos/seed/abstract4/200" }
    ],
    'animals': [
      { description: "雄狮特写，金色眼睛注视前方，鬃毛在风中飘动，非洲大草原日落背景，野生动物摄影", image: "https://picsum.photos/seed/animal1/200" },
      { description: "彩色蜂鸟悬停在热带花朵前，翅膀形成虚影，捕捉精细羽毛纹理，高速摄影", image: "https://picsum.photos/seed/animal2/200" },
      { description: "北极狐在雪地中，白色皮毛与环境完美融合，只有蓝色眼睛突出，冬季荒原", image: "https://picsum.photos/seed/animal3/200" },
      { description: "海底珊瑚礁中的章鱼，变换体色与纹理，与环境融为一体，海洋生物摄影", image: "https://picsum.photos/seed/animal4/200" }
    ],
    'fantasy': [
      { description: "漂浮在云端的古老城堡，瀑布从悬崖流下，彩虹桥连接，幻想艺术风格", image: "https://picsum.photos/seed/fantasy1/200" },
      { description: "水晶森林，透明树木内部流动能量，发光的植物和奇幻生物，魔幻现实主义", image: "https://picsum.photos/seed/fantasy2/200" },
      { description: "火龙在火山口盘旋，鳞片反射岩浆光芒，烟雾缭绕，史诗般的幻想场景", image: "https://picsum.photos/seed/fantasy3/200" },
      { description: "魔法图书馆，书籍自行漂浮，螺旋楼梯通向无限高处，魔法粒子在空中闪烁", image: "https://picsum.photos/seed/fantasy4/200" }
    ],
    'scifi': [
      { description: "未来城市天际线，高耸的全息广告，飞行车穿梭，霓虹灯反射在雨水中，赛博朋克风格", image: "https://picsum.photos/seed/scifi1/200" },
      { description: "太空站环形结构，地球作为背景，阳光照射形成长阴影，科幻硬核风格", image: "https://picsum.photos/seed/scifi2/200" },
      { description: "机器人与人类在先进实验室合作，全息投影显示数据，未来主义设计，明亮冷色调", image: "https://picsum.photos/seed/scifi3/200" },
      { description: "外星景观，多重月亮悬挂天空，异形植物发光，奇怪构造的建筑，科幻概念艺术", image: "https://picsum.photos/seed/scifi4/200" }
    ]
  };
  
  // 获取指定类别的提示数据，如果类别不存在则返回风景类别
  const categoryPrompts = allMockPrompts[category] || allMockPrompts['landscapes'];
  
  // 返回指定数量的提示
  return categoryPrompts.slice(0, count);
}; 