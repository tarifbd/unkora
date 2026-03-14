import { Request, Response } from "express";
import { asyncHandler, buildPaginationMeta, parsePagination, HttpError, addBusinessDays } from "@unkora/utils";
import { prisma } from "@unkora/database";
import { redis } from "@unkora/database";

export class DeliveryController {
  getZones = asyncHandler(async (_req: Request, res: Response) => {
    const zones = await prisma.deliveryZone.findMany({ where: { is_serviceable: true }, orderBy: [{ division: "asc" }, { district: "asc" }] });
    res.json({ success: true, data: zones });
  });

  getZoneByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const zone = await prisma.deliveryZone.findFirst({ where: { district: req.params["district"]! } });
    if (!zone) throw HttpError.NotFound("Delivery zone not found for this district");
    res.json({ success: true, data: zone });
  });

  estimateCost = asyncHandler(async (req: Request, res: Response) => {
    const { district, weight_grams } = req.body as { district: string; weight_grams?: number };
    const zone = await prisma.deliveryZone.findFirst({ where: { district, is_serviceable: true } });
    if (!zone) throw HttpError.BadRequest("Delivery not available to this location", "NO_DELIVERY_ZONE");

    const weightMultiplier = weight_grams && weight_grams > 500 ? Math.ceil(weight_grams / 500) : 1;
    const now = new Date();

    res.json({
      success: true,
      data: {
        district,
        standard: {
          cost: zone.standard_cost * weightMultiplier,
          estimated_delivery: addBusinessDays(now, zone.standard_days).toISOString(),
          days: zone.standard_days,
        },
        express: {
          cost: zone.express_cost * weightMultiplier,
          estimated_delivery: addBusinessDays(now, zone.express_days).toISOString(),
          days: zone.express_days,
        },
        cod_available: zone.cod_available,
      },
    });
  });

  track = asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = `delivery:track:${req.params["orderId"]}`;
    const cached = await redis.getJson<unknown>(cacheKey);
    if (cached) { res.json({ success: true, data: cached }); return; }

    const delivery = await prisma.delivery.findFirst({
      where: { order: { id: req.params["orderId"]! } },
      include: { tracking_events: { orderBy: { timestamp: "desc" } } },
    });
    if (!delivery) throw HttpError.NotFound("Delivery information not found");
    await redis.setJson(cacheKey, delivery, 300);
    res.json({ success: true, data: delivery });
  });

  assign = asyncHandler(async (req: Request, res: Response) => {
    const { order_id, courier, consignment_id } = req.body as { order_id: string; courier: string; consignment_id?: string };
    const order = await prisma.order.findUnique({ where: { id: order_id } });
    if (!order) throw HttpError.NotFound("Order not found");

    const zone = await prisma.deliveryZone.findFirst({ where: { district: (order.shipping_address as Record<string, string>)["district"] ?? "" } });
    const expectedDate = zone ? addBusinessDays(new Date(), zone.standard_days) : addBusinessDays(new Date(), 5);

    const delivery = await prisma.delivery.upsert({
      where: { order_id },
      create: {
        order_id, courier: courier as Parameters<typeof prisma.delivery.create>[0]["data"]["courier"],
        consignment_id, status: "PENDING_PICKUP", expected_delivery_date: expectedDate,
        tracking_events: { create: [{ status: "PENDING_PICKUP", description: `Assigned to ${courier}`, description_bn: `${courier}-এ পাঠানো হয়েছে` }] },
      },
      update: { courier: courier as Parameters<typeof prisma.delivery.update>[0]["data"]["courier"], consignment_id, expected_delivery_date: expectedDate },
    });

    await prisma.order.update({ where: { id: order_id }, data: { status: "HANDED_TO_COURIER", courier: courier as Parameters<typeof prisma.order.update>[0]["data"]["courier"], tracking_number: consignment_id } });
    res.json({ success: true, data: delivery });
  });

  addEvent = asyncHandler(async (req: Request, res: Response) => {
    const { status, location, description, description_bn } = req.body as { status: string; location?: string; description: string; description_bn?: string };
    const event = await prisma.trackingEvent.create({
      data: { delivery_id: req.params["deliveryId"]!, status: status as Parameters<typeof prisma.trackingEvent.create>[0]["data"]["status"], location, description, description_bn },
    });
    await prisma.delivery.update({ where: { id: req.params["deliveryId"]! }, data: { status: status as Parameters<typeof prisma.delivery.update>[0]["data"]["status"] } });
    await redis.del(`delivery:track:${req.params["deliveryId"]!}`);
    res.json({ success: true, data: event });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const { skip, take, page, perPage } = parsePagination(req.query as Record<string, string>);
    const [data, total] = await Promise.all([
      prisma.delivery.findMany({ skip, take, orderBy: { created_at: "desc" }, include: { order: { select: { order_number: true, total_amount: true, shipping_address: true } } } }),
      prisma.delivery.count(),
    ]);
    res.json({ success: true, data, meta: buildPaginationMeta(total, page, perPage) });
  });
}
