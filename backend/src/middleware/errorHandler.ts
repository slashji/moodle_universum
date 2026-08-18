import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MoodleAuthError, MoodleUnavailableError } from "../providers/moodle/types.js";

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error {
  constructor(message = "Invalid request") {
    super(message);
    this.name = "BadRequestError";
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "validation_error",
      message: "Request data failed validation.",
      detail: err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    });
    return;
  }

  if (err instanceof BadRequestError) {
    res.status(400).json({ error: "bad_request", message: err.message });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: "not_found", message: err.message });
    return;
  }

  if (err instanceof MoodleAuthError) {
    res.status(502).json({
      error: "moodle_auth_error",
      message: "Moodle rejected the configured credentials.",
    });
    return;
  }

  if (err instanceof MoodleUnavailableError) {
    res.status(503).json({
      error: "moodle_unavailable",
      message: "Moodle is currently unreachable. Course progress may be stale.",
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "internal_error",
    message: "An unexpected error occurred.",
  });
}
