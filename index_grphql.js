import { ApolloServer } from "@apollo/server";
import express from "express";
import bodyParser from "body-parser";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs, resolvers } from "./graphql/schema.mjs";
import { Redis } from "ioredis";
import { connectToRedisDB } from "./Redis/cacheData.js";
// import { connectToRedisDB, redisClient } from "./Redis/cacheData.js";

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Import the resolvers from the separate file
// Create the Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

/* connecting to redis client */
await connectToRedisDB();

// const redisClient = new Redis({
//   host: "localhost",
//   port: 6379,
// });

// Start the server
// server.listen().then(({ url }) => {
//   console.log(`graphql Server running at ${url}`);
// });
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ token: req.headers.token }),
  // context: ({ req }) => redisClient,
  listen: { port: 4000 },
});

console.log(`server running at port: ${url}`);
