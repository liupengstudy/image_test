import { Document } from 'mongoose';

/**
 * 图像文档接口
 */
export interface IImage extends Document {
  userId: string;
  prompt: string;
  optimizedPrompt: string;
  imageUrls: string[];
  boardName: string;
  metadata: {
    width: number;
    height: number;
    format: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户文档接口
 */
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  
  // 方法
  comparePassword(candidatePassword: string): Promise<boolean>;
} 