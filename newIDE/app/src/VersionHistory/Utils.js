import type { VersionRestoringStatus } from '.';

export const getStatusColor = (
  gdevelopTheme: GDevelopTheme,
  status: VersionRestoringStatus
) => {
  return status === 'unsavedChanges'
    ? gdevelopTheme.statusIndicator.error
    : status === 'saving'
    ? gdevelopTheme.statusIndicator.warning
    : status === 'latest'
    ? gdevelopTheme.palette.secondary
    : status === 'opened'
    ? gdevelopTheme.statusIndicator.warning
    : gdevelopTheme.statusIndicator.success;
};
