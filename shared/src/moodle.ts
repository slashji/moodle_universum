/**
 * Moodle-facing data shapes. These mirror what the Moodle Web Services
 * layer returns, normalized to a stable shape regardless of provider
 * (real vs mock).
 */

export interface MoodleUser {
  id: number;
  fullname: string;
  email?: string;
}

export interface MoodleCourse {
  id: number;
  fullname: string;
  shortname: string;
  category: string;
  /** Completion percentage 0-100, or null if completion tracking is not configured. */
  completion: number | null;
  completed: boolean;
}
