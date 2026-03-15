import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  providerId: string;
  provider: 'kakao' | 'google' | 'guest';
  name?: string;
  nickname?: string;
  nicknameUpdatedAt?: Date;
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
    name: {
      type: String,
    },
    nickname: {
      type: String,
    },
    nicknameUpdatedAt: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true
  }
);

/**
 * 메인 DB(haroo-box) 커넥션에서 User 모델 반환
 * - 기존에는 HTSM DB에 저장했으나, 유저는 서비스 공통 자원이므로 메인 DB로 통합
 */
export const getUserModel = () => {
  return mongoose.models.User || mongoose.model<IUser>('User', userSchema);
};
