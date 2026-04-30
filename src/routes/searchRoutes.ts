import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { createSearchService } from "../services/searchService";

type SearchService = ReturnType<typeof createSearchService>;

interface SearchQuery {
  q?: string;
  tags?: string;
}

export function createSearchRouter(
  searchService: SearchService
): FastifyPluginAsync {
  return async function (app: FastifyInstance) {
    app.get<{ Querystring: SearchQuery }>("/search", async (request, reply) => {
      const { q, tags } = request.query;

      if (q === undefined) {
        return reply.status(400).send({ error: "Missing required query parameter: q" });
      }

      const tagList = tags
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      try {
        const results = await searchService.search({ query: q, tags: tagList });
        return reply.status(200).send(results);
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Search failed" });
      }
    });
  };
}
