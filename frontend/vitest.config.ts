import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@moodle-universum/shared": new URL("../shared/src/index.ts", import.meta.url).pathname,
    },
  },
});
