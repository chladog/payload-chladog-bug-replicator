import { buildConfig } from "payload/config";
import path from "path";
import Categories from "./collections/Categories";
import Posts from "./collections/Posts";
import Tags from "./collections/Tags";
import Users from "./collections/Users";
import { Where } from "payload/types";
import buildPaginatedListType from "payload/dist/graphql/schema/buildPaginatedListType";

export default buildConfig({
  serverURL: "http://localhost:3000",
  admin: {
    user: Users.slug,
  },
  collections: [Categories, Posts, Tags, Users],
  localization: {
    locales: ["en", "cs"],
    defaultLocale: "en",
    fallback: false,
  },
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
    queries: (GraphQL, payload) => {
      const collections = Object.values(payload.collections);
      return {
        MyPosts: {
          args: {
            onlyOwned: { type: GraphQL.GraphQLBoolean },
            locale: { type: GraphQL.GraphQLString },
            fallbackLocale: { type: GraphQL.GraphQLString },
          },
          type: buildPaginatedListType(
            "MyPosts",
            collections.find(
              (collection) => collection?.config?.slug === "posts"
            ).graphQL.type
          ),
          resolve: async (_, args, context) => {
            if (args.locale) context.req.locale = args.locale;
            if (args.fallbackLocale)
              context.req.fallbackLocale = args.fallbackLocale;
            if (!context.req.user) {
              return null;
            }
            const where: Where = args.onlyOwned
              ? {
                  owner: {
                    equals: context.req.user.id,
                  },
                }
              : {
                  or: [
                    {
                      owner: {
                        equals: context.req.user.id,
                      },
                    },
                    {
                      editors: {
                        equals: context.req.user.id,
                      },
                    },
                  ],
                };
            const result = await payload.find({
              collection: "posts",
              where,
              user: context.req.user,
              locale: context.req.locale,
              fallbackLocale: context.req.fallbackLocale,
              // In Default or depth: >= 1 we get the error - I believe it tries to expand relationship field, but it's already expanded at depth: 0 - which shouldn't happen
              // If you uncomment following line the query works, but owner is expanded and its data is present in the response
              // depth: 0,
            });
            return result;
          },
        },
      };
    },
  },
});
