import redis from "redis";
let redisClient;

export const connectToRedisDB = async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (error) => console.error(`Error: ${error}`));

  await redisClient.connect();

  console.log("Redis client is ready");
};

export const getCacheData = async (key) => {
  let results;
  const cacheResults = await redisClient.get(key);
  if (cacheResults) {
    results = JSON.parse(cacheResults);
    return {
      fromCache: true,
      data: results,
    };
  }
};

export const setRedisData = async (data, results, ex = 180, nx = true) => {
  await redisClient.set(data, JSON.stringify(results), {
    EX: ex,
    NX: nx,
  });
};

export { redisClient };
