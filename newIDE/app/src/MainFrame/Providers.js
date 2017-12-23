// @flow
import * as React from 'react';
import DragDropContextProvider from '../Utils/DragDropHelpers/DragDropContextProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '../UI/i18n';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { getTheme } from '../UI/Theme';

type Props = {|
  themeName: string,
  children: React.Node,
|};

/**
 * Wrap the children with Drag and Drop, Material UI theme and i18n React providers,
 * so that these modules can be used in the children.
 */
export default class Providers extends React.Component<Props, *> {
  render() {
    const theme = getTheme(this.props.themeName);

    return (
      <DragDropContextProvider>
        <MuiThemeProvider muiTheme={theme}>
          <I18nextProvider i18n={i18n}>{this.props.children}</I18nextProvider>
        </MuiThemeProvider>
      </DragDropContextProvider>
    );
  }
}
