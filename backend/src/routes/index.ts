import { Router } from "express";
import { meRouter } from "./me.js";
import { moodleRouter } from "./moodle.js";
import { universeRouter } from "./universe.js";
import { domainsRouter } from "./domains.js";
import { adminRouter } from "./admin.js";

export const apiRouter = Router();

apiRouter.use("/me", meRouter);
apiRouter.use("/moodle", moodleRouter);
apiRouter.use("/universe", universeRouter);
apiRouter.use("/domains", domainsRouter);
apiRouter.use("/admin", adminRouter);
