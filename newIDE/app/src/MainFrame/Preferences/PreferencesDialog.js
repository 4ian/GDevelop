// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import SelectField from '../../UI/SelectField';
import FlatButton from '../../UI/FlatButton';
import SelectOption from '../../UI/SelectOption';
import Toggle from '../../UI/Toggle';
import Dialog from '../../UI/Dialog';
import { Column, Line, Spacer } from '../../UI/Grid';
import { themes } from '../../UI/Theme';
import { getAllThemes } from '../../CodeEditor/Theme';
import Window from '../../Utils/Window';
import PreferencesContext, { allAlertMessages } from './PreferencesContext';
import Text from '../../UI/Text';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { Tabs, Tab } from '../../UI/Tabs';
import RaisedButton from '../../UI/RaisedButton';

type Props = {|
  onClose: Function,
|};

const PreferencesDialog = ({ onClose }: Props) => {
  const [currentTab, setCurrentTab] = React.useState('preferences');
  const {
    values,
    setThemeName,
    setCodeEditorThemeName,
    setAutoDownloadUpdates,
    showAlertMessage,
    setAutoDisplayChangelog,
    setEventsSheetShowObjectThumbnails,
    setAutosaveOnPreview,
    setUseNewInstructionEditorDialog,
    setUseGDJSDevelopmentWatcher,
    setEventsSheetUseAssignmentOperators,
    getDefaultEditorMosaicNode,
    setDefaultEditorMosaicNode,
  } = React.useContext(PreferencesContext);

  return (
    <Dialog
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
      cannotBeDismissed={true}
      open
      title={<Trans>GDevelop Preferences</Trans>}
      maxWidth="sm"
      noMargin
    >
      <Tabs value={currentTab} onChange={setCurrentTab}>
        <Tab label={<Trans>Preferences</Trans>} value="preferences" />
        <Tab label={<Trans>Hints &amp; explanations</Trans>} value="hints" />
      </Tabs>
      {currentTab === 'preferences' && (
        <Column>
          <Text size="title">
            <Trans>Appearance</Trans>
          </Text>
          <ResponsiveLineStackLayout noMargin>
            <SelectField
              floatingLabelText={<Trans>UI Theme</Trans>}
              value={values.themeName}
              onChange={(e, i, value: string) => setThemeName(value)}
              fullWidth
            >
              {Object.keys(themes).map(themeName => (
                <SelectOption
                  value={themeName}
                  primaryText={themeName}
                  key={themeName}
                />
              ))}
            </SelectField>
            <SelectField
              floatingLabelText={<Trans>Code editor Theme</Trans>}
              value={values.codeEditorThemeName}
              onChange={(e, i, value: string) => setCodeEditorThemeName(value)}
              fullWidth
            >
              {getAllThemes().map(codeEditorTheme => (
                <SelectOption
                  value={codeEditorTheme.themeName}
                  primaryText={codeEditorTheme.name}
                  key={codeEditorTheme.themeName}
                />
              ))}
            </SelectField>
          </ResponsiveLineStackLayout>
          <Line noMargin>
            <Text>
              <Trans>You can contribute and create your own themes: </Trans>
            </Text>
            <FlatButton
              label={<Trans>Learn more</Trans>}
              onClick={() => {
                Window.openExternalURL(
                  'https://github.com/4ian/GDevelop/tree/master/newIDE#theming'
                );
              }}
            />
          </Line>
          <Text size="title">
            <Trans>Layouts</Trans>
          </Text>
          <Line>
            <Column>
              <RaisedButton
                label={<Trans>Reset Scene Editor layout</Trans>}
                onClick={() => setDefaultEditorMosaicNode('scene-editor', null)}
                disabled={!getDefaultEditorMosaicNode('scene-editor')}
              />
              <Spacer />
              <RaisedButton
                label={<Trans>Reset Scene Editor (small window) layout</Trans>}
                onClick={() =>
                  setDefaultEditorMosaicNode('scene-editor-small', null)
                }
                disabled={!getDefaultEditorMosaicNode('scene-editor-small')}
              />
              <Spacer />
              <RaisedButton
                label={<Trans>Reset Debugger layout</Trans>}
                onClick={() => setDefaultEditorMosaicNode('debugger', null)}
                disabled={!getDefaultEditorMosaicNode('debugger')}
              />
              <Spacer />
              <RaisedButton
                label={<Trans>Reset Resource Editor layout</Trans>}
                onClick={() =>
                  setDefaultEditorMosaicNode('resources-editor', null)
                }
                disabled={!getDefaultEditorMosaicNode('resources-editor')}
              />
              <Spacer />
              <RaisedButton
                label={<Trans>Reset Extension Editor layout</Trans>}
                onClick={() =>
                  setDefaultEditorMosaicNode(
                    'events-functions-extension-editor',
                    null
                  )
                }
                disabled={
                  !getDefaultEditorMosaicNode(
                    'events-functions-extension-editor'
                  )
                }
              />
            </Column>
          </Line>
          <Text size="title">
            <Trans>Updates</Trans>
          </Text>
          <Line>
            <Toggle
              onToggle={(e, check) => setAutoDownloadUpdates(check)}
              toggled={values.autoDownloadUpdates}
              labelPosition="right"
              label={
                <Trans>Auto download and install updates (recommended)</Trans>
              }
            />
          </Line>
          <Line>
            <Toggle
              onToggle={(e, check) => setAutoDisplayChangelog(check)}
              toggled={values.autoDisplayChangelog}
              labelPosition="right"
              label={
                <Trans>
                  Display What's New when a new version is launched
                  (recommended)
                </Trans>
              }
            />
          </Line>
          <Text size="title">
            <Trans>Events Sheet</Trans>
          </Text>
          <Line>
            <Toggle
              onToggle={(e, check) => setEventsSheetShowObjectThumbnails(check)}
              toggled={values.eventsSheetShowObjectThumbnails}
              labelPosition="right"
              label={<Trans>Display object thumbnails in Events Sheets</Trans>}
            />
          </Line>
          <Line>
            <Toggle
              onToggle={(e, check) =>
                setEventsSheetUseAssignmentOperators(check)
              }
              toggled={values.eventsSheetUseAssignmentOperators}
              labelPosition="right"
              label={
                <Trans>Display assignment operators in Events Sheets</Trans>
              }
            />
          </Line>
          <Line>
            <Toggle
              onToggle={(e, check) => setUseNewInstructionEditorDialog(check)}
              toggled={values.useNewInstructionEditorDialog}
              labelPosition="right"
              label={<Trans>Use the new action/condition editor</Trans>}
            />
          </Line>
          <Text size="title">
            <Trans>Advanced</Trans>
          </Text>
          <Line>
            <Toggle
              onToggle={(e, check) => setAutosaveOnPreview(check)}
              toggled={values.autosaveOnPreview}
              labelPosition="right"
              label={<Trans>Auto-save project on Preview</Trans>}
            />
          </Line>
          {Window.isDev() && (
            <Line>
              <Toggle
                onToggle={(e, check) => setUseGDJSDevelopmentWatcher(check)}
                toggled={values.useGDJSDevelopmentWatcher}
                labelPosition="right"
                label={
                  <Trans>
                    Watch changes in game engine (GDJS) sources and auto import
                    them (dev only)
                  </Trans>
                }
              />
            </Line>
          )}
        </Column>
      )}
      {currentTab === 'hints' && (
        <Column>
          <Line>
            <Column noMargin>
              <Text>
                <Trans>Warn/show explanation about:</Trans>
              </Text>
              {allAlertMessages.map(({ key, label }) => (
                <Line key={key}>
                  <Toggle
                    onToggle={(e, check) => showAlertMessage(key, check)}
                    toggled={!values.hiddenAlertMessages[key]}
                    labelPosition="right"
                    label={label}
                  />
                </Line>
              ))}
            </Column>
          </Line>
        </Column>
      )}
    </Dialog>
  );
};

export default PreferencesDialog;
