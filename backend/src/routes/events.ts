import { Router } from "express";
import { createEventSchema, sportSlugSchema, updateEventSchema } from "shared";
import { z } from "zod";
import { getAuthenticatedUser, requireAuth } from "../middleware/auth";
import { parseOrThrow } from "../utils/parse";
import * as eventsService from "../services/events";
import * as messagesService from "../services/messages";

const listQuerySchema = z.object({
  sportId: sportSlugSchema.optional(),
  upcoming: z.enum(["true", "false"]).optional(),
  q: z.string().optional(),
  location: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional(),
});

const eventsRouter = Router();

eventsRouter.get("/", async (req, res, next) => {
  try {
    const { sportId, upcoming, q, location, page, pageSize } = parseOrThrow(listQuerySchema, req.query);
    res.json(
      await eventsService.list({
        sportId,
        upcomingOnly: upcoming === "true",
        keyword: q,
        location,
        page: page ?? 1,
        pageSize: pageSize ?? 12,
      }),
    );
  } catch (error) {
    next(error);
  }
});

eventsRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await eventsService.getById(req.params.id));
  } catch (error) {
    next(error);
  }
});

eventsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const input = parseOrThrow(createEventSchema, req.body);
    const event = await eventsService.create(input, getAuthenticatedUser(req).id);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

eventsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const changes = parseOrThrow(updateEventSchema, req.body);
    const event = await eventsService.update(req.params.id, changes, getAuthenticatedUser(req).id);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

eventsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    await eventsService.remove(req.params.id, getAuthenticatedUser(req).id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

eventsRouter.get("/:id/participants", async (req, res, next) => {
  try {
    res.json(await eventsService.listParticipants(req.params.id));
  } catch (error) {
    next(error);
  }
});

eventsRouter.post("/:id/join", requireAuth, async (req, res, next) => {
  try {
    await eventsService.join(req.params.id, getAuthenticatedUser(req).id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

eventsRouter.delete("/:id/join", requireAuth, async (req, res, next) => {
  try {
    await eventsService.leave(req.params.id, getAuthenticatedUser(req).id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

eventsRouter.get("/:id/messages", requireAuth, async (req, res, next) => {
  try {
    const messages = await messagesService.listForEvent(req.params.id, getAuthenticatedUser(req).id);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export { eventsRouter };
