import { Request, Response, NextFunction } from 'express';
import { generateImages, generateImagesWithWanx, optimizePrompt } from '../services/imageGenerationService';
import Image from '../models/Image';
import mongoose from 'mongoose';
import { config } from '../config';
import { AppError } from '../middlewares';
import logger from '../utils/logger';
import { ApiResponse, GenerateImageRequest, GenerateImageResponse } from '../types';

/**
 * 生成图像
 * @route POST /api/images
 */
export const createImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, userId, boardName, aspectRatio } = req.body as GenerateImageRequest;

    if (!prompt) {
      return next(new AppError('提示词不能为空', 400));
    }

    // 调用服务生成图像
    const optimizedPrompt = await optimizePrompt(prompt);
    const images = await generateImagesWithWanx(optimizedPrompt, aspectRatio);

    // 如果仅使用模拟数据模式，可以跳过数据库存储
    if (!config.useMockData) {
      try {
        // 创建图像记录
        const newImage = new Image({
          userId: userId || new mongoose.Types.ObjectId(), // 如果没有用户ID，创建一个临时ID
          prompt,
          optimizedPrompt,
          imageUrls: images,
          boardName: boardName || prompt.split(' ').slice(0, 2).join(' ').toUpperCase(),
          metadata: {
            width: 512,
            height: 512,
            format: 'png',
            aspectRatio: aspectRatio || '1:1',
          },
        });

        await newImage.save();
        logger.info('图像已保存到数据库', { imageId: newImage._id });
      } catch (dbError) {
        logger.error('数据库存储失败，但图像生成成功:', dbError);
        // 数据库错误不应影响API响应，继续返回生成的图像
      }
    }

    const response: ApiResponse<GenerateImageResponse> = {
      success: true,
      data: {
        id: new mongoose.Types.ObjectId().toString(), // 模拟ID
        prompt,
        optimizedPrompt,
        images,
        boardName: boardName || prompt.split(' ').slice(0, 2).join(' ').toUpperCase(),
      },
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('图像生成失败:', error);
    next(new AppError('图像生成失败', 500));
  }
};

/**
 * 获取用户的所有图像
 * @route GET /api/images/user/:userId
 */
export const getUserImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    if (config.useMockData) {
      // 返回模拟数据
      return res.status(200).json({
        success: true,
        count: 2,
        data: [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            prompt: '生成一只老虎',
            optimizedPrompt: '高质量图像: 生成一只老虎, 风格写实, 光线明亮, 增强细节, 4K分辨率',
            imageUrls: [
              `https://source.unsplash.com/random/512x512/?tiger&t=${Date.now()}1`,
              `https://source.unsplash.com/random/512x512/?tiger&t=${Date.now()}2`,
              `https://source.unsplash.com/random/512x512/?tiger&t=${Date.now()}3`,
              `https://source.unsplash.com/random/512x512/?tiger&t=${Date.now()}4`,
            ],
            boardName: '老虎',
            createdAt: new Date(),
          },
          {
            _id: new mongoose.Types.ObjectId().toString(),
            prompt: '生成一朵花',
            optimizedPrompt: '高质量图像: 生成一朵花, 风格写实, 光线明亮, 增强细节, 4K分辨率',
            imageUrls: [
              `https://source.unsplash.com/random/512x512/?flower&t=${Date.now()}5`,
              `https://source.unsplash.com/random/512x512/?flower&t=${Date.now()}6`,
              `https://source.unsplash.com/random/512x512/?flower&t=${Date.now()}7`,
              `https://source.unsplash.com/random/512x512/?flower&t=${Date.now()}8`,
            ],
            boardName: '花',
            createdAt: new Date(),
          }
        ],
      });
    }
    
    const images = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    logger.error('获取用户图像失败:', error);
    next(new AppError('获取用户图像失败', 500));
  }
};

/**
 * 获取单个图像
 * @route GET /api/images/:id
 */
export const getImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (config.useMockData) {
      // 返回模拟数据
      return res.status(200).json({
        success: true,
        data: {
          _id: id,
          prompt: '生成一只老虎',
          optimizedPrompt: '高质量图像: 生成一只老虎, 风格写实, 光线明亮, 增强细节, 4K分辨率',
          imageUrls: [
            `https://source.unsplash.com/random/512x512/?tiger&t=${Date.now()}1`,
            `https://source.unsplash.com/random/512x512/?tiger&t=${Date.now()}2`,
            `https://source.unsplash.com/random/512x512/?tiger&t=${Date.now()}3`,
            `https://source.unsplash.com/random/512x512/?tiger&t=${Date.now()}4`,
          ],
          boardName: '老虎',
          createdAt: new Date(),
        }
      });
    }
    
    const image = await Image.findById(id);
    
    if (!image) {
      return next(new AppError('图像不存在', 404));
    }
    
    res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    logger.error('获取图像失败:', error);
    next(new AppError('获取图像失败', 500));
  }
}; 