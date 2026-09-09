// @flow
/**
 * The usernames allowed to use the profiler, performance and resources
 * panels in production. Compared without regard to the case.
 */
export const PROFILER_ALLOWED_USERNAMES: Array<string> = [
  'GDevelop',
  'Bouh',
  'Crowbar_Coder',
  'VegeTato',
];

/**
 * In development, the profiling tools are available to everyone. In
 * production, only to the logged in users of the allowed list.
 */
export const isProfilerAccessAllowed = (
  profile: ?{ +username: ?string, ... },
  isDevelopment: boolean
): boolean => {
  if (isDevelopment) return true;
  if (!profile || !profile.username) return false;
  const username = profile.username.trim().toLowerCase();
  return PROFILER_ALLOWED_USERNAMES.some(
    allowedUsername => allowedUsername.toLowerCase() === username
  );
};
