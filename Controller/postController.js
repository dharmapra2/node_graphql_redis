import axios from "axios";
import { redisClient, setRedisData } from "../Redis/cacheData.js";

async function fetchApiData(url) {
  const apiResponse = await axios.get(
    `https://jsonplaceholder.typicode.com/${url}`
  );
  console.log("Request sent to the API");
  return apiResponse.data;
}

async function postApiData(url, body) {
  return await axios
    .post(`https://jsonplaceholder.typicode.com/${url}`, JSON.stringify(body))
    .then((response) => response.data)
    .catch((error) => {
      return { status: false, message: error?.message };
    });
}

export const getpostsData = async (_parent, { postId }, _context, _info) => {
  let results;
  const allcachedData = await redisClient.get(`posts`);
  const res = JSON.parse(allcachedData);
  if (res) {
    let temp = res.find((data) => data.id == postId);
    return {
      fromCache: true,
      data: [temp],
      status: true,
      message: "Data fetched successfully",
    };
  }
  const cachedData = await redisClient.get(`post:${postId}`);
  if (cachedData) {
    const data = JSON.parse(cachedData);
    return {
      fromCache: true,
      data: [data],
      status: true,
      message: "Data fetched successfully",
    };
  }
  try {
    results = await fetchApiData(`posts/${postId}`);
    if (results.length === 0) {
      throw "API returned an empty array";
    }
    await setRedisData(`post:${postId}`, results);

    return {
      fromCache: false,
      data: [results],
      status: true,
      message: "Data fetched successfully",
    };
  } catch (error) {
    return {
      fromCache: false,
      status: false,
      message: error.message,
    };
  }
};
export const getAllPostsData = async (_parent, {}, _context, _info) => {
  let results;

  const cachedData = await redisClient.get(`posts`);
  if (cachedData) {
    const data = JSON.parse(cachedData);
    return {
      fromCache: true,
      data: data,
      status: true,
      message: "Data fetched successfully",
    };
  } else {
    try {
      results = await fetchApiData(`posts`);
      if (results.length === 0) {
        throw "API returned an empty array";
      }
      // Store the user in Redis cache
      await setRedisData("posts", results);

      return {
        fromCache: false,
        data: results,
        status: true,
        message: "Data fetched successfully",
      };
    } catch (error) {
      return {
        fromCache: false,
        status: false,
        message: error.message,
      };
    }
  }
};

export const putpostsData = async (_parent, { input }, _context, _info) => {
  const { params, body } = req;
  const postId = params?.postId;
  let results;
  try {
    body["id"] = postId;
    results = await postApiData(postId, body);
    console.log("\nresults==", !results ? false : true, typeof results);

    if (!results) {
      res.status(404).json({ message: "Something .." });
    }
    // await setRedisData(postId, results, 180, false);

    res.status(201).json({ message: "Data updated.....", data: results });
  } catch (error) {
    console.error(error);
    res.status(404).json(error?.message);
  }
};

export const getCommentsByPostId = async (_parent, { postId }) => {
  let results;
  const allcachedData = await redisClient.get(`comments`);
  const res = JSON.parse(allcachedData);
  if (res) {
    let temp = res.filter((data) => data.postId == postId);
    return {
      fromCache: true,
      data: temp,
      status: true,
      message: "Data fetched successfully",
    };
  }
  const cachedData = await redisClient.get(`comment:${postId}`);
  if (cachedData) {
    const data = JSON.parse(cachedData);
    return {
      fromCache: true,
      data: data,
      status: true,
      message: "Data fetched successfully",
    };
  }
  try {
    results = await fetchApiData(`comments/?postId=${postId}`);
    if (results.length === 0) {
      throw "API returned an empty array";
    }
    await setRedisData(`comment:${postId}`, results);

    return {
      fromCache: false,
      data: results,
      status: true,
      message: "Data fetched successfully",
    };
  } catch (error) {
    return {
      fromCache: false,
      status: false,
      message: error.message,
    };
  }
};
export const getAllComments = async (_parent, {}, _context, _info) => {
  let results;

  const cachedData = await redisClient.get(`comments`);
  if (cachedData) {
    const data = JSON.parse(cachedData);
    return {
      fromCache: true,
      data: data,
      status: true,
      message: "Data fetched successfully",
    };
  } else {
    try {
      results = await fetchApiData(`comments`);
      if (results.length === 0) {
        throw "API returned an empty array";
      }
      // Store the user in Redis cache
      await setRedisData("comments", results);

      return {
        fromCache: false,
        data: results,
        status: true,
        message: "Data fetched successfully",
      };
    } catch (error) {
      return {
        fromCache: false,
        status: false,
        message: error.message,
      };
    }
  }
};

export const createPost = async (_parent, { input }, _context, _info) => {
  let results;
  try {
    results = await postApiData("posts", input);
    input["id"] = results?.id;
    await setRedisData(`post:${results?.id}`, input, 180, false);

    return {
      status: false,
      message: "Post Data created sucessfully.",
      data: input,
    };
  } catch (error) {
    return {
      status: false,
      message: error?.message,
    };
  }
};

const resolversData = {
  Query: {
    getAllPosts: getAllPostsData,
    getSinglePost: getpostsData,
    getAllComments: getAllComments,
    getCommentsByPostId: getCommentsByPostId,
  },
  Mutation: {
    createPost: createPost,
  },
};
export { resolversData };
