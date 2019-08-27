// @flow
import { createMuiTheme, darken, lighten } from '@material-ui/core/styles';
import './Mosaic.css';
import './EventsSheet.css';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table
import './Table.css';
import './Markdown.css';

const gdevelopPurple = '#9100ce';
const gdevelopLightBlue = '#4ab0e4';

const systemSelectionColor = '#4c92ff'; //OS X selection

/**
 * The background color of the main window
 */
const backgroundColor = '#f7f7f7';

/**
 * The background color of the "papers", "dialogs", etc...
 */
const canvasColor = '#f0f0f0';

// GDevelop specific variables:
const gdevelopTheme = {
  palette: {
    canvasColor,
  },
  toolbar: {
    backgroundColor: backgroundColor,
    separatorColor: '#cecece',
  },
  closableTabs: {
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: backgroundColor,
    textColor: '#878787',
    selectedBackgroundColor: gdevelopLightBlue,
    selectedTextColor: '#ffffff',
    height: 32,
    closeButtonWidth: 24,
  },
  imageThumbnail: {
    selectedBorderColor: systemSelectionColor,
  },
  list: {
    itemsBackgroundColor: '#FFFFFF',
  },
  listItem: {
    groupBackgroundColor: backgroundColor,
    groupTextColor: 'rgba(0,0,0,0.54)',
    deprecatedGroupTextColor: 'rgba(0,0,0,0.30)',
    separatorColor: '#e0e0e0',
    selectedBackgroundColor: systemSelectionColor,
    selectedTextColor: '#ffffff',
    errorTextColor: '#ff2e16',
    warningTextColor: '#ffb032',
    selectedErrorBackgroundColor: '#ff2e16',
    selectedWarningBackgroundColor: '#ffb032',
  },
  emptyMessage: {
    shadowColor: '#FFFFFF',
  },
  logo: {
    src: 'res/GD-logo-big.png',
  },
  mosaicRootClassName: 'mosaic-gd-default-theme', // See Mosaic.css
  eventsSheetRootClassName: 'gd-events-sheet-default-theme', // See EventsSheet.css
  tableRootClassName: 'gd-table-default-theme', // See Table.css
  markdownRootClassName: 'gd-markdown-default-theme', // See Markdown.css
  gdevelopIconsCSSFilter: '',
};

// Theme for Material-UI components
const muiTheme = createMuiTheme({
  palette: {
    type: 'light',
    common: { black: 'rgba(110, 42, 42, 1)', white: '#fff' },
    background: {
      paper: canvasColor,
      default: backgroundColor,
    },
    primary: {
      light: lighten(gdevelopLightBlue, 0.05),
      main: gdevelopLightBlue,
      dark: darken(gdevelopLightBlue, 0.05),
      contrastText: '#fff',
    },
    secondary: {
      light: lighten(gdevelopPurple, 0.05),
      main: gdevelopPurple,
      dark: darken(gdevelopPurple, 0.05),
      contrastText: '#fff',
    },
  },
  overrides: {
    MuiInput: {
      underline: {
        '&:before': {
          borderBottom: `1px solid #BBBBBB`,
        },
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: gdevelopPurple,
      },
    },
    MuiIconButton: {
      root: {
        // Fix color being grey if not set to (almost) black
        color: '#111',
      },
    },
    MuiListItemIcon: {
      root: {
        // Fix color being grey if not set to (almost) black
        color: '#111',
      },
    },
    // Use a more visible color scheme for tabs:
    MuiTabs: {
      root: {
        backgroundColor: gdevelopLightBlue,
      },
    },
    MuiTab: {
      textColorPrimary: {
        color: '#fff !important',
      },
    },
    MuiButtonBase: {
      root: {
        // Remove the web-ish "pointer" (hand) cursor from buttons
        cursor: 'default',
      },
    },
  },
});

const theme = {
  gdevelopTheme,
  muiTheme,
};
export type Theme = $Exact<typeof theme>;
export default theme;
