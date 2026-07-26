import { Router } from "express";
import { updateUserSchema } from "shared";
import { getAuthenticatedUser, requireAuth } from "../middleware/auth";
import { AppError } from "../utils/errors";
import { parseOrThrow } from "../utils/parse";
import * as usersRepository from "../repositories/users";

const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await usersRepository.findById(getAuthenticatedUser(req).id);
    if (!user) throw new AppError(404, "User not found");
    res.json(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const { name } = parseOrThrow(updateUserSchema, req.body);
    const user = await usersRepository.updateName(getAuthenticatedUser(req).id, name);
    if (!user) throw new AppError(404, "User not found");
    res.json(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/me", requireAuth, async (req, res, next) => {
  try {
    await usersRepository.remove(getAuthenticatedUser(req).id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await usersRepository.findById(req.params.id);
    if (!user) throw new AppError(404, "User not found");
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export { usersRouter };
