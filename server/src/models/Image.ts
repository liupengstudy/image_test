import mongoose, { Document, Schema } from 'mongoose';

// 图像文档接口
export interface IImage extends Document {
  userId: mongoose.Types.ObjectId;
  prompt: string;
  optimizedPrompt: string;
  imageUrls: string[];
  createdAt: Date;
  boardName: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    style?: string;
    tags?: string[];
  };
}

// 图像模式
const ImageSchema = new Schema<IImage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    optimizedPrompt: {
      type: String,
      required: true,
    },
    imageUrls: {
      type: [String],
      required: true,
    },
    boardName: {
      type: String,
      default: 'New Board',
    },
    metadata: {
      width: {
        type: Number,
        default: 512,
      },
      height: {
        type: Number,
        default: 512,
      },
      format: {
        type: String,
        default: 'png',
      },
      style: String,
      tags: [String],
    },
  },
  { timestamps: true }
);

// 创建和导出模型
const Image = mongoose.model<IImage>('Image', ImageSchema);
export default Image; 