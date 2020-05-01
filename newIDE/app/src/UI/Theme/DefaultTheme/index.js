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

// Use the fonts provided by the operating system(s) as possible.
// If you update this font list, be sure to do it in all the other places using fonts in the codebase.
const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, 'Helvetica Neue', Helvetica, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

/**
 * The background color of the main window
 */
const backgroundColor = '#f7f7f7';

/**
 * The background color of the "papers", "dialogs", etc...
 */
const canvasColor = '#f0f0f0';

/**
 * The alternate background color, for some lists or search box,
 * to distinguish them from other content.
 */
const alternateCanvasColor = '#ffffff';

// GDevelop specific variables:
const gdevelopTheme = {
  palette: {
    canvasColor,
  },
  message: {
    warning: '#ffa500',
    error: '#f00',
    valid: '#00aa00',
  },
  toolbar: {
    backgroundColor: backgroundColor,
    separatorColor: '#cecece',
  },
  closableTabs: {
    fontFamily,
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
    itemsBackgroundColor: alternateCanvasColor,
  },
  searchBar: {
    backgroundColor: alternateCanvasColor,
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
  typography: {
    fontFamily,
  },
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
    MuiTypography: {
      h6: {
        // Make h6, used in Drawer title bars, use the same weight as tabs and mosaic windows
        fontWeight: 400,
      },
    },
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
      // Remove the web-ish "pointer" (hand) cursor from buttons
      root: {
        cursor: 'default',
      },
    },
    // Use non rounded buttons
    MuiButton: {
      root: {
        borderRadius: 0,
        fontWeight: 400, // Lower a bit the weight of buttons
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
