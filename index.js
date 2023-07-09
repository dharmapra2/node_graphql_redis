import express from "express";
import bodyParser from "body-parser";
import { getpostsData, putpostsData } from "./Controller/postController.js";
import { cacheData, connectToRedisDB } from "./Redis/cacheData.js";
// import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import { gql, ApolloServer } from "apollo-server";

const app = express();
const port = 4000;

/* bodyParser.json() or express.json() is used for add the built-in JSON body parser to properly add the "body" property to the request object. */
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

/* connecting to redis client */
await connectToRedisDB();
// The GraphQL schema
const typeDefs = gql`
  type Query {
    course(itemID: Int!): Course
    courses(topic: String): [Course]
  }

  type Course {
    id: Int
    title: String
    author: String
    description: String
    topic: String
    url: String
  }
`;
var coursesData = [
  {
    id: 1,
    title: "The Complete Node.js Developer Course",
    author: "Andrew Mead, Rob Percival",
    description:
      "Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!",
    topic: "Node.js",
    url: "https://codingthesmartway.com/courses/nodejs/",
  },
  {
    id: 2,
    title: "Node.js, Express & MongoDB Dev to Deployment",
    author: "Brad Traversy",
    description:
      "Learn by example building & deploying real-world Node.js applications from absolute scratch",
    topic: "Node.js",
    url: "https://codingthesmartway.com/courses/nodejs-express-mongodb/",
  },
  {
    id: 3,
    title: "JavaScript: Understanding The Weird Parts",
    author: "Anthony Alicea",
    description:
      "An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.",
    topic: "JavaScript",
    url: "https://codingthesmartway.com/courses/understand-javascript/",
  },
];
var getCourse = function (_, ...args) {
  const { itemID } = args?.[0];
  return coursesData.filter((course) => course.id === itemID)[0];
};
var getCourses = function (_, ...args) {
  const { topic } = args?.[0];
  if (topic) {
    return coursesData.filter((course) => course.topic === topic);
  } else {
    return coursesData;
  }
};

const resolvers = {
  Query: {
    course: getCourse,
    courses: getCourses,
  },
};

// app.get("/post/:postId", cacheData, getpostsData);
// app.put("/post/:postId", putpostsData);

// Create an HTTP server separately
const httpServer = http.createServer(app);

// Set up Apollo Server with the HTTP server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // plugins: [ApolloServerPluginDrainHttpServer({ httpServer })], // Use the HTTP server here
});

// Install WebSocket-based subscriptions (if needed)
// server.installSubscriptionHandlers(httpServer);

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
