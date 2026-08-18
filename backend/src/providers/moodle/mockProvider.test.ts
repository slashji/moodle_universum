import { describe, expect, it } from "vitest";
import { MockMoodleProvider } from "./mockProvider.js";

describe("MockMoodleProvider", () => {
  it("returns a realistic current user without network access", async () => {
    const provider = new MockMoodleProvider();
    const user = await provider.getCurrentUser();
    expect(user.id).toBe(123);
    expect(user.fullname).toBeTruthy();
  });

  it("returns enrolled courses with completion data", async () => {
    const provider = new MockMoodleProvider();
    const courses = await provider.getEnrolledCourses(123);
    expect(courses.length).toBeGreaterThan(0);
    for (const course of courses) {
      expect(typeof course.id).toBe("number");
      expect(typeof course.fullname).toBe("string");
      expect(typeof course.completed).toBe("boolean");
    }
    const completed = courses.filter((c) => c.completed);
    expect(completed.length).toBeGreaterThan(0);
  });

  it("is deterministic across calls (safe for repeated dev use)", async () => {
    const provider = new MockMoodleProvider();
    const a = await provider.getEnrolledCourses(123);
    const b = await provider.getEnrolledCourses(123);
    expect(a).toEqual(b);
  });
});
