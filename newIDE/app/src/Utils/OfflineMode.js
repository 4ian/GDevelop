// @flow
// Central flag for running the IDE fully offline.
export const OFFLINE_MODE = true;

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

export const isLocalOrRelativeUrl = (url: string): boolean => {
  if (!url) return true;
  const trimmed = url.trim();
  if (!trimmed) return true;

  // Relative or same-origin URLs.
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return true;
  }

  // Allow local resources.
  if (
    trimmed.startsWith('file:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, window.location.href);
    if (parsed.protocol === 'file:') return true;
    if (LOCAL_HOSTNAMES.has(parsed.hostname)) return true;
    return false;
  } catch {
    // If parsing fails, be permissive for safety.
    return true;
  }
};
