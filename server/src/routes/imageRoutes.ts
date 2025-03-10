import express from 'express';
import { createImage, getUserImages, getImage } from '../controllers/imageController';
import { validateBody, validateParams, validateMongoId } from '../middlewares';

const router = express.Router();

// 创建图像
router.post('/', validateBody(['prompt']), createImage);

// 获取用户的所有图像
router.get('/user/:userId', validateParams(['userId']), validateMongoId('userId'), getUserImages);

// 获取单个图像
router.get('/:id', validateMongoId(), getImage);

export default router; 