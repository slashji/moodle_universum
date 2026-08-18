import { Router } from "express";
import type { MoodleCoursesResponse } from "@moodle-universum/shared";
import { getMoodleProvider } from "../providers/moodle/index.js";

export const moodleRouter = Router();

moodleRouter.get("/courses", async (req, res, next) => {
  try {
    const provider = getMoodleProvider();
    const moodleUserId = req.user!.moodleUserId;
    const user = moodleUserId ? { id: moodleUserId } : await provider.getCurrentUser();
    const courses = await provider.getEnrolledCourses(user.id);
    const body: MoodleCoursesResponse = { courses };
    res.json(body);
  } catch (err) {
    next(err);
  }
});

moodleRouter.get("/completion", async (req, res, next) => {
  try {
    const provider = getMoodleProvider();
    const moodleUserId = req.user!.moodleUserId;
    const user = moodleUserId ? { id: moodleUserId } : await provider.getCurrentUser();
    const courses = await provider.getEnrolledCourses(user.id);
    res.json({
      completion: courses.map((c) => ({
        moodleCourseId: c.id,
        completion: c.completion,
        completed: c.completed,
      })),
    });
  } catch (err) {
    next(err);
  }
});
