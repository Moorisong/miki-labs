import mongoose, { Document, Schema } from 'mongoose';

export interface IFriendRequest extends Document {
    fromUser: mongoose.Types.ObjectId;
    toUser: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
    {
        fromUser: {
            type: Schema.Types.ObjectId,
            ref: 'ChicorunStudent',
            required: true,
            index: true,
        },
        toUser: {
            type: Schema.Types.ObjectId,
            ref: 'ChicorunStudent',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// 동일한 유저들 사이에 보류 중인 요청이 중복되지 않도록 인덱스 설정 가능하지만,
// 로직에서 처리하는 것이 더 유연할 수 있음. (accepted, rejected 된 후 다시 신청 가능하므로)

export const FriendRequestModel = mongoose.models.FriendRequest as mongoose.Model<IFriendRequest> ||
    mongoose.model<IFriendRequest>('FriendRequest', friendRequestSchema);
