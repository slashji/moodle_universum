import type { MoodleCourse, MoodleUser } from "@moodle-universum/shared";
import { env } from "../../types/env.js";
import { MoodleAuthError, MoodleUnavailableError, type MoodleProvider } from "./types.js";

interface MoodleErrorBody {
  exception?: string;
  errorcode?: string;
  message?: string;
}

interface MoodleSiteInfo {
  userid: number;
  fullname: string;
  username: string;
}

interface MoodleRawCourse {
  id: number;
  fullname: string;
  shortname: string;
  category: number;
  progress?: number | null;
  completed?: boolean;
  completionusertracked?: boolean;
}

interface MoodleRawCategory {
  id: number;
  name: string;
}

/**
 * Talks to a real Moodle instance via the Moodle REST Web Services API
 * (webservice/rest/server.php). Selected via MOODLE_PROVIDER=real.
 *
 * Requires MOODLE_BASE_URL and MOODLE_TOKEN to be configured. The token is
 * never exposed to the frontend — all calls happen server-side.
 */
export class RealMoodleProvider implements MoodleProvider {
  private categoryCache: Map<number, string> | null = null;

  private async callFunction<T>(wsfunction: string, params: Record<string, string>): Promise<T> {
    if (!env.moodleBaseUrl || !env.moodleToken) {
      throw new MoodleUnavailableError(
        "MOODLE_BASE_URL and MOODLE_TOKEN must be configured for the real Moodle provider"
      );
    }

    const url = new URL("/webservice/rest/server.php", env.moodleBaseUrl);
    url.searchParams.set("wstoken", env.moodleToken);
    url.searchParams.set("wsfunction", wsfunction);
    url.searchParams.set("moodlewsrestformat", "json");
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.moodleTimeoutMs);

    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (err) {
      throw new MoodleUnavailableError(
        `Failed to reach Moodle at ${env.moodleBaseUrl}: ${(err as Error).message}`
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new MoodleUnavailableError(`Moodle responded with HTTP ${response.status}`);
    }

    const body = (await response.json()) as T | MoodleErrorBody;
    if (body && typeof body === "object" && "exception" in body) {
      const errorBody = body as MoodleErrorBody;
      if (errorBody.errorcode === "invalidtoken" || errorBody.errorcode === "accessexception") {
        throw new MoodleAuthError(errorBody.message);
      }
      throw new MoodleUnavailableError(errorBody.message ?? "Moodle returned an unexpected error");
    }

    return body as T;
  }

  private async getCategoryNames(): Promise<Map<number, string>> {
    if (this.categoryCache) return this.categoryCache;
    const categories = await this.callFunction<MoodleRawCategory[]>(
      "core_course_get_categories",
      {}
    );
    this.categoryCache = new Map(categories.map((c) => [c.id, c.name]));
    return this.categoryCache;
  }

  async getCurrentUser(): Promise<MoodleUser> {
    const info = await this.callFunction<MoodleSiteInfo>("core_webservice_get_site_info", {});
    return { id: info.userid, fullname: info.fullname };
  }

  async getEnrolledCourses(userId: number): Promise<MoodleCourse[]> {
    const [rawCourses, categoryNames] = await Promise.all([
      this.callFunction<MoodleRawCourse[]>("core_enrol_get_users_courses", {
        userid: String(userId),
      }),
      this.getCategoryNames().catch(() => new Map<number, string>()),
    ]);

    return rawCourses.map((course) => ({
      id: course.id,
      fullname: course.fullname,
      shortname: course.shortname,
      category: categoryNames.get(course.category) ?? `Category ${course.category}`,
      completion:
        course.completionusertracked && course.progress != null
          ? Math.round(course.progress)
          : null,
      completed: Boolean(course.completed),
    }));
  }
}
