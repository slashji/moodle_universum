import { prisma } from "../database/prisma.js";
import { env } from "../types/env.js";
import { getMoodleProvider } from "../providers/moodle/index.js";
import type { AppRole, AuthedUser, AuthProvider } from "./types.js";

/**
 * Development authentication: trusts the Moodle "current user" (real or
 * mocked) and allows overriding the role via an `x-dev-role` header, purely
 * for exercising the admin editor locally. Not for production use — replace
 * with a Moodle SSO / OAuth provider implementing AuthProvider when ready.
 */
export class DevAuthProvider implements AuthProvider {
  async resolveUser(req: { header(name: string): string | undefined }): Promise<AuthedUser> {
    const moodleUser = await getMoodleProvider().getCurrentUser();

    const user = await prisma.user.upsert({
      where: { moodleUserId: moodleUser.id },
      update: {
        fullName: moodleUser.fullname,
        email: moodleUser.email ?? null,
      },
      create: {
        moodleUserId: moodleUser.id,
        fullName: moodleUser.fullname,
        email: moodleUser.email ?? null,
        role: env.devDefaultRole === "admin" ? "ADMIN" : "STUDENT",
      },
    });

    const roleOverride = req.header("x-dev-role");
    const role: AppRole =
      roleOverride === "admin" || roleOverride === "teacher" || roleOverride === "student"
        ? roleOverride
        : (user.role.toLowerCase() as AppRole);

    return {
      id: user.id,
      moodleUserId: user.moodleUserId,
      fullName: user.fullName,
      email: user.email,
      role,
    };
  }
}
