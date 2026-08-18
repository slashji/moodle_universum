import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// DOMAIN is set by docker-compose (from .env) when this runs behind the
// Caddy reverse proxy under a public hostname — Vite blocks unrecognized
// Host headers by default, so that hostname must be explicitly allowed.
const extraAllowedHost = process.env.DOMAIN;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: extraAllowedHost ? [extraAllowedHost, "localhost"] : ["localhost"],
  },
  resolve: {
    alias: {
      "@moodle-universum/shared": new URL("../shared/src/index.ts", import.meta.url).pathname,
    },
  },
});
