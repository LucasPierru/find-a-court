import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { eventsRouter } from "./routes/events";
import { locationsRouter } from "./routes/locations";
import { sportsRouter } from "./routes/sports";
import { usersRouter } from "./routes/users";
import { createSocketServer } from "./sockets";
import { AppError } from "./utils/errors";

const app = express();
const httpServer = createServer(app);
createSocketServer(httpServer);

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/v1/auth", authRouter);
app.use("/v1/users", usersRouter);
app.use("/v1/sports", sportsRouter);
app.use("/v1/locations", locationsRouter);
app.use("/v1/events", eventsRouter);

app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[${req.method} ${req.path}] Error:`, error.message);
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  res.status(statusCode).json({ message: error.message || "Internal server error" });
});

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
