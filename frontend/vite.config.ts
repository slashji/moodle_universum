import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@moodle-universum/shared": new URL("../shared/src/index.ts", import.meta.url).pathname,
    },
  },
});
