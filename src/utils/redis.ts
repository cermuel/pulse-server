import Redis from 'ioredis';

const DEFAULT_EXPIRY = 3600;

export const getOrSetCache = async <T>(
  key: string,
  callback: () => Promise<T>,
  redis: Redis,
  duration?: number,
): Promise<T> => {
  try {
    if (redis) {
      const cache = await redis.get(key);
      if (cache) {
        console.log(`Successfully fetched ${key} from redis cache`);
        return JSON.parse(cache);
      }

      const data = await callback();

      try {
        await redis.setex(
          key,
          duration || DEFAULT_EXPIRY,
          JSON.stringify(data),
        );
        console.log(`Successfully set ${key} to redis cache`);
      } catch (writeError) {
        console.warn(`Redis write failed for key "${key}":`, writeError);
      }
      return data;
    }
  } catch (error) {
    console.log('get or set cache error: ', error);
  }
  return await callback();
};
