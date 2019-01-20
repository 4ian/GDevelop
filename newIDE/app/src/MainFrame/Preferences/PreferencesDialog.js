// @flow

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
      <FlatButton label="Close" primary={false} onClick={onClose} />,
    ];

    return (
      <Dialog
        actions={actions}
        onRequestClose={onClose}
        open={open}
        title="GDevelop preferences"
      >
        <PreferencesContext.Consumer>
          {({
            values,
            setThemeName,
            setCodeEditorThemeName,
            setAutoDownloadUpdates,
            showAlertMessage,
            setAutoDisplayChangelog,
          }) => {
            const dismissedAlertMessages = getDismissedAlertMessages(
              values.hiddenAlertMessages
            );

            return (
              <Column noMargin>
                <Line noMargin>
                  <SelectField
                    floatingLabelText={'UI Theme'}
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
                    floatingLabelText={'Code editor Theme'}
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
                    <FlatButton label="Learn more" onClick={this.createTheme} />{' '}
                  </p>
                </Line>
                <Line>
                  <Toggle
                    onToggle={(e, check) => setAutoDownloadUpdates(check)}
                    toggled={values.autoDownloadUpdates}
                    labelPosition="right"
                    label="Auto download and install updates (recommended)"
                  />
                </Line>
                <Line>
                  <Toggle
                    onToggle={(e, check) => setAutoDisplayChangelog(check)}
                    toggled={values.autoDisplayChangelog}
                    labelPosition="right"
                    label="Display What's New when a new version is launched (recommended)"
                  />
                </Line>
                <Line>
                  {dismissedAlertMessages.length ? (
                    <Column noMargin>
                      <p>
                        You have dismissed some hints. Click to enable them
                        again:
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
                      If you dismiss some hints, they will be shown here in case
                      you want to enable them again.
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
