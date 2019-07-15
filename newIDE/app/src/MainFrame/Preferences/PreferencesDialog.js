// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import Dialog from '../../UI/Dialog';
import EmptyMessage from '../../UI/EmptyMessage';
import { Column, Line } from '../../UI/Grid';
import { themes } from '../../UI/Theme';
import { getAllThemes } from '../../CodeEditor/Theme';
import Window from '../../Utils/Window';
import PreferencesContext, {
  type AlertMessageIdentifier,
} from './PreferencesContext';

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
            setUseNewInstructionEditorDialog
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
                    onChange={(e, i, value) => setThemeName(value)}
                  >
                    {Object.keys(themes).map(themeName => (
                      <MenuItem
                        value={themeName}
                        primaryText={themeName}
                        key={themeName}
                      />
                    ))}
                  </SelectField>
                  <SelectField
                    floatingLabelText={<Trans>Code editor Theme</Trans>}
                    value={values.codeEditorThemeName}
                    onChange={(e, i, value) => setCodeEditorThemeName(value)}
                  >
                    {getAllThemes().map(codeEditorTheme => (
                      <MenuItem
                        value={codeEditorTheme.themeName}
                        primaryText={codeEditorTheme.name}
                        key={codeEditorTheme.themeName}
                      />
                    ))}
                  </SelectField>
                </Line>
                <Line noMargin>
                  <p>
                    You can contribute and create your own themes:{' '}
                    <FlatButton
                      label={<Trans>Learn more</Trans>}
                      onClick={this.createTheme}
                    />{' '}
                  </p>
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
                    onToggle={(e, check) => setUseNewInstructionEditorDialog(check)}
                    toggled={values.useNewInstructionEditorDialog}
                    labelPosition="right"
                    label={<Trans>Use the new action/condition editor</Trans>}
                  />
                </Line>
                <Line>
                  {dismissedAlertMessages.length ? (
                    <Column noMargin>
                      <p>
                        <Trans>
                          You have dismissed some hints. Click to enable them
                          again:
                        </Trans>
                      </p>
                      {dismissedAlertMessages.map(name => (
                        <FlatButton
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
