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
  const res = await axios
    .put(`https://jsonplaceholder.typicode.com/${url}`, body)
    .then((response) => response.data)
    .catch((error) => {
      console.error("\n postApiData===\n", error?.message);
      return false;
    });
  return res;
}
export const getpostsData = async (_parent, { postId }, context, info) => {
  let results;

  try {
    results = await fetchApiData(`posts/${postId}`);
    if (results.length === 0) {
      throw "API returned an empty array";
    }
    // await setRedisData(posts, results);
    console.log(results);
    return {
      fromCache: false,
      data: [results],
      message: "Data fetched successfully",
    };
  } catch (error) {
    return {
      fromCache: false,
      data: [],
      message: error.message,
    };
  }
};
export const getAllPostsData = async (_parent, {}, context, info) => {
  let results;

  const cachedUser = await redisClient.get(`post`);
  if (cachedUser) {
    const data = JSON.parse(cachedUser);
    return {
      fromCache: false,
      data: data,
      message: "Data fetched successfully",
    };
  } else {
    try {
      results = await fetchApiData(`posts`);
      if (results.length === 0) {
        throw "API returned an empty array";
      }
      // await setRedisData(posts, results);
      // Store the user in Redis cache
      await redisClient.set(`post`, JSON.stringify(results));

      return {
        fromCache: false,
        data: results,
        message: "Data fetched successfully",
      };
    } catch (error) {
      return {
        fromCache: false,
        data: [],
        message: error.message,
      };
    }
  }
};
export const putpostsData = async (parent, { input }, context, info) => {
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

const resolversData = {
  Query: {
    allPosts: getAllPostsData,
    getSinglePost: getpostsData,
  },
  Mutation: {
    createCourse: (_parent, { input }, context) => {
      console.log(input);

      return input;
    },
  },
};
export { resolversData };
