import { MongoClient, Db } from 'mongodb';

const options = {};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

// 빌드 시에는 환경변수가 없을 수 있으므로 lazy initialization
function initializeClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    // 빌드 시에는 더미 Promise 반환
    return Promise.reject(new Error('MONGODB_URI 환경변수를 설정해주세요'));
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    return client.connect();
  }
}

// Lazy getter
export function getClientPromise(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = initializeClient();
  }
  return clientPromise;
}

export default getClientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('haroo-box');
}
