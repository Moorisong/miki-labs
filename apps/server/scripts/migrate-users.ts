import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// .env 로드
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
}

// HTSM URI 생성 로직
const buildHtsmUri = (baseUri: string): string => {
    if (process.env.HTSM_MONGODB_URI) {
        return process.env.HTSM_MONGODB_URI;
    }
    return baseUri.replace(/\/[^/?]+(\?|$)/, '/htsm$1');
};

async function migrate() {
    const client = new MongoClient(uri as string);
    const htsmClient = new MongoClient(buildHtsmUri(uri as string));

    try {
        await client.connect();
        await htsmClient.connect();

        console.log('Connected to databases.');

        const mainDb = client.db('haroo-box');
        const htsmDb = htsmClient.db('htsm');

        const mainUsers = mainDb.collection('users');
        const htsmUsers = htsmDb.collection('users');

        // 1. haroo-box DB의 기존 유저 업데이트 (providerId, provider 채우기)
        const harooUsers = await mainUsers.find({}).toArray();
        console.log(`[haroo-box DB] 1. 기존 유저 마이그레이션 시작 (총 ${harooUsers.length}명)`);

        let updatedCount = 0;
        for (const u of harooUsers) {
            const updates: any = {};

            // kakaoId가 있고 providerId가 없으면 추가
            if (u.kakaoId && !u.providerId) {
                updates.providerId = u.kakaoId;
            }

            // provider가 없으면 기본값(kakao) 설정
            if (!u.provider && u.kakaoId) {
                updates.provider = 'kakao';
            }

            // HTSM DB 쪽에 닉네임이나 추가 정보가 있는지 확인
            const lookupId = updates.providerId || u.providerId || u.kakaoId;
            if (lookupId) {
                const htsmUser = await htsmUsers.findOne({ providerId: lookupId });
                if (htsmUser) {
                    if (!u.nickname && htsmUser.nickname) {
                        updates.nickname = htsmUser.nickname;
                        console.log(`  - 유저(${lookupId}): htsm DB에서 닉네임 [${htsmUser.nickname}] 복사됨`);
                    }
                    if (!u.profileImage && htsmUser.profileImage) {
                        updates.profileImage = htsmUser.profileImage;
                    }
                }
            }

            if (Object.keys(updates).length > 0) {
                await mainUsers.updateOne({ _id: u._id }, { $set: updates });
                updatedCount++;
            }
        }
        console.log(`[haroo-box DB] 유저 업데이트 완료: ${updatedCount}명 변경됨\n`);

        // 2. htsm DB에만 있는 유저를 haroo-box DB로 복사 (혹시 누락된 경우)
        const htsmOnlyUsers = await htsmUsers.find({}).toArray();
        console.log(`[htsm DB] 2. 누락된 유저 복사 시작 (htsm DB 총 ${htsmOnlyUsers.length}명)`);

        let insertedCount = 0;
        for (const hu of htsmOnlyUsers) {
            if (!hu.providerId) continue;

            const existingInMain = await mainUsers.findOne({ providerId: hu.providerId });

            if (!existingInMain) {
                // haroo-box에 없으면 삽입
                await mainUsers.insertOne({
                    providerId: hu.providerId,
                    provider: hu.provider || 'guest',
                    nickname: hu.nickname,
                    profileImage: hu.profileImage,
                    createdAt: hu.createdAt || new Date(),
                    updatedAt: hu.updatedAt || new Date()
                });
                console.log(`  - 누락된 유저 복사됨: ${hu.providerId} (${hu.nickname})`);
                insertedCount++;
            }
        }
        console.log(`[htsm DB] 누락된 유저 복사 완료: ${insertedCount}명 추가됨\n`);

        console.log('✅ 마이그레이션이 성공적으로 완료되었습니다!');

    } catch (error) {
        console.error('❌ 마이그레이션 중 오류 발생:', error);
    } finally {
        await client.close();
        await htsmClient.close();
    }
}

migrate();
