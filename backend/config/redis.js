import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  connectTimeout: 5000,
};

// Flag to track Redis availability
let isRedisAvailable = false;

// Create Redis instances
export const redis = new Redis(redisConfig);
export const pubClient = new Redis(redisConfig);
export const subClient = new Redis(redisConfig);

// Error handling
redis.on('error', (err) => {
  console.warn('Redis connection error (running without Redis):', err.message);
  isRedisAvailable = false;
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
  isRedisAvailable = true;
});

redis.on('ready', () => {
  console.log('Redis is ready');
  isRedisAvailable = true;
});

redis.on('close', () => {
  console.warn('Redis connection closed');
  isRedisAvailable = false;
});

// Check Redis availability
export const checkRedisHealth = () => isRedisAvailable;

// Cache utilities
export const cacheUtils = {
  // Set cache with expiration (default 1 hour)
  async set(key, value, expireInSeconds = 3600) {
    try {
      if (!isRedisAvailable) return false;
      const serializedValue = JSON.stringify(value);
      await redis.set(key, serializedValue, 'EX', expireInSeconds);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache
  async get(key) {
    try {
      if (!isRedisAvailable) return null;
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  async del(key) {
    try {
      if (!isRedisAvailable) return false;
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      if (!isRedisAvailable) return false;
      return await redis.exists(key) === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Clear all cache
  async flush() {
    try {
      if (!isRedisAvailable) return false;
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  },

  // Set cache with pattern-based operations
  async setPattern(pattern, value, expireInSeconds = 3600) {
    try {
      if (!isRedisAvailable) return false;
      const keys = await redis.keys(pattern);
      const pipeline = redis.pipeline();
      keys.forEach(key => {
        pipeline.set(key, JSON.stringify(value), 'EX', expireInSeconds);
      });
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache setPattern error:', error);
      return false;
    }
  },

  // Delete cache by pattern
  async delPattern(pattern) {
    try {
      if (!isRedisAvailable) return false;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delPattern error:', error);
      return false;
    }
  }
};

export default redis;