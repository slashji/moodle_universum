import type { NextFunction, Request, Response } from "express";
import { getAuthProvider, type AuthedUser } from "../auth/index.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  try {
    req.user = await getAuthProvider().resolveUser(req);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      error: "forbidden",
      message: "This action requires an administrator role.",
    });
    return;
  }
  next();
}
