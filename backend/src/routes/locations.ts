import { Router } from "express";
import { createLocationSchema, updateLocationSchema } from "shared";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../utils/errors";
import { parseOrThrow } from "../utils/parse";
import * as locationsRepository from "../repositories/locations";

const locationsRouter = Router();

locationsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await locationsRepository.findAll());
  } catch (error) {
    next(error);
  }
});

locationsRouter.get("/:id", async (req, res, next) => {
  try {
    const location = await locationsRepository.findById(req.params.id);
    if (!location) throw new AppError(404, "Location not found");
    res.json(location);
  } catch (error) {
    next(error);
  }
});

locationsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const input = parseOrThrow(createLocationSchema, req.body);
    res.status(201).json(await locationsRepository.create(input));
  } catch (error) {
    next(error);
  }
});

locationsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const changes = parseOrThrow(updateLocationSchema, req.body);
    const location = await locationsRepository.update(req.params.id, changes);
    if (!location) throw new AppError(404, "Location not found");
    res.json(location);
  } catch (error) {
    next(error);
  }
});

locationsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const deleted = await locationsRepository.remove(req.params.id);
    if (!deleted) throw new AppError(404, "Location not found");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export { locationsRouter };
