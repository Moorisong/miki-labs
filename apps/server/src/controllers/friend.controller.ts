import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';
import { AppError } from '../middlewares/error-handler';
import { ChicorunStudentModel } from '../models/chicorun-student.model';
import { FriendRequestModel } from '../models/friend-request.model';
import mongoose from 'mongoose';

// GET /api/chicorun/friends -> 내 친구 목록 + 받은 요청 수 반환
export const getFriends = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const studentId = req.chicoStudent?.studentId;
        if (!studentId) throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');

        const studentResult = await ChicorunStudentModel.findById(studentId)
            .populate('friends', 'nickname point currentLevel updatedAt')
            .lean();

        if (!studentResult) throw new AppError(404, 'ERROR_STUDENT_NOT_FOUND: 학생 정보를 찾을 수 없습니다.');

        const friends = (studentResult.friends || []).sort((a, b) => (b as any).point - (a as any).point);

        const pendingReceivedCount = await FriendRequestModel.countDocuments({
            toUser: studentId,
            status: 'pending'
        });

        res.json({
            success: true,
            data: {
                friends,
                pendingReceivedCount
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chicorun/friends/requests -> 받은 요청 리스트 & 보낸 요청 리스트
export const getFriendRequests = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const studentId = req.chicoStudent?.studentId;
        if (!studentId) throw new AppError(401, 'ERROR_UNAUTHORIZED: 학생 인증이 필요합니다.');

        const receivedRequests = await FriendRequestModel.find({ toUser: studentId, status: 'pending' })
            .populate('fromUser', 'nickname point currentLevel')
            .lean();

        const sentRequests = await FriendRequestModel.find({ fromUser: studentId, status: 'pending' })
            .populate('toUser', 'nickname point currentLevel')
            .lean();

        res.json({
            success: true,
            data: {
                received: receivedRequests,
                sent: sentRequests
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/chicorun/friends/search?nickname=xxx
export const searchFriendsByNickname = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const studentId = req.chicoStudent?.studentId;
        let { nickname } = req.query as { nickname: string };

        // 검색어 가공 및 정규화 (NFC)
        nickname = String(nickname || '').trim().normalize('NFC');
        if (!nickname) throw new AppError(400, 'ERROR_INVALID_INPUT: 검색어를 입력하세요.');

        let studentsWithMe: any[] = [];

        if (nickname === 'DEBUG_ALL') {
            // 디버그용: 전체 유저 조회 (최대 20명)
            studentsWithMe = await ChicorunStudentModel.find({})
                .select('nickname point currentLevel friends')
                .limit(20)
                .lean();
        } else {
            // 일반 검색: 정확한 일치 또는 정규식 검색
            const escapedNickname = nickname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedNickname, 'i');

            studentsWithMe = await ChicorunStudentModel.find({
                $or: [
                    { nickname: nickname }, // 정확히 일치 우선
                    { nickname: { $regex: regex } } // 포함 검색
                ]
            })
                .select('nickname point currentLevel friends')
                .limit(20)
                .lean();
        }

        // 현재 상태 확인 (친구 여부, 요청 여부)
        const myRequests = await FriendRequestModel.find({
            $or: [
                { fromUser: studentId },
                { toUser: studentId }
            ],
            status: 'pending'
        }).lean();

        const myDoc = await ChicorunStudentModel.findById(studentId).select('friends').lean();
        const myFriendIds = (myDoc?.friends || []).map(f => f.toString());

        const searchResults = studentsWithMe.map(s => {
            const sid = String(s._id);
            const isMe = sid === String(studentId);
            const isFriend = myFriendIds.includes(sid);

            // 요청 상태 확인 (ObjectId -> String 변환 필수)
            const sentRequest = myRequests.find(r =>
                String(r.fromUser) === String(studentId) && String(r.toUser) === sid
            );
            const receivedRequest = myRequests.find(r =>
                String(r.toUser) === String(studentId) && String(r.fromUser) === sid
            );

            return {
                id: sid,
                nickname: s.nickname,
                point: s.point,
                currentLevel: s.currentLevel,
                isMe,
                isFriend,
                pendingSent: !!sentRequest,
                pendingReceived: !!receivedRequest,
                requestId: sentRequest?._id || receivedRequest?._id
            };
        });

        res.json({
            success: true,
            data: searchResults
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/chicorun/friends/request { toNickname: string }
export const sendFriendRequest = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const fromUserId = req.chicoStudent?.studentId;
        const { toNickname } = req.body as { toNickname: string };

        if (!toNickname) throw new AppError(400, 'ERROR_INVALID_INPUT: 닉네임이 필요합니다.');

        const targetUser = await ChicorunStudentModel.findOne({ nickname: toNickname });
        if (!targetUser) throw new AppError(404, 'ERROR_USER_NOT_FOUND: 상대방을 찾을 수 없습니다.');
        if (targetUser._id.toString() === fromUserId) throw new AppError(400, 'ERROR_SELF_REQUEST: 자신에게 신청할 수 없습니다.');

        // 이미 친구인지 확인
        if (targetUser.friends.some(fId => fId.toString() === fromUserId)) {
            throw new AppError(400, 'ERROR_ALREADY_FRIENDS: 이미 친구입니다.');
        }

        // 이미 신청했는지 확인 (보류 중)
        const existing = await FriendRequestModel.findOne({
            fromUser: fromUserId,
            toUser: targetUser._id,
            status: 'pending'
        });
        if (existing) throw new AppError(400, 'ERROR_ALREADY_REQUESTED: 이미 신청한 상대입니다.');

        // 상대방이 이미 나에게 신청했는지 확인 -> 이 경우 바로 수락 처리하거나 유저에게 알림 (여기선 알림)
        const inverse = await FriendRequestModel.findOne({
            fromUser: targetUser._id,
            toUser: fromUserId,
            status: 'pending'
        });
        if (inverse) throw new AppError(400, 'ERROR_INVERSE_REQUEST_EXISTS: 상대방이 이미 신청을 보냈습니다.');

        // 신청 수 제한 (최대 30건)
        const sentCount = await FriendRequestModel.countDocuments({ fromUser: fromUserId, status: 'pending' });
        if (sentCount >= 30) throw new AppError(400, 'ERROR_TOO_MANY_REQUESTS: 보낸 요청이 너무 많습니다 (최대 30건).');

        const request = new FriendRequestModel({
            fromUser: fromUserId,
            toUser: targetUser._id,
            status: 'pending'
        });
        await request.save();

        res.json({
            success: true,
            message: '친구 신청을 보냈습니다.'
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/chicorun/friends/respond { requestId: string, action: 'accept' | 'reject' }
export const respondToFriendRequest = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const studentId = req.chicoStudent?.studentId;
        const { requestId, action } = req.body as { requestId: string, action: 'accept' | 'reject' };

        const request = await FriendRequestModel.findById(requestId);
        if (!request || request.status !== 'pending') {
            throw new AppError(404, 'ERROR_REQUEST_NOT_FOUND: 요청을 찾을 수 없거나 이미 처리되었습니다.');
        }

        if (request.toUser.toString() !== studentId) {
            throw new AppError(403, 'ERROR_FORBIDDEN: 권한이 없습니다.');
        }

        if (action === 'accept') {
            request.status = 'accepted';
            await request.save();

            // 양방향 친구 추가
            await ChicorunStudentModel.findByIdAndUpdate(request.fromUser, {
                $addToSet: { friends: request.toUser }
            });

            await ChicorunStudentModel.findByIdAndUpdate(request.toUser, {
                $addToSet: { friends: request.fromUser }
            });
        } else {
            request.status = 'rejected';
            await request.save();
        }

        res.json({
            success: true,
            data: action === 'accept',
            message: action === 'accept' ? '친구 수락 완료' : '친구 거절 완료'
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/chicorun/friends/:friendId
export const removeFriend = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const studentId = req.chicoStudent?.studentId;
        const { friendId } = req.params;

        // 양방향 삭제
        await ChicorunStudentModel.findByIdAndUpdate(studentId, {
            $pull: { friends: friendId }
        });

        await ChicorunStudentModel.findByIdAndUpdate(friendId, {
            $pull: { friends: studentId }
        });

        // 기존의 accepted 된 요청 데이터도 정리
        await FriendRequestModel.deleteMany({
            $or: [
                { fromUser: studentId, toUser: friendId },
                { fromUser: friendId, toUser: studentId }
            ],
            status: 'accepted'
        });

        res.json({
            success: true,
            message: '친구를 삭제했습니다.'
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/chicorun/friends/request/:requestId (취소)
export const cancelFriendRequest = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const studentId = req.chicoStudent?.studentId;
        const { requestId } = req.params;

        const request = await FriendRequestModel.findById(requestId);
        if (!request) throw new AppError(404, 'ERROR_REQUEST_NOT_FOUND: 요청을 찾을 수 없습니다.');

        if (request.fromUser.toString() !== studentId) {
            throw new AppError(403, 'ERROR_FORBIDDEN: 권한이 없습니다.');
        }

        if (request.status !== 'pending') {
            throw new AppError(400, 'ERROR_CANNOT_CANCEL: 이미 처리된 요청입니다.');
        }

        await FriendRequestModel.findByIdAndDelete(requestId);

        res.json({
            success: true,
            message: '친구 신청을 취소했습니다.'
        });
    } catch (error) {
        next(error);
    }
};
