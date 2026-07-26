import { Router } from "express";
import { createSportSchema, updateSportSchema } from "shared";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../utils/errors";
import { parseOrThrow } from "../utils/parse";
import * as sportsRepository from "../repositories/sports";

const sportsRouter = Router();

sportsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await sportsRepository.findAll());
  } catch (error) {
    next(error);
  }
});

sportsRouter.get("/:id", async (req, res, next) => {
  try {
    const sport = await sportsRepository.findById(req.params.id);
    if (!sport) throw new AppError(404, "Sport not found");
    res.json(sport);
  } catch (error) {
    next(error);
  }
});

sportsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const input = parseOrThrow(createSportSchema, req.body);
    res.status(201).json(await sportsRepository.create(input));
  } catch (error) {
    next(error);
  }
});

sportsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const changes = parseOrThrow(updateSportSchema, req.body);
    const sport = await sportsRepository.update(req.params.id, changes);
    if (!sport) throw new AppError(404, "Sport not found");
    res.json(sport);
  } catch (error) {
    next(error);
  }
});

sportsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const deleted = await sportsRepository.remove(req.params.id);
    if (!deleted) throw new AppError(404, "Sport not found");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export { sportsRouter };
