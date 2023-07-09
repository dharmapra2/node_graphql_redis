import redis from "redis";
let redisClient;

export const connectToRedisDB = async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (error) => console.error(`Error: ${error}`));

  await redisClient.connect();

  console.log("Redis client is ready");
};

export const cacheData = async (req, res, next) => {
  const posts = req.params.postId;
  let results;
  try {
    const cacheResults = await redisClient.get(posts);
    if (cacheResults) {
      results = JSON.parse(cacheResults);
      res.send({
        fromCache: true,
        data: results,
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(404);
  }
};

export const setRedisData = async (data, results, ex = 180, nx = true) => {
  await redisClient.set(data, JSON.stringify(results), {
    EX: ex,
    NX: nx,
  });
};

export { redisClient };
