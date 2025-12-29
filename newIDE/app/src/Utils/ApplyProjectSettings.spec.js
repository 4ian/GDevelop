// @flow
import { applyProjectSettings } from './ApplyProjectSettings';
import { type ProjectSettings } from './ProjectSettingsReader';

const createMockPreferences = () => ({
  setShowCreateSectionByDefault: jest.fn(),
  setAutoOpenMostRecentProject: jest.fn(),
  setAutosaveOnPreview: jest.fn(),
  setFetchPlayerTokenForPreviewAutomatically: jest.fn(),
  setOpenDiagnosticReportAutomatically: jest.fn(),
  setPreviewCrashReportUploadLevel: jest.fn(),
  setTakeScreenshotOnPreview: jest.fn(),
  setIsMenuBarHiddenInPreview: jest.fn(),
  setIsAlwaysOnTopInPreview: jest.fn(),
  setUseShortcutToClosePreviewWindow: jest.fn(),
  setShowBasicProfilingCounters: jest.fn(),
  setUse3DEditor: jest.fn(),
  setShowAiAskButtonInTitleBar: jest.fn(),
  setAutomaticallyUseCreditsForAiRequests: jest.fn(),
  setDisplaySaveReminder: jest.fn(),
  setShowExperimentalExtensions: jest.fn(),
  setShowDeprecatedInstructionWarning: jest.fn(),
  setWatchProjectFolderFilesForLocalProjects: jest.fn(),
  setShowInAppTutorialDeveloperMode: jest.fn(),
  setUseGDJSDevelopmentWatcher: jest.fn(),
});

describe('ApplyProjectSettings', () => {
  describe('applyProjectSettings', () => {
    test('does nothing with empty settings', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = {};

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      Object.values(mockPreferences).forEach(mockFn => {
        expect(mockFn).not.toHaveBeenCalled();
      });
    });

    test('applies showCreateSectionByDefault setting', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = { showCreateSectionByDefault: true };

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      expect(
        mockPreferences.setShowCreateSectionByDefault
      ).toHaveBeenCalledWith(true);
    });

    test('applies autoOpenMostRecentProject setting', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = { autoOpenMostRecentProject: false };

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      expect(mockPreferences.setAutoOpenMostRecentProject).toHaveBeenCalledWith(
        false
      );
    });

    test('applies autosaveOnPreview setting', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = { autosaveOnPreview: true };

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      expect(mockPreferences.setAutosaveOnPreview).toHaveBeenCalledWith(true);
    });

    test('applies sendCrashReports setting with correct level', () => {
      const mockPreferences = createMockPreferences();

      // Test with true
      // $FlowFixMe - mock preferences
      applyProjectSettings({ sendCrashReports: true }, mockPreferences);
      expect(
        mockPreferences.setPreviewCrashReportUploadLevel
      ).toHaveBeenCalledWith('exclude-javascript-code-events');

      mockPreferences.setPreviewCrashReportUploadLevel.mockClear();

      // Test with false
      // $FlowFixMe - mock preferences
      applyProjectSettings({ sendCrashReports: false }, mockPreferences);
      expect(
        mockPreferences.setPreviewCrashReportUploadLevel
      ).toHaveBeenCalledWith('none');
    });

    test('applies displaySaveReminder setting with correct format', () => {
      const mockPreferences = createMockPreferences();

      // $FlowFixMe - mock preferences
      applyProjectSettings({ displaySaveReminder: true }, mockPreferences);
      expect(mockPreferences.setDisplaySaveReminder).toHaveBeenCalledWith({
        activated: true,
      });

      mockPreferences.setDisplaySaveReminder.mockClear();

      // $FlowFixMe - mock preferences
      applyProjectSettings({ displaySaveReminder: false }, mockPreferences);
      expect(mockPreferences.setDisplaySaveReminder).toHaveBeenCalledWith({
        activated: false,
      });
    });

    test('applies use3DEditor setting', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = { use3DEditor: false };

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      expect(mockPreferences.setUse3DEditor).toHaveBeenCalledWith(false);
    });

    test('applies showDeprecatedInstructionWarning setting', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = {
        showDeprecatedInstructionWarning: true,
      };

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      expect(
        mockPreferences.setShowDeprecatedInstructionWarning
      ).toHaveBeenCalledWith(true);
    });

    test('applies multiple settings at once', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = {
        autosaveOnPreview: true,
        use3DEditor: false,
        showExperimentalExtensions: true,
        useGDJSDevelopmentWatcher: false,
      };

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      expect(mockPreferences.setAutosaveOnPreview).toHaveBeenCalledWith(true);
      expect(mockPreferences.setUse3DEditor).toHaveBeenCalledWith(false);
      expect(
        mockPreferences.setShowExperimentalExtensions
      ).toHaveBeenCalledWith(true);
      expect(mockPreferences.setUseGDJSDevelopmentWatcher).toHaveBeenCalledWith(
        false
      );
    });

    test('applies all preview settings', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = {
        autosaveOnPreview: true,
        fetchPlayerTokenForPreviewAutomatically: false,
        openDiagnosticReportAutomatically: true,
        sendCrashReports: false,
        takeScreenshotOnPreview: true,
        isMenuBarHiddenInPreview: false,
        isAlwaysOnTopInPreview: true,
        useShortcutToClosePreviewWindow: false,
      };

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      expect(mockPreferences.setAutosaveOnPreview).toHaveBeenCalledWith(true);
      expect(
        mockPreferences.setFetchPlayerTokenForPreviewAutomatically
      ).toHaveBeenCalledWith(false);
      expect(
        mockPreferences.setOpenDiagnosticReportAutomatically
      ).toHaveBeenCalledWith(true);
      expect(
        mockPreferences.setPreviewCrashReportUploadLevel
      ).toHaveBeenCalledWith('none');
      expect(mockPreferences.setTakeScreenshotOnPreview).toHaveBeenCalledWith(
        true
      );
      expect(mockPreferences.setIsMenuBarHiddenInPreview).toHaveBeenCalledWith(
        false
      );
      expect(mockPreferences.setIsAlwaysOnTopInPreview).toHaveBeenCalledWith(
        true
      );
      expect(
        mockPreferences.setUseShortcutToClosePreviewWindow
      ).toHaveBeenCalledWith(false);
    });

    test('applies contributor and developer options', () => {
      const mockPreferences = createMockPreferences();
      const settings: ProjectSettings = {
        showInAppTutorialDeveloperMode: true,
        useGDJSDevelopmentWatcher: true,
      };

      // $FlowFixMe - mock preferences
      applyProjectSettings(settings, mockPreferences);

      expect(
        mockPreferences.setShowInAppTutorialDeveloperMode
      ).toHaveBeenCalledWith(true);
      expect(mockPreferences.setUseGDJSDevelopmentWatcher).toHaveBeenCalledWith(
        true
      );
    });
  });
});
