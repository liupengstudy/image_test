import express from 'express';
import { getCreativePrompts, getCategories } from '../controllers/brainstormController';
import { validateParams } from '../middlewares';

const router = express.Router();

// 获取所有提示类别
router.get('/categories', getCategories);

// 根据类别获取创意提示
router.get('/:category', validateParams(['category']), getCreativePrompts);

export default router; 