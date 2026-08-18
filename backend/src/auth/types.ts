export type AppRole = "student" | "admin" | "teacher";

export interface AuthedUser {
  /** Internal app user id (not the Moodle user id). */
  id: string;
  moodleUserId: number | null;
  fullName: string;
  email: string | null;
  role: AppRole;
}

/**
 * Resolves the current request's user. Swappable so a future Moodle SSO
 * (or other centralized auth) provider can replace DevAuthProvider without
 * touching routes — routes only ever depend on this interface.
 */
export interface AuthProvider {
  resolveUser(req: { header(name: string): string | undefined }): Promise<AuthedUser>;
}
