// @flow
import * as React from 'react';
import DragDropContextProvider from '../Utils/DragDropHelpers/DragDropContextProvider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { getTheme } from '../UI/Theme';
import UserProfileProvider from '../Profile/UserProfileProvider';
import Authentification from '../Utils/GDevelopServices/Authentification';
import PreferencesProvider from './Preferences/PreferencesProvider';
import PreferencesContext from './Preferences/PreferencesContext';
import GDI18nProvider from '../Utils/i18n/GDI18nProvider';

type Props = {|
  authentification: Authentification,
  children: React$Element<*>,
  disableCheckForUpdates: boolean,
|};

/**
 * Wrap the children with Drag and Drop, Material UI theme and i18n React providers,
 * so that these modules can be used in the children.
 */
export default class Providers extends React.Component<Props, {||}> {
  render() {
    const { disableCheckForUpdates, authentification, children } = this.props;
    return (
      <DragDropContextProvider>
        <PreferencesProvider disableCheckForUpdates={disableCheckForUpdates}>
          <PreferencesContext.Consumer>
            {({ values }) => (
              <GDI18nProvider language="fr">
                <MuiThemeProvider muiTheme={getTheme(values.themeName)}>
                  <UserProfileProvider authentification={authentification}>
                    {children}
                  </UserProfileProvider>
                </MuiThemeProvider>
              </GDI18nProvider>
            )}
          </PreferencesContext.Consumer>
        </PreferencesProvider>
      </DragDropContextProvider>
    );
  }
}
