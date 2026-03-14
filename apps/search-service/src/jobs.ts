import { Queue, Worker, type Job } from "bullmq";
import { getRedisClient } from "@unkora/database";
import { createLogger } from "@unkora/utils";

const logger = createLogger("jobs");
const connection = getRedisClient();

// ─────────────────────────────────────────────
// QUEUE DEFINITIONS
// ─────────────────────────────────────────────

export const queues = {
  order:        new Queue("unkora:order", { connection }),
  payment:      new Queue("unkora:payment", { connection }),
  notification: new Queue("unkora:notification", { connection }),
  marketing:    new Queue("unkora:marketing", { connection }),
  delivery:     new Queue("unkora:delivery", { connection }),
  search:       new Queue("unkora:search", { connection }),
};

// ─────────────────────────────────────────────
// SHARED JOB TYPES
// ─────────────────────────────────────────────

export type OrderJob =
  | { type: "send-confirmation-email"; orderId: string; userId: string }
  | { type: "send-confirmation-sms"; orderId: string; phone: string }
  | { type: "notify-vendor"; orderId: string; vendorId: string }
  | { type: "release-stock-timeout"; orderId: string }
  | { type: "auto-call-cod"; orderId: string; phone: string };

export type NotificationJob =
  | { type: "order-status-update"; orderId: string; userId: string; status: string; phone?: string; email?: string }
  | { type: "price-drop-wishlist"; productId: string; newPrice: number }
  | { type: "review-request"; orderId: string; userId: string };

export type MarketingJob =
  | { type: "abandoned-cart-sms"; phone: string; name: string; products: string; cartId: string }
  | { type: "abandoned-cart-email"; email: string; name: string; products: string; cartId: string; hasCoupon?: boolean }
  | { type: "rfm-rebuild" }
  | { type: "product-feed-refresh" }
  | { type: "loyalty-expiry-check" };

export type DeliveryJob =
  | { type: "assign-courier"; orderId: string }
  | { type: "check-delivery-status"; orderId: string; consignmentId: string; courier: string }
  | { type: "fraud-score"; orderId: string };

export type SearchJob =
  | { type: "index-product"; productId: string }
  | { type: "reindex-all" };

// ─────────────────────────────────────────────
// JOB DISPATCH HELPERS
// ─────────────────────────────────────────────

export async function dispatchOrderJob(job: OrderJob, delayMs = 0) {
  await queues.order.add(job.type, job, { delay: delayMs, attempts: 3, backoff: { type: "exponential", delay: 5000 } });
}

export async function dispatchNotificationJob(job: NotificationJob, delayMs = 0) {
  await queues.notification.add(job.type, job, { delay: delayMs, attempts: 3, backoff: { type: "exponential", delay: 3000 } });
}

export async function dispatchMarketingJob(job: MarketingJob, delayMs = 0) {
  await queues.marketing.add(job.type, job, { delay: delayMs, attempts: 2, backoff: { type: "exponential", delay: 10000 } });
}

export async function dispatchDeliveryJob(job: DeliveryJob, delayMs = 0) {
  await queues.delivery.add(job.type, job, { delay: delayMs, attempts: 3, backoff: { type: "exponential", delay: 5000 } });
}

export async function dispatchSearchJob(job: SearchJob) {
  await queues.search.add(job.type, job, { attempts: 5, backoff: { type: "exponential", delay: 2000 } });
}

// ─────────────────────────────────────────────
// ORDER WORKER
// ─────────────────────────────────────────────

export const orderWorker = new Worker<OrderJob>(
  "unkora:order",
  async (job: Job<OrderJob>) => {
    const data = job.data;
    logger.info(`Processing order job: ${data.type}`, { jobId: job.id });

    switch (data.type) {
      case "send-confirmation-email":
        // Call notification service
        logger.info(`Sending confirmation email for order ${data.orderId}`);
        break;

      case "send-confirmation-sms":
        logger.info(`Sending confirmation SMS to ${data.phone}`);
        break;

      case "notify-vendor":
        logger.info(`Notifying vendor ${data.vendorId} of order ${data.orderId}`);
        break;

      case "release-stock-timeout":
        // If order not confirmed within 15 min, release reserved stock
        logger.info(`Releasing stock for timed-out order ${data.orderId}`);
        break;

      case "auto-call-cod":
        logger.info(`Triggering auto-call for COD order to ${data.phone}`);
        break;
    }
  },
  { connection, concurrency: 10 }
);

// ─────────────────────────────────────────────
// SEARCH WORKER
// ─────────────────────────────────────────────

export const searchWorker = new Worker<SearchJob>(
  "unkora:search",
  async (job: Job<SearchJob>) => {
    const { searchService } = await import("./services/search.service");
    if (job.data.type === "index-product") {
      await searchService.indexProduct(job.data.productId);
      logger.info(`Indexed product ${job.data.productId}`);
    } else if (job.data.type === "reindex-all") {
      await searchService.reindexAll();
    }
  },
  { connection, concurrency: 5 }
);

// Error handlers
[orderWorker, searchWorker].forEach((w) => {
  w.on("failed", (job, err) => logger.error(`Job failed: ${job?.name}`, { error: (err as Error).message }));
  w.on("completed", (job) => logger.info(`Job completed: ${job.name}`, { jobId: job.id }));
});

// Recurring cron jobs (production)
export async function scheduleCronJobs() {
  await queues.marketing.add("abandoned-cart-check", { type: "rfm-rebuild" }, { repeat: { every: 30 * 60_000 } }); // every 30 min
  await queues.marketing.add("rfm-rebuild", { type: "rfm-rebuild" }, { repeat: { cron: "0 2 * * *" } }); // 2am daily
  await queues.marketing.add("loyalty-expiry", { type: "loyalty-expiry-check" }, { repeat: { cron: "0 9 * * *" } }); // 9am daily
  await queues.search.add("product-feed-refresh", { type: "reindex-all" }, { repeat: { cron: "0 */6 * * *" } }); // every 6h
  logger.info("Cron jobs scheduled");
}
