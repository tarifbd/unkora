import { Client } from "@elastic/elasticsearch";
import { prisma } from "@unkora/database";
import { redis } from "@unkora/database";
import { createLogger } from "@unkora/utils";

const logger = createLogger("search-service");
const INDEX_NAME = "unkora_products";

const esClient = new Client({
  node: process.env["ELASTICSEARCH_URL"] ?? "http://localhost:9200",
});

export class SearchService {
  async ensureIndex() {
    const exists = await esClient.indices.exists({ index: INDEX_NAME });
    if (exists) return;

    await esClient.indices.create({
      index: INDEX_NAME,
      body: {
        settings: {
          analysis: {
            analyzer: {
              bangla_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "bengali_stop", "bengali_normalization"],
              },
              autocomplete_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "edge_ngram_filter"],
              },
              autocomplete_search_analyzer: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase"],
              },
            },
            filter: {
              edge_ngram_filter: { type: "edge_ngram", min_gram: 1, max_gram: 20 },
              bengali_stop: { type: "stop", stopwords: "_bengali_" },
              bengali_normalization: { type: "bengali_normalization" },
            },
          },
          number_of_shards: 1,
          number_of_replicas: 0,
        },
        mappings: {
          properties: {
            id:               { type: "keyword" },
            slug:             { type: "keyword" },
            name_en:          { type: "text", analyzer: "standard", fields: { keyword: { type: "keyword" }, autocomplete: { type: "text", analyzer: "autocomplete_analyzer", search_analyzer: "autocomplete_search_analyzer" } } },
            name_bn:          { type: "text", analyzer: "bangla_analyzer", fields: { autocomplete: { type: "text", analyzer: "autocomplete_analyzer", search_analyzer: "autocomplete_search_analyzer" } } },
            description_en:   { type: "text", analyzer: "standard" },
            description_bn:   { type: "text", analyzer: "bangla_analyzer" },
            tags:             { type: "keyword" },
            category_slug:    { type: "keyword" },
            category_name_bn: { type: "text" },
            brand_name:       { type: "keyword" },
            base_price:       { type: "integer" },
            sale_price:       { type: "integer" },
            rating_average:   { type: "float" },
            rating_count:     { type: "integer" },
            sales_count:      { type: "integer" },
            is_featured:      { type: "boolean" },
            is_halal_certified: { type: "boolean" },
            stock_quantity:   { type: "integer" },
            publish_status:   { type: "keyword" },
            image_url:        { type: "keyword", index: false },
          },
        },
      },
    });
    logger.info(`ES index '${INDEX_NAME}' created`);
  }

  async indexProduct(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, brand: true, images: { where: { is_primary: true }, take: 1 } },
    });
    if (!product || product.publish_status !== "PUBLISHED") return;

    await esClient.index({
      index: INDEX_NAME,
      id: product.id,
      document: {
        id: product.id,
        slug: product.slug,
        name_en: product.name_en,
        name_bn: product.name_bn,
        description_en: product.description_en,
        description_bn: product.description_bn,
        tags: product.tags,
        category_slug: product.category.slug,
        category_name_bn: product.category.name_bn,
        brand_name: product.brand?.name ?? null,
        base_price: product.base_price,
        sale_price: product.sale_price,
        rating_average: product.rating_average,
        rating_count: product.rating_count,
        sales_count: product.sales_count,
        is_featured: product.is_featured,
        is_halal_certified: product.is_halal_certified,
        stock_quantity: product.stock_quantity,
        publish_status: product.publish_status,
        image_url: product.images[0]?.url ?? null,
      },
    });
  }

  async search(params: {
    q: string;
    page?: number;
    per_page?: number;
    category?: string;
    min_price?: number;
    max_price?: number;
    rating?: number;
    is_halal?: boolean;
    sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  }) {
    const { q, page = 1, per_page = 20, sort = "relevance" } = params;
    const from = (page - 1) * per_page;

    // Build filters
    const filters: unknown[] = [{ term: { publish_status: "PUBLISHED" } }, { range: { stock_quantity: { gt: 0 } } }];
    if (params.category) filters.push({ term: { category_slug: params.category } });
    if (params.min_price || params.max_price) {
      filters.push({ range: { base_price: { ...(params.min_price && { gte: params.min_price }), ...(params.max_price && { lte: params.max_price }) } } });
    }
    if (params.rating) filters.push({ range: { rating_average: { gte: params.rating } } });
    if (params.is_halal) filters.push({ term: { is_halal_certified: true } });

    // Sort
    const sortConfig: unknown[] = [];
    if (sort === "price_asc") sortConfig.push({ base_price: "asc" });
    else if (sort === "price_desc") sortConfig.push({ base_price: "desc" });
    else if (sort === "rating") sortConfig.push({ rating_average: "desc" }, { rating_count: "desc" });
    else if (sort === "newest") sortConfig.push({ _score: "desc" });

    const query = {
      bool: {
        must: [
          {
            multi_match: {
              query: q,
              fields: ["name_bn^4", "name_en^3", "name_bn.autocomplete^2", "name_en.autocomplete^2", "description_bn^1", "tags^2", "brand_name^2"],
              fuzziness: "AUTO",
              type: "best_fields",
              operator: "or",
            },
          },
        ],
        filter: filters,
      },
    };

    const [results, suggest] = await Promise.all([
      esClient.search({
        index: INDEX_NAME,
        from,
        size: per_page,
        query,
        sort: sortConfig.length > 0 ? sortConfig : undefined,
        highlight: {
          fields: { name_bn: {}, name_en: {} },
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"],
        },
        aggs: {
          categories: { terms: { field: "category_slug", size: 10 } },
          price_stats: { stats: { field: "base_price" } },
          avg_rating: { avg: { field: "rating_average" } },
        },
      }),
      esClient.search({
        index: INDEX_NAME,
        suggest: {
          did_you_mean: { text: q, phrase: { field: "name_bn", size: 3, gram_size: 3, confidence: 1.0, max_errors: 2 } },
        },
        size: 0,
      }),
    ]);

    // Log search
    void prisma.searchLog.create({ data: { query: q, results_count: (results.hits.total as { value: number }).value } });

    const suggestion = (suggest as { suggest?: { did_you_mean?: { options?: unknown[] }[] } }).suggest?.did_you_mean?.[0]?.options?.[0];

    return {
      hits: results.hits.hits.map((h) => ({ ...h._source as Record<string, unknown>, highlight: h.highlight })),
      total: (results.hits.total as { value: number }).value,
      page,
      per_page,
      aggregations: results.aggregations,
      suggestion: suggestion ? (suggestion as { text: string }).text : null,
    };
  }

  async autocomplete(q: string): Promise<string[]> {
    const cacheKey = `search:suggest:${q.toLowerCase().slice(0, 20)}`;
    const cached = await redis.getJson<string[]>(cacheKey);
    if (cached) return cached;

    const res = await esClient.search({
      index: INDEX_NAME,
      size: 8,
      query: {
        bool: {
          should: [
            { match: { "name_bn.autocomplete": { query: q, boost: 3 } } },
            { match: { "name_en.autocomplete": { query: q, boost: 2 } } },
            { match: { tags: { query: q } } },
          ],
          filter: [{ term: { publish_status: "PUBLISHED" } }],
        },
      },
      _source: ["name_bn", "name_en"],
    });

    const suggestions = res.hits.hits.map((h) => (h._source as { name_bn: string }).name_bn);
    await redis.setJson(cacheKey, suggestions, 86400);
    return suggestions;
  }

  async reindexAll() {
    const products = await prisma.product.findMany({
      where: { publish_status: "PUBLISHED", deleted_at: null },
      select: { id: true },
    });

    logger.info(`Reindexing ${products.length} products...`);
    let indexed = 0;
    for (const p of products) {
      await this.indexProduct(p.id);
      indexed++;
      if (indexed % 100 === 0) logger.info(`Indexed ${indexed}/${products.length}`);
    }
    logger.info("Reindex complete");
  }
}

export const searchService = new SearchService();
