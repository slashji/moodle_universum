import { DevAuthProvider } from "./devAuthProvider.js";
import type { AuthProvider } from "./types.js";

let instance: AuthProvider | null = null;

/** AUTH_MODE currently only supports "dev"; add cases here for SSO later. */
export function getAuthProvider(): AuthProvider {
  if (!instance) {
    instance = new DevAuthProvider();
  }
  return instance;
}

export * from "./types.js";
