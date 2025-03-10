import mongoose, { Document, Schema } from 'mongoose';

// 用户文档接口
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  subscription: {
    plan: 'free' | 'premium' | 'team';
    startDate: Date;
    endDate: Date;
    credits: number;
  };
}

// 用户模式
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium', 'team'],
        default: 'free',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        default: function() {
          // 默认30天有效期
          return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        },
      },
      credits: {
        type: Number,
        default: 10, // 免费用户默认10积分
      },
    },
  },
  { timestamps: true }
);

// 创建和导出模型
const User = mongoose.model<IUser>('User', UserSchema);
export default User; 