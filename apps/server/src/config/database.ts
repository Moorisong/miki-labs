import mongoose, { Connection } from 'mongoose';

/** HTSM 전용 DB 커넥션 */
let htsmConnection: Connection | null = null;

/**
 * MONGODB_URI에서 DB명을 교체하여 HTSM 전용 URI 생성
 * 예: mongodb+srv://...mongodb.net/claw-addict?... → mongodb+srv://...mongodb.net/htsm?...
 */
function buildHtsmUri(baseUri: string): string {
  // MONGODB_URI 환경변수에 HTSM 전용 URI가 있으면 우선 사용
  if (process.env.HTSM_MONGODB_URI) {
    return process.env.HTSM_MONGODB_URI;
  }
  // 기존 URI에서 DB명 부분만 교체
  return baseUri.replace(/\/[^/?]+(\?|$)/, '/htsm$1');
}

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('MONGO_URI not defined, skipping DB connection');
    return;
  }

  try {
    // 기본 DB 연결 (claw-addict)
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB (main)');

    // HTSM 전용 DB 연결
    const htsmUri = buildHtsmUri(mongoUri);
    htsmConnection = mongoose.createConnection(htsmUri);
    await htsmConnection.asPromise();
    console.log('Connected to MongoDB (htsm)');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

/** HTSM 전용 DB 커넥션 반환 */
export const getHtsmConnection = (): Connection => {
  if (!htsmConnection) {
    throw new Error('HTSM DB connection not initialized. Call connectDatabase() first.');
  }
  return htsmConnection;
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (htsmConnection) {
    await htsmConnection.close();
    htsmConnection = null;
  }
  console.log('Disconnected from MongoDB');
};
