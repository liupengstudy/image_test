import { Request, Response, NextFunction } from 'express';
import { generateCreativePrompts, PromptCategory } from '../services/brainstormService';
import { AppError } from '../middlewares';
import logger from '../utils/logger';

/**
 * 根据类别获取创意提示
 * @route GET /api/brainstorm/:category
 */
export const getCreativePrompts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const count = Number(req.query.count) || 4;
    
    // 验证类别是否有效
    if (!Object.values(PromptCategory).includes(category as PromptCategory)) {
      return next(new AppError(`无效的类别: ${category}`, 400));
    }
    
    // 验证数量是否有效
    if (count < 1 || count > 10) {
      return next(new AppError('提示数量必须在1-10之间', 400));
    }
    
    // 生成创意提示
    const prompts = await generateCreativePrompts(category as PromptCategory, count);
    
    res.status(200).json({
      success: true,
      data: prompts
    });
  } catch (error) {
    logger.error('获取创意提示失败:', error);
    next(new AppError('获取创意提示失败', 500));
  }
};

/**
 * 获取所有可用的提示类别
 * @route GET /api/brainstorm/categories
 */
export const getCategories = (_req: Request, res: Response) => {
  const categories = Object.values(PromptCategory).map(category => ({
    id: category,
    name: category,
    displayName: getCategoryDisplayName(category as PromptCategory),
  }));
  
  res.status(200).json({
    success: true,
    data: categories
  });
};

/**
 * 获取类别的显示名称
 */
const getCategoryDisplayName = (category: PromptCategory): string => {
  const displayNames: Record<PromptCategory, string> = {
    [PromptCategory.LANDSCAPES]: '风景',
    [PromptCategory.CHARACTERS]: '人物',
    [PromptCategory.ABSTRACT]: '抽象',
    [PromptCategory.ANIMALS]: '动物',
    [PromptCategory.FANTASY]: '奇幻',
    [PromptCategory.SCIFI]: '科幻',
  };
  
  return displayNames[category] || category;
}; 