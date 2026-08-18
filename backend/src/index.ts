import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./types/env.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", moodleProvider: env.moodleProvider });
});

app.use("/api", attachUser, apiRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(
    `moodle-universum backend listening on :${env.port} (moodle provider: ${env.moodleProvider})`
  );
});
