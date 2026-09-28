/**
 * Who is using the app.
 *
 * PROTOTYPE ONLY: there is no authentication yet. Every change is attributed
 * to APP_USER_NAME (default "Local user"). When authentication is added, this
 * is the single function to replace — every service already records the
 * returned name against changes.
 */
export interface CurrentUser {
  name: string;
}

export function getCurrentUser(): CurrentUser {
  const name = process.env.APP_USER_NAME?.trim();
  return { name: name || "Local user" };
}
