// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import SelectField from '../../UI/SelectField';
import FlatButton from '../../UI/FlatButton';
import SelectOption from '../../UI/SelectOption';
import Toggle from '../../UI/Toggle';
import Dialog from '../../UI/Dialog';
import EmptyMessage from '../../UI/EmptyMessage';
import { Column, Line } from '../../UI/Grid';
import { themes } from '../../UI/Theme';
import { getAllThemes } from '../../CodeEditor/Theme';
import Window from '../../Utils/Window';
import PreferencesContext, {
  type AlertMessageIdentifier,
} from './PreferencesContext';
import Text from '../../UI/Text';

type Props = {|
  open: boolean,
  onClose: Function,
|};

type State = {||};

const getDismissedAlertMessages = (identifiers: {
  [AlertMessageIdentifier]: boolean,
}): Array<AlertMessageIdentifier> => {
  return Object.keys(identifiers)
    .map(identifier => {
      return identifiers[identifier] ? identifier : null;
    })
    .filter(Boolean);
};

export default class PreferencesDialog extends Component<Props, State> {
  createTheme() {
    Window.openExternalURL(
      'https://github.com/4ian/GDevelop/tree/master/newIDE#theming'
    );
  }

  render() {
    const { open, onClose } = this.props;
    const actions = [
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={false}
        onClick={onClose}
      />,
    ];

    return (
      <Dialog
        actions={actions}
        onRequestClose={onClose}
        open={open}
        title={<Trans>GDevelop preferences</Trans>}
      >
        <PreferencesContext.Consumer>
          {({
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
          }) => {
            const dismissedAlertMessages = getDismissedAlertMessages(
              values.hiddenAlertMessages
            );

            return (
              <Column noMargin>
                <Line noMargin>
                  <SelectField
                    floatingLabelText={<Trans>UI Theme</Trans>}
                    value={values.themeName}
                    onChange={(e, i, value: string) => setThemeName(value)}
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
                    onChange={(e, i, value: string) =>
                      setCodeEditorThemeName(value)
                    }
                  >
                    {getAllThemes().map(codeEditorTheme => (
                      <SelectOption
                        value={codeEditorTheme.themeName}
                        primaryText={codeEditorTheme.name}
                        key={codeEditorTheme.themeName}
                      />
                    ))}
                  </SelectField>
                </Line>
                <Line noMargin>
                  <Text>
                    You can contribute and create your own themes:{' '}
                    <FlatButton
                      label={<Trans>Learn more</Trans>}
                      onClick={this.createTheme}
                    />{' '}
                  </Text>
                </Line>
                <Line>
                  <Toggle
                    onToggle={(e, check) => setAutoDownloadUpdates(check)}
                    toggled={values.autoDownloadUpdates}
                    labelPosition="right"
                    label={
                      <Trans>
                        Auto download and install updates (recommended)
                      </Trans>
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
                <Line>
                  <Toggle
                    onToggle={(e, check) =>
                      setEventsSheetShowObjectThumbnails(check)
                    }
                    toggled={values.eventsSheetShowObjectThumbnails}
                    labelPosition="right"
                    label={
                      <Trans>Display object thumbnails in Events Sheets</Trans>
                    }
                  />
                </Line>
                <Line>
                  <Toggle
                    onToggle={(e, check) => setAutosaveOnPreview(check)}
                    toggled={values.autosaveOnPreview}
                    labelPosition="right"
                    label={<Trans>Auto-save project on Preview</Trans>}
                  />
                </Line>
                <Line>
                  <Toggle
                    onToggle={(e, check) =>
                      setUseNewInstructionEditorDialog(check)
                    }
                    toggled={values.useNewInstructionEditorDialog}
                    labelPosition="right"
                    label={<Trans>Use the new action/condition editor</Trans>}
                  />
                </Line>
                {Window.isDev() && (
                  <Line>
                    <Toggle
                      onToggle={(e, check) =>
                        setUseGDJSDevelopmentWatcher(check)
                      }
                      toggled={values.useGDJSDevelopmentWatcher}
                      labelPosition="right"
                      label={
                        <Trans>
                          Watch changes in game engine (GDJS) sources and auto
                          import them (dev only)
                        </Trans>
                      }
                    />
                  </Line>
                )}
                <Line>
                  {dismissedAlertMessages.length ? (
                    <Column noMargin>
                      <Text>
                        <Trans>
                          You have dismissed some hints. Click to enable them
                          again:
                        </Trans>
                      </Text>
                      {dismissedAlertMessages.map(name => (
                        <FlatButton
                          key={name}
                          label={name}
                          onClick={() => showAlertMessage(name, true)}
                        />
                      ))}
                    </Column>
                  ) : (
                    <EmptyMessage>
                      <Trans>
                        If you dismiss some hints, they will be shown here in
                        case you want to enable them again.
                      </Trans>
                    </EmptyMessage>
                  )}
                </Line>
              </Column>
            );
          }}
        </PreferencesContext.Consumer>
      </Dialog>
    );
  }
}
