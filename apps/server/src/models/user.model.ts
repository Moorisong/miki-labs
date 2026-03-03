import { Document, Schema } from 'mongoose';
import { getHtsmConnection } from '../config/database';

export interface IUser extends Document {
  providerId: string;
  provider: 'kakao' | 'google' | 'guest';
  nickname: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    providerId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    provider: {
      type: String,
      required: true,
      enum: ['kakao', 'google', 'guest']
    },
    nickname: {
      type: String,
      required: true,
      unique: true
    },
    profileImage: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

/** HTSM 전용 DB 커넥션에서 모델 반환 */
export const getUserModel = () => {
  const conn = getHtsmConnection();
  return conn.models.User || conn.model<IUser>('User', userSchema);
};

