import type { MoodleCourse, MoodleUser } from "@moodle-universum/shared";

/**
 * Abstraction over Moodle's Web Services REST API. All Moodle access in the
 * backend goes through this interface — routes and services never call
 * Moodle directly. This keeps the frontend, and the rest of the backend,
 * decoupled from whether we're talking to a real Moodle instance or a
 * mock used for local development.
 *
 * Extend this interface (not the callers) when adding grades, activities,
 * competencies, teachers, assignments, etc.
 */
export interface MoodleProvider {
  getCurrentUser(): Promise<MoodleUser>;
  getEnrolledCourses(userId: number): Promise<MoodleCourse[]>;
}

export class MoodleUnavailableError extends Error {
  constructor(message = "Moodle is currently unavailable") {
    super(message);
    this.name = "MoodleUnavailableError";
  }
}

export class MoodleAuthError extends Error {
  constructor(message = "Moodle rejected the configured API token") {
    super(message);
    this.name = "MoodleAuthError";
  }
}
