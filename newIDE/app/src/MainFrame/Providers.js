// @flow
import * as React from 'react';
import DragDropContextProvider from '../Utils/DragDropHelpers/DragDropContextProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '../UI/i18n';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { getTheme } from '../UI/Theme';
import UserProfileProvider from '../Profile/UserProfileProvider';
import Authentification from '../Utils/GDevelopServices/Authentification';
import PreferencesProvider from './Preferences/PreferencesProvider';
import PreferencesContext from './Preferences/PreferencesContext';

type Props = {|
  authentification: Authentification,
  children: React$Element<*>,
|};

/**
 * Wrap the children with Drag and Drop, Material UI theme and i18n React providers,
 * so that these modules can be used in the children.
 */
export default class Providers extends React.Component<Props, *> {
  render() {
    const { cmdArguments } = this.props;
    return (
      <DragDropContextProvider>
        <PreferencesProvider cmdArguments={cmdArguments}>
          <PreferencesContext.Consumer>
            {({ values }) => (
              <MuiThemeProvider muiTheme={getTheme(values.themeName)}>
                <I18nextProvider i18n={i18n}>
                  <UserProfileProvider
                    authentification={this.props.authentification}
                  >
                    {this.props.children}
                  </UserProfileProvider>
                </I18nextProvider>
              </MuiThemeProvider>
            )}
          </PreferencesContext.Consumer>
        </PreferencesProvider>
      </DragDropContextProvider>
    );
  }
}
