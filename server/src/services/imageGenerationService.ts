import { OpenAI } from 'openai';
import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';
import { TaskResponse } from '../types';

// 创建阿里云QWQ模型客户端
const qwqClient = new OpenAI({
  apiKey: config.qwq.apiKey,
  baseURL: config.qwq.baseUrl,
});

/**
 * 使用阿里云QWQ模型优化提示词
 * @param prompt 用户输入的提示词
 * @returns 优化后的提示词
 */
export const optimizePrompt = async (prompt: string): Promise<string> => {
  logger.api(`开始处理提示词: "${prompt}"`);

  try {
    // 构建用户提示词，不使用system message，保持中文不翻译
    const userPrompt = `我需要你帮我优化以下中文提示词，用于AI图像生成。
请生成一个详细、富有创意、高质量的中文图像描述，包括构图、风格、光照、颜色、情绪等元素。
仅输出优化后的中文提示词，不要翻译成英文，也不要有其他解释。
原始提示词: "${prompt}"`;

    logger.api('调用阿里云QWQ 32B API开始', { 
      model: 'qwq-32b',
      prompt: userPrompt
    });

    // 创建流式响应对象
    const stream = await qwqClient.chat.completions.create({
      model: 'qwq-32b',
      messages: [
        { role: 'user', content: userPrompt }
      ],
      stream: true,
    });

    let optimizedPrompt = '';
    
    // 收集流式响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      optimizedPrompt += content;
    }

    logger.api('阿里云QWQ 32B API响应', { optimizedPrompt });

    if (!optimizedPrompt.trim()) {
      throw new Error('QWQ模型返回了空响应');
    }

    logger.api(`优化后的提示词: "${optimizedPrompt}"`);
    return optimizedPrompt;
  } catch (error) {
    logger.apiError('阿里云QWQ处理失败', error);
    // 如果处理失败，返回原始提示词并添加一些提示
    const fallbackPrompt = `高质量图像: ${prompt}, 风格写实, 光线明亮, 增强细节, 4K分辨率`;
    logger.api(`使用备选提示词: "${fallbackPrompt}"`);
    return fallbackPrompt;
  }
};

/**
 * 等待异步任务完成并获取结果
 * @param taskId 任务ID
 * @returns 生成的图像URLs
 */
const waitForTaskCompletion = async (taskId: string): Promise<string[]> => {
  const maxAttempts = 30; // 最多尝试30次
  const pollingInterval = 2000; // 2秒轮询一次
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      logger.api(`轮询任务状态 (第${attempt + 1}次): 任务ID=${taskId}`);
      
      // 等待指定的轮询间隔
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
      
      // 查询任务状态
      const requestUrl = `${config.aliyun.baseUrl}/tasks/${taskId}`;
      logger.api(`查询任务状态: GET ${requestUrl}`);
      
      const response = await axios.get<TaskResponse>(
        requestUrl,
        {
          headers: {
            'Authorization': `Bearer ${config.aliyun.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.api(`任务状态响应: 状态码=${response.status}`, response.data);
      
      const taskStatus = response.data.output?.task_status;
      
      // 任务完成，返回图像URLs
      if (taskStatus === 'SUCCEEDED') {
        logger.api('任务成功完成', response.data);
        
        // 提取图像URLs
        const results = response.data.output?.results || [];
        const imageUrls = results.map((result) => result.url || '').filter(Boolean);
        
        logger.api(`生成的图像URLs (${imageUrls.length}个):`, imageUrls);
        return imageUrls;
      }
      
      // 任务失败，抛出错误
      if (taskStatus === 'FAILED') {
        const errorMsg = `图像生成任务失败: ${JSON.stringify(response.data.output)}`;
        logger.apiError(errorMsg, response.data);
        throw new Error(errorMsg);
      }
      
      // 任务仍在处理中，继续轮询
      logger.api(`任务处理中... 第${attempt + 1}次检查, 状态: ${taskStatus}`);
      
    } catch (error) {
      logger.apiError('查询任务状态失败', error);
      throw error;
    }
  }
  
  const timeoutError = `超过最大尝试次数(${maxAttempts})，图像生成任务未完成`;
  logger.apiError(timeoutError, { taskId });
  throw new Error(timeoutError);
};

/**
 * 使用阿里云通义万相生成图像
 * @param optimizedPrompt 优化后的提示词
 * @returns 生成的图像URL数组
 */
export const generateImages = async (prompt: string): Promise<{ optimizedPrompt: string, images: string[] }> => {
  logger.api(`===== 开始新的图像生成请求 =====`);
  logger.api(`原始提示词: "${prompt}"`);
  
  // 1. 使用QWQ模型优化提示词
  const optimizedPrompt = await optimizePrompt(prompt);
  
  // 2. 使用通义万相生成图像
  const images = await generateImagesWithWanx(optimizedPrompt);
  
  logger.api(`===== 图像生成请求完成 =====`);
  return { optimizedPrompt, images };
};

/**
 * 使用阿里云通义万相生成图像
 * @param optimizedPrompt 优化后的提示词
 * @returns 生成的图像URL数组
 */
export const generateImagesWithWanx = async (optimizedPrompt: string): Promise<string[]> => {
  logger.api(`准备生成图像，提示词: "${optimizedPrompt}"`);

  try {
    const requestUrl = `${config.aliyun.baseUrl}/services/aigc/text2image/image-synthesis`;
    const requestBody = {
      model: 'wanx2.1-t2i-turbo',
      input: {
        prompt: optimizedPrompt
      },
      parameters: {
        size: '1024*1024',
        n: 4,
        prompt_extend: true,
        watermark: false
      }
    };
    
    logger.api('调用阿里云通义万相API开始', { 
      url: requestUrl,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
        'Authorization': `Bearer ${config.aliyun.apiKey}`
      }
    });
    
    // 第一步：创建图像生成任务
    const createTaskResponse = await axios.post<TaskResponse>(
      requestUrl,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${config.aliyun.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        }
      }
    );
    
    // 检查创建任务响应
    logger.api(`阿里云API响应: 状态码=${createTaskResponse.status}`, createTaskResponse.data);
    
    if (createTaskResponse.status === 200 && createTaskResponse.data) {
      logger.api('通义万相任务创建成功', createTaskResponse.data);
      
      const taskId = createTaskResponse.data.output?.task_id;
      
      if (!taskId) {
        const errorMsg = 'API未返回有效的任务ID';
        logger.apiError(errorMsg, createTaskResponse.data);
        throw new Error(errorMsg);
      }
      
      logger.api(`获取到任务ID: ${taskId}，开始等待任务完成`);
      
      // 第二步：等待任务完成并获取结果
      return await waitForTaskCompletion(taskId);
    } else {
      const errorMsg = `通义万相API任务创建失败: 状态码=${createTaskResponse.status}`;
      logger.apiError(errorMsg, createTaskResponse.data);
      throw new Error(errorMsg);
    }
  } catch (error) {
    logger.apiError('通义万相图像生成失败', error);
    
    // 如果API调用失败，记录详细错误，然后返回备选方案
    if (axios.isAxiosError(error)) {
      logger.apiError('Axios错误详情', {
        config: error.config,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    
    // 返回备选图像
    const fallbackImages = [
      'https://picsum.photos/seed/fallback1/512/512',
      'https://picsum.photos/seed/fallback2/512/512',
      'https://picsum.photos/seed/fallback3/512/512',
      'https://picsum.photos/seed/fallback4/512/512'
    ];
    
    logger.api('API调用失败，使用备选图像源', fallbackImages);
    return fallbackImages;
  }
}; 