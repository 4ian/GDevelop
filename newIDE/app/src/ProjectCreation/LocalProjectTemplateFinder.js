// @flow
// Note: kept dependency-light (like LocalGDJSFinder) so it can run in the
// Electron renderer with @electron/remote. Locates the bundled
// "gd-project-template" folder both in development and in the packaged binary.
import optionalRequire from '../Utils/OptionalRequire';

const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const process = optionalRequire('process');
const isDarwin = !!process && /^darwin/.test(process.platform);

const canRead = (candidate: string): boolean => {
  try {
    fs.accessSync(candidate, fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Find the bundled empty-project template folder ("gd-project-template").
 * Returns the absolute path, or null if not found / not running in Electron.
 *
 * Mirrors the resolution strategy of LocalGDJSFinder.findGDJS so it works in:
 * - a packaged app (template shipped as an extraResource next to GDJS), and
 * - development with Electron (read from app/resources/gd-project-template).
 */
export const findLocalProjectTemplatePath = (): string | null => {
  if (!path || !process || !fs || !app) return null;

  const appPath = app.getAppPath();
  // The app path is [...]/*.app/Contents/Resources/app.asar on macOS
  // and [...]/resources/app.asar on other OSes.

  const candidates = [
    // Packaged app: extraResources land next to the app.asar (in Resources/),
    // i.e. at <appPath>/../gd-project-template.
    path.join(appPath, '..', 'gd-project-template'),
    // Development with Electron: app/resources/gd-project-template.
    path.join(appPath, '..', '..', 'app', 'resources', 'gd-project-template'),
    // Standalone newIDE next to the IDE resources.
    path.join(
      appPath,
      isDarwin ? '../../../../' : path.join('..', '..'),
      'gd-project-template'
    ),
  ];

  for (const candidate of candidates) {
    if (canRead(path.join(candidate, 'AGENTS.md')) || canRead(candidate)) {
      return candidate;
    }
  }
  return null;
};
