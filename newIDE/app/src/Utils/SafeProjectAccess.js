// @flow

/**
 * Safely get the project UUID from a gdProject object.
 *
 * This is needed because the C++ project object can be freed (via .delete())
 * while React components still hold a reference to it during re-renders.
 * When this happens, calling methods on the project throws a UseAfterFreeError.
 *
 * By checking the `ptr` field (set to 0 when the C++ object is destroyed),
 * we can avoid the crash and return null instead.
 */
export const safeGetProjectUuid = (project: ?gdProject): string | null => {
  if (!project || project.ptr === 0) return null;
  try {
    return project.getProjectUuid();
  } catch (e) {
    console.warn('Failed to get project UUID:', e.message);
    return null;
  }
};
