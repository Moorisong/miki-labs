import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const HTSM_MONGODB_URI = process.env.HTSM_MONGODB_URI || MONGODB_URI?.replace(/\/[^/?]+(\?|$)/, '/htsm$1');

async function migrate() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }

    if (!HTSM_MONGODB_URI) {
        console.error('HTSM_MONGODB_URI is not defined');
        process.exit(1);
    }

    console.log('Main DB URI:', MONGODB_URI);
    console.log('HTSM DB URI:', HTSM_MONGODB_URI);

    try {
        // 1. Connect to main DB (claw-addict)
        const mainConn = await mongoose.createConnection(MONGODB_URI).asPromise();
        console.log('Connected to Main DB (claw-addict)');

        // 2. Connect to HTSM DB
        const htsmConn = await mongoose.createConnection(HTSM_MONGODB_URI).asPromise();
        console.log('Connected to HTSM DB');

        // 3. Define User schema for migration
        const userSchema = new mongoose.Schema({
            providerId: { type: String, required: true },
            provider: { type: String, required: true },
            nickname: String,
            profileImage: String,
            createdAt: Date,
            updatedAt: Date
        }, { strict: false });

        const HtsmUser = htsmConn.model('User', userSchema, 'users');

        // 4. Fetch users from main DB using raw collection to handle any field names
        const users = await mainConn.collection('users').find({}).toArray();
        console.log(`Found ${users.length} raw users in Main DB`);

        if (users.length === 0) {
            console.log('No users to migrate.');
        } else {
            // 5. Map users to HTSM format (providerId, provider)
            const mappedUsers = users.map(u => {
                const providerId = u.providerId || u.kakaoId || u.googleId || (u._id ? u._id.toString() : null);
                const provider = u.provider || (u.kakaoId ? 'kakao' : (u.googleId ? 'google' : 'guest'));

                return {
                    ...u,
                    providerId,
                    provider,
                    nickname: u.nickname || u.name || 'Unknown',
                    profileImage: u.profileImage || u.image || undefined,
                    updatedAt: u.updatedAt || new Date(),
                    createdAt: u.createdAt || new Date()
                };
            });

            // 6. Filter out users that already exist in HTSM
            const existingUsers = await htsmConn.collection('users').find({}, { projection: { providerId: 1 } }).toArray();
            const existingProviderIds = new Set(existingUsers.map(u => u.providerId));

            const usersToInsert = mappedUsers.filter(u => u.providerId && !existingProviderIds.has(u.providerId));

            if (usersToInsert.length > 0) {
                console.log(`Attempting to migrate ${usersToInsert.length} new users to HTSM DB...`);
                // We use insertMany on the model to trigger validation and schema defaults if any
                await HtsmUser.insertMany(usersToInsert);
                console.log(`Successfully migrated ${usersToInsert.length} new users to HTSM DB.`);
            } else {
                console.log('No new users to migrate.');
            }

            const skippedCount = mappedUsers.filter(u => u.providerId && existingProviderIds.has(u.providerId)).length;
            const invalidCount = mappedUsers.filter(u => !u.providerId).length;
            console.log(`Summary: ${usersToInsert.length} inserted, ${skippedCount} already existed, ${invalidCount} invalid.`);
        }

        await mainConn.close();
        await htsmConn.close();
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
