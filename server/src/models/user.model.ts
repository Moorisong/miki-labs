import mongoose, { Document, Schema } from 'mongoose';

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

export const User = mongoose.model<IUser>('User', userSchema);
