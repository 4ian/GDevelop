// @flow
import { type ProjectSettings } from './ProjectSettingsReader';
import { type Preferences } from '../MainFrame/Preferences/PreferencesContext';

/**
 * Applies project-specific settings from a settings.ini file to the editor preferences.
 * This allows projects to override certain editor preferences when they are opened.
 *
 * @param settings - The parsed project settings from settings.ini
 * @param preferences - The preferences context with setters
 */
export const applyProjectSettings = (
  settings: ProjectSettings,
  preferences: Preferences
): void => {
  // At launch settings
  if (typeof settings.showCreateSectionByDefault === 'boolean') {
    preferences.setShowCreateSectionByDefault(
      settings.showCreateSectionByDefault
    );
  }
  if (typeof settings.autoOpenMostRecentProject === 'boolean') {
    preferences.setAutoOpenMostRecentProject(
      settings.autoOpenMostRecentProject
    );
  }

  // Preview settings
  if (typeof settings.autosaveOnPreview === 'boolean') {
    preferences.setAutosaveOnPreview(settings.autosaveOnPreview);
  }
  if (typeof settings.fetchPlayerTokenForPreviewAutomatically === 'boolean') {
    preferences.setFetchPlayerTokenForPreviewAutomatically(
      settings.fetchPlayerTokenForPreviewAutomatically
    );
  }
  if (typeof settings.openDiagnosticReportAutomatically === 'boolean') {
    preferences.setOpenDiagnosticReportAutomatically(
      settings.openDiagnosticReportAutomatically
    );
  }
  if (typeof settings.sendCrashReports === 'boolean') {
    preferences.setPreviewCrashReportUploadLevel(
      settings.sendCrashReports ? 'exclude-javascript-code-events' : 'none'
    );
  }
  if (typeof settings.takeScreenshotOnPreview === 'boolean') {
    preferences.setTakeScreenshotOnPreview(settings.takeScreenshotOnPreview);
  }
  if (typeof settings.isMenuBarHiddenInPreview === 'boolean') {
    preferences.setIsMenuBarHiddenInPreview(settings.isMenuBarHiddenInPreview);
  }
  if (typeof settings.isAlwaysOnTopInPreview === 'boolean') {
    preferences.setIsAlwaysOnTopInPreview(settings.isAlwaysOnTopInPreview);
  }
  if (typeof settings.useShortcutToClosePreviewWindow === 'boolean') {
    preferences.setUseShortcutToClosePreviewWindow(
      settings.useShortcutToClosePreviewWindow
    );
  }

  // Scene editor settings
  if (typeof settings.showBasicProfilingCounters === 'boolean') {
    preferences.setShowBasicProfilingCounters(
      settings.showBasicProfilingCounters
    );
  }
  if (typeof settings.use3DEditor === 'boolean') {
    preferences.setUse3DEditor(settings.use3DEditor);
  }

  // Other settings
  if (typeof settings.showAiAskButtonInTitleBar === 'boolean') {
    preferences.setShowAiAskButtonInTitleBar(
      settings.showAiAskButtonInTitleBar
    );
  }
  if (typeof settings.automaticallyUseCreditsForAiRequests === 'boolean') {
    preferences.setAutomaticallyUseCreditsForAiRequests(
      settings.automaticallyUseCreditsForAiRequests
    );
  }
  if (typeof settings.displaySaveReminder === 'boolean') {
    preferences.setDisplaySaveReminder({
      activated: settings.displaySaveReminder,
    });
  }
  if (typeof settings.showExperimentalExtensions === 'boolean') {
    preferences.setShowExperimentalExtensions(
      settings.showExperimentalExtensions
    );
  }
  if (typeof settings.showDeprecatedInstructionWarning === 'boolean') {
    preferences.setShowDeprecatedInstructionWarning(
      settings.showDeprecatedInstructionWarning
    );
  }
  if (typeof settings.watchProjectFolderFilesForLocalProjects === 'boolean') {
    preferences.setWatchProjectFolderFilesForLocalProjects(
      settings.watchProjectFolderFilesForLocalProjects
    );
  }

  // Contributor options
  if (typeof settings.showInAppTutorialDeveloperMode === 'boolean') {
    preferences.setShowInAppTutorialDeveloperMode(
      settings.showInAppTutorialDeveloperMode
    );
  }

  // Developer options
  if (typeof settings.useGDJSDevelopmentWatcher === 'boolean') {
    preferences.setUseGDJSDevelopmentWatcher(
      settings.useGDJSDevelopmentWatcher
    );
  }
};
