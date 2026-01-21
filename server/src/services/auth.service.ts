import mongoose, { Types } from 'mongoose';
import { User, IUser } from '../models/user.model';

export interface OAuthUserData {
  providerId: string;
  provider: 'kakao' | 'google' | 'guest';
  nickname: string;
  profileImage?: string;
}

export const findOrCreateUser = async (userData: OAuthUserData): Promise<IUser> => {
  const existingUser = await User.findOne({ providerId: userData.providerId });

  if (existingUser) {
    // Update user info if changed
    existingUser.nickname = userData.nickname;
    if (userData.profileImage) {
      existingUser.profileImage = userData.profileImage;
    }
    await existingUser.save();
    return existingUser;
  }

  const newUser = new User({
    providerId: userData.providerId,
    provider: userData.provider,
    nickname: userData.nickname,
    profileImage: userData.profileImage
  });

  return newUser.save();
};

export const createGuestUser = async (nickname: string, tempId: string): Promise<IUser> => {
  if (mongoose.connection.readyState !== 1) {
    return {
      _id: new Types.ObjectId(),
      providerId: tempId,
      provider: 'guest',
      nickname: nickname,
      profileImage: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${nickname}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async () => ({})
    } as unknown as IUser;
  }

  // Check if guest with this tempId already exists (unlikely given timestamp, but good for idempotency)
  const existingUser = await User.findOne({ providerId: tempId });
  if (existingUser) {
    existingUser.nickname = nickname; // Update nickname if they changed it
    return existingUser.save();
  }

  const newUser = new User({
    providerId: tempId,
    provider: 'guest',
    nickname: nickname,
    profileImage: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${nickname}` // Fun default avatar
  });

  return newUser.save();
};

export const findUserById = async (userId: string): Promise<IUser | null> => {
  return User.findById(userId);
};

export const findUserByProviderId = async (providerId: string): Promise<IUser | null> => {
  return User.findOne({ providerId });
};
