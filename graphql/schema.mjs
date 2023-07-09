import { dirname, join } from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { resolversData as postControllerResolver } from "../Controller/postController.js";
import { resolversData as testResolver } from "../Controller/getTestgql.js";

// const currentFilePath = fileURLToPath(import.meta.url);
const currentFilePath = "./";
const currentDirPath = dirname(currentFilePath);
const typesArray = loadFilesSync(join(currentDirPath, "."), {
  extensions: ["graphql"],
});
const typeDefs = mergeTypeDefs(typesArray);

// Multiple files to keep your project modularised
const resolvers = mergeResolvers([postControllerResolver, testResolver]);
export { typeDefs, resolvers };
