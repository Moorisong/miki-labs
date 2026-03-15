import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';
import * as authService from '../services/auth.service';
import { AppError } from '../middlewares/error-handler';
import { IUser } from '../models/user.model';

interface LoginRequestBody {
  provider: 'kakao' | 'google';
  accessToken: string;
}

interface LoginResponseData {
  user: {
    id: string;
    nickname?: string;
    profileImage?: string;
    provider: string;
  };
  // JWT token will be added later
}

export const login = async (
  req: Request<object, ApiResponse<LoginResponseData>, LoginRequestBody>,
  res: Response<ApiResponse<LoginResponseData>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { provider, accessToken } = req.body;

    if (!provider || !accessToken) {
      throw new AppError(400, 'Provider and accessToken are required');
    }

    // MVP: Mock OAuth validation
    // In production, validate accessToken with OAuth provider
    // For now, create a mock user for testing
    const mockProviderId = `${provider}_mock_${Date.now()}`;

    const user = await authService.findOrCreateUser({
      providerId: mockProviderId,
      provider,
      nickname: `User_${Date.now().toString(36)}`,
      profileImage: undefined
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          nickname: user.nickname,
          profileImage: user.profileImage,
          provider: user.provider
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // MVP: Basic logout
    // In production, invalidate JWT token or session
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response<ApiResponse<IUser | null>>,
  next: NextFunction
): Promise<void> => {
  try {
    // MVP: Return user from request (set by auth middleware)
    // For now, return not implemented
    if (!req.user) {
      res.json({
        success: true,
        data: null,
        message: 'Not authenticated'
      });
      return;
    }

    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};
