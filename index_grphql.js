import { ApolloServer } from "@apollo/server";
import express from "express";
import bodyParser from "body-parser";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs, resolvers } from "./graphql/schema.mjs";
import { connectToRedisDB } from "./Redis/cacheData.js";

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Create the Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

/* connecting to redis client */
await connectToRedisDB();

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ token: req.headers.token }),
  // context: ({ req }) => redisClient,
  listen: { port: 4000 },
});

console.log(`server running at port: ${url}`);
