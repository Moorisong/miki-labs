import mongoose, { Connection } from 'mongoose';

/** HTSM 전용 DB 커넥션 */
let htsmConnection: Connection | null = null;

/** u-know 전용 DB 커넥션 */
let uknowConnection: Connection | null = null;

/** 하루퍼즐 전용 DB 커넥션 */
let puzzleConnection: Connection | null = null;

/**
 * MONGODB_URI에서 DB명을 교체하여 HTSM 전용 URI 생성
 * 예: mongodb+srv://...mongodb.net/haroo-box?... → mongodb+srv://...mongodb.net/htsm?...
 */
function buildHtsmUri(baseUri: string): string {
  if (process.env.HTSM_MONGODB_URI) {
    return process.env.HTSM_MONGODB_URI;
  }
  return baseUri.replace(/\/[^/?]+(\?|$)/, '/htsm$1');
}

/**
 * MONGODB_URI에서 DB명을 교체하여 u-know 전용 URI 생성
 */
function buildUKnowUri(baseUri: string): string {
  if (process.env.UKNOW_MONGODB_URI) {
    return process.env.UKNOW_MONGODB_URI;
  }
  return baseUri.replace(/\/[^/?]+(\?|$)/, '/uknow$1');
}

/**
 * MONGODB_URI에서 DB명을 교체하여 하루퍼즐 전용 URI 생성
 */
function buildPuzzleUri(baseUri: string): string {
  if (process.env.PUZZLE_MONGODB_URI) {
    return process.env.PUZZLE_MONGODB_URI;
  }
  return baseUri.replace(/\/[^/?]+(\?|$)/, '/puzzle$1');
}

export const connectDatabase = async (): Promise<void> => {
  let mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.includes('/haroo-box')) {
    // 혹시 /가 없고 쿼리스트링만 있는 경우나 디비명이 누락된 경우 명시적 haroo-box 적용
    mongoUri = mongoUri.replace(/\/[^/?]+(\?|$)/, '/haroo-box$1');
  }

  if (!mongoUri) {
    console.warn('MONGO_URI not defined, skipping DB connection');
    return;
  }

  try {
    // 기본 DB 연결 (haroo-box)
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB (main):', mongoUri);

    // HTSM 전용 DB 연결
    const htsmUri = buildHtsmUri(mongoUri);
    htsmConnection = mongoose.createConnection(htsmUri);
    await htsmConnection.asPromise();
    console.log('Connected to MongoDB (htsm)');

    // u-know 전용 DB 연결
    const uknowUri = buildUKnowUri(mongoUri);
    uknowConnection = mongoose.createConnection(uknowUri);
    await uknowConnection.asPromise();
    console.log('Connected to MongoDB (uknow)');

    // 하루퍼즐 전용 DB 연결
    const puzzleUri = buildPuzzleUri(mongoUri);
    puzzleConnection = mongoose.createConnection(puzzleUri);
    await puzzleConnection.asPromise();
    console.log('Connected to MongoDB (puzzle)');
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

/** u-know 전용 DB 커넥션 반환 */
export const getUKnowConnection = (): Connection => {
  if (!uknowConnection) {
    throw new Error('UKnow DB connection not initialized. Call connectDatabase() first.');
  }
  return uknowConnection;
};

/** 하루퍼즐 전용 DB 커넥션 반환 */
export const getPuzzleConnection = (): Connection => {
  if (!puzzleConnection) {
    throw new Error('Puzzle DB connection not initialized. Call connectDatabase() first.');
  }
  return puzzleConnection;
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (htsmConnection) {
    await htsmConnection.close();
    htsmConnection = null;
  }
  if (uknowConnection) {
    await uknowConnection.close();
    uknowConnection = null;
  }
  if (puzzleConnection) {
    await puzzleConnection.close();
    puzzleConnection = null;
  }
  console.log('Disconnected from MongoDB');
};
