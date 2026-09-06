// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import alertDecorator from '../../AlertDecorator';
import PreferencesDialog, {
  type PreferencesSectionName,
  type PreferencesTabName,
} from '../../../MainFrame/Preferences/PreferencesDialog';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
} from '../../../MainFrame/Preferences/PreferencesContext';
import { type ShortcutMap } from '../../../KeyboardShortcuts/DefaultShortcuts';
import defaultShortcuts from '../../../KeyboardShortcuts/DefaultShortcuts';
import { type CommandName } from '../../../CommandPalette/CommandsList';

export default {
  title: 'Preferences/PreferencesDialog',
  component: PreferencesDialog,
  decorators: [paperDecorator, alertDecorator],
};

/**
 * A preferences provider holding the values in a local state, so that the
 * toggles, select fields and shortcuts react to the changes made in the story,
 * without persisting anything.
 */
const StatefulPreferencesProvider = ({
  initialUserShortcutMap,
  children,
}: {|
  initialUserShortcutMap: ShortcutMap,
  children: React.Node,
|}) => {
  const [values, setValues] = React.useState({
    ...initialPreferences.values,
    userShortcutMap: initialUserShortcutMap,
  });

  const setValue = (name: string, value: any) => {
    action('Set preference')(name, value);
    setValues(previousValues => ({ ...previousValues, [name]: value }));
  };

  const setShortcutForCommand = (
    commandName: CommandName,
    shortcut: string
  ) => {
    action('Set shortcut')(commandName, shortcut);
    setValues(previousValues => {
      const userShortcutMap = { ...previousValues.userShortcutMap };
      if (shortcut === (defaultShortcuts[commandName] || '')) {
        // Same behavior as the real provider: a shortcut set back to its
        // default value is removed from the user map.
        delete userShortcutMap[commandName];
      } else {
        userShortcutMap[commandName] = shortcut;
      }
      return { ...previousValues, userShortcutMap };
    });
  };

  const preferences: Preferences = {
    // $FlowFixMe[incompatible-type] - only the setters used by the dialog are overridden.
    ...initialPreferences,
    // $FlowFixMe[incompatible-type]
    values,
    setThemeName: value => setValue('themeName', value),
    setCodeEditorThemeName: value => setValue('codeEditorThemeName', value),
    setAutoDownloadUpdates: value => setValue('autoDownloadUpdates', value),
    setAutoDisplayChangelog: value => setValue('autoDisplayChangelog', value),
    setEventsSheetShowObjectThumbnails: value =>
      setValue('eventsSheetShowObjectThumbnails', value),
    setEventsSheetUseAssignmentOperators: value =>
      setValue('eventsSheetUseAssignmentOperators', value),
    setEventsSheetIndentScale: value =>
      setValue('eventsSheetIndentScale', value),
    setEventsSheetCancelInlineParameter: value =>
      setValue('eventsSheetCancelInlineParameter', value),
    setAutosaveOnPreview: value => setValue('autosaveOnPreview', value),
    setAutoOpenMostRecentProject: value =>
      setValue('autoOpenMostRecentProject', value),
    setShowCreateSectionByDefault: value =>
      setValue('showCreateSectionByDefault', value),
    setBackdropClickBehavior: value => setValue('backdropClickBehavior', value),
    setShowExperimentalExtensions: value =>
      setValue('showExperimentalExtensions', value),
    setShowInAppTutorialDeveloperMode: value =>
      setValue('showInAppTutorialDeveloperMode', value),
    setOpenDiagnosticReportAutomatically: value =>
      setValue('openDiagnosticReportAutomatically', value),
    setBlockPreviewAndExportOnDiagnosticErrors: value =>
      setValue('blockPreviewAndExportOnDiagnosticErrors', value),
    setShowDeprecatedInstructionWarning: value =>
      setValue('showDeprecatedInstructionWarning', value),
    setUse3DEditor: value => setValue('use3DEditor', value),
    setShowBasicProfilingCounters: value =>
      setValue('showBasicProfilingCounters', value),
    setDisplaySaveReminder: value => setValue('displaySaveReminder', value),
    setFetchPlayerTokenForPreviewAutomatically: value =>
      setValue('fetchPlayerTokenForPreviewAutomatically', value),
    setPreviewCrashReportUploadLevel: value =>
      setValue('previewCrashReportUploadLevel', value),
    setTakeScreenshotOnPreview: value =>
      setValue('takeScreenshotOnPreview', value),
    setShowAiAskButtonInTitleBar: value =>
      setValue('showAiAskButtonInTitleBar', value),
    setAutomaticallyUseCreditsForAiRequests: value =>
      setValue('automaticallyUseCreditsForAiRequests', value),
    setUseBackgroundSerializerForSaving: value =>
      setValue('useBackgroundSerializerForSaving', value),
    setShowJsTypeError: value => setValue('showJsTypeError', value),
    setShortcutForCommand,
    resetShortcutsToDefault: () => {
      action('Reset all shortcuts')();
      setValues(previousValues => ({ ...previousValues, userShortcutMap: {} }));
    },
  };

  return (
    <PreferencesContext.Provider value={preferences}>
      {children}
    </PreferencesContext.Provider>
  );
};

const PreferencesDialogStory = ({
  initialTab,
  initialSection,
  initialUserShortcutMap = {},
}: {|
  initialTab?: PreferencesTabName,
  initialSection?: PreferencesSectionName,
  initialUserShortcutMap?: ShortcutMap,
|}) => (
  <StatefulPreferencesProvider initialUserShortcutMap={initialUserShortcutMap}>
    <I18n>
      {({ i18n }) => (
        <PreferencesDialog
          i18n={i18n}
          initialTab={initialTab}
          initialSection={initialSection}
          onClose={action('onClose')}
          onOpenQuickCustomizationDialog={action(
            'onOpenQuickCustomizationDialog'
          )}
        />
      )}
    </I18n>
  </StatefulPreferencesProvider>
);

const customizedUserShortcutMap: ShortcutMap = {
  // Modified shortcut: displays the reset button.
  SAVE_PROJECT: 'CmdOrCtrl+Shift+KeyS',
  // Removed shortcut: displays "No shortcut" and the reset button.
  LAUNCH_NEW_PREVIEW: '',
  // Clashing shortcuts: both display a warning naming the other command.
  OPEN_OBJECTS_PANEL: 'KeyG',
  // Shortcut given to a command without a default one.
  OPEN_PROJECT_PROPERTIES: 'Alt+KeyP',
};

export const Default = (): React.Node => <PreferencesDialogStory />;

export const EventsSheetSection = (): React.Node => (
  <PreferencesDialogStory initialSection="events-sheet" />
);

export const KeyboardShortcutsSection = (): React.Node => (
  <PreferencesDialogStory
    initialTab="shortcuts"
    initialUserShortcutMap={customizedUserShortcutMap}
  />
);

export const Mobile = (): React.Node => <PreferencesDialogStory />;
Mobile.parameters = {
  viewport: { defaultViewport: 'mobile1' },
};

export const MobileKeyboardShortcutsSection = (): React.Node => (
  <PreferencesDialogStory
    initialTab="shortcuts"
    initialUserShortcutMap={customizedUserShortcutMap}
  />
);
MobileKeyboardShortcutsSection.parameters = {
  viewport: { defaultViewport: 'mobile1' },
};
