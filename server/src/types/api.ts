/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * 图像生成请求接口
 */
export interface GenerateImageRequest {
  prompt: string;
  userId?: string;
  boardName?: string;
}

/**
 * 图像生成响应接口
 */
export interface GenerateImageResponse {
  id: string;
  prompt: string;
  optimizedPrompt: string;
  images: string[];
  boardName: string;
  createdAt?: Date;
}

/**
 * 任务响应接口
 */
export interface TaskResponse {
  output?: {
    task_id?: string;
    task_status?: string;
    results?: Array<{
      url?: string;
    }>;
  };
}

/**
 * 分页请求接口
 */
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * 分页响应接口
 */
export interface PaginationResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
} 