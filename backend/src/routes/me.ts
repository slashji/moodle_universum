import { Router } from "express";
import type { MeResponse } from "@moodle-universum/shared";

export const meRouter = Router();

meRouter.get("/", (req, res) => {
  const user = req.user!;
  const body: MeResponse = {
    user: {
      id: user.moodleUserId ?? 0,
      fullname: user.fullName,
      email: user.email ?? undefined,
    },
    role: user.role === "teacher" ? "admin" : user.role,
  };
  res.json(body);
});
