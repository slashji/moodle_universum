import { env } from "../../types/env.js";
import { MockMoodleProvider } from "./mockProvider.js";
import { RealMoodleProvider } from "./realProvider.js";
import type { MoodleProvider } from "./types.js";

let instance: MoodleProvider | null = null;

/** Selects the Moodle provider implementation based on MOODLE_PROVIDER. */
export function getMoodleProvider(): MoodleProvider {
  if (!instance) {
    instance = env.moodleProvider === "real" ? new RealMoodleProvider() : new MockMoodleProvider();
  }
  return instance;
}

export * from "./types.js";
