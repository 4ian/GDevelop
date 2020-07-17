// @flow
import { type Theme } from '../DefaultTheme';
import { createMuiTheme, darken, lighten } from '@material-ui/core/styles';
import './Mosaic.css';
import './EventsSheet.css';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table
import './Table.css';
import './Markdown.css';

const almostWhite = '#1E1E3F';
const lightWhite = '#DDD';
const notSoWhite = '#CCC';
const shadesofPurple1 = '#FAD000';

// Use the fonts provided by the operating system(s) as possible.
// If you update this font list, be sure to do it in all the other places using fonts in the codebase.
const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, 'Helvetica Neue', Helvetica, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

const systemSelectionColor = '#047AA6'; //OS X selection

/**
 * The background color of the main window
 */
const backgroundColor = '#28284E';

/**
 * The background color of the "papers", "dialogs", etc...
 */
const canvasColor = '#222244';

/**
 * The alternate background color, for some lists or search box,
 * to distinguish them from other content.
 */
const alternateCanvasColor = '#2D2B55';

// GDevelop specific variables:
const gdevelopTheme = {
  palette: {
    canvasColor,
  },
  message: {
    warning: '#ffa500',
    error: '#f00',
    valid: '#00db00',
  },
  toolbar: {
    backgroundColor: backgroundColor,
    separatorColor: '#222244',
  },
  closableTabs: {
    fontFamily,
    containerBackgroundColor: backgroundColor,
    backgroundColor: canvasColor,
    textColor: '#878787',
    selectedBackgroundColor: shadesofPurple1,
    selectedTextColor: almostWhite,
    width: 400,
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
    groupTextColor: '#AAA',
    deprecatedGroupTextColor: '#888',
    separatorColor: alternateCanvasColor,
    selectedBackgroundColor: systemSelectionColor,
    selectedTextColor: almostWhite,
    rightIconColor: '#fff',
    selectedRightIconColor: '#fff',
    errorTextColor: '#ff2e16',
    warningTextColor: '#ffb032',
    selectedErrorBackgroundColor: '#ff2e16',
    selectedWarningBackgroundColor: '#ffb032',
  },
  emptyMessage: {
    shadowColor: '#000',
  },
  logo: {
    src: 'res/GD-logo-big.png',
  },
  mosaicRootClassName: 'mosaic-gd-Shades-of-Purple-theme', // See Mosaic.css
  eventsSheetRootClassName: 'gd-events-sheet-Shades-of-Purple-theme', // See EventsSheet.css
  tableRootClassName: 'gd-table-Shades-of-Purple-theme', // See Table.css
  markdownRootClassName: 'gd-markdown-Shades-of-Purple-theme', // See Markdown.css
  gdevelopIconsCSSFilter: 'hue-rotate(10deg) saturate(100%) brightness(100%)',
};

// Theme for Material-UI components
const muiTheme = createMuiTheme({
  typography: {
    fontFamily,
  },
  palette: {
    type: 'dark',
    common: { black: 'rgba(110, 42, 42, 1)', white: '#fff' },
    background: {
      paper: canvasColor,
      default: backgroundColor,
    },
    primary: {
      light: lighten(shadesofPurple1, 0.05),
      main: shadesofPurple1,
      dark: darken(shadesofPurple1, 0.05),
      contrastText: '#1E1E3F',
    },
    secondary: {
      light: lighten(almostWhite, 0.05),
      main: almostWhite,
      dark: darken(almostWhite, 0.05),
      contrastText: '#1E1E3F',
    },
    text: {
      primary: lightWhite,
      secondary: notSoWhite,
      disabled: '#888888',
      hint: notSoWhite,
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
          borderBottom: `1px solid #444444`,
        },
      },
    },

    // Reduce right margins from 16px to 8px in lists:
    MuiListItem: {
      secondaryAction: {
        paddingRight: 40,
      },
      gutters: {
        paddingRight: 8,
      },
    },
    MuiListItemSecondaryAction: {
      root: {
        right: 8,
      },
    },
    // Use a more visible color scheme for tabs:
    MuiTabs: {
      root: {
        backgroundColor: shadesofPurple1,
        minHeight: 32, // Reduce the height of tabs to 32px
      },
    },
    MuiTab: {
      textColorPrimary: {
        color: '#fff !important',
      },
      root: {
        // Reduce the height of tabs to 32px
        paddingTop: 0,
        paddingBottom: 0,
        minHeight: 32,
      },
    },
    // Remove the web-ish "pointer" (hand) cursor from buttons
    MuiButtonBase: {
      root: {
        cursor: 'default',
      },
    },
    // Reduce default margins on tables:
    MuiTableCell: {
      sizeSmall: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
    // Reduce default margins on Dialogs:
    MuiDialogTitle: {
      root: {
        padding: 8,
      },
    },
    MuiDialogContent: {
      root: {
        padding: 8,
      },
    },
    // Remove default margins on form controls (we already use a Grid)
    MuiFormControl: {
      marginDense: {
        marginTop: 0,
        marginBottom: 0,
      },
    },
    MuiCheckbox: {
      root: {
        // Cancel padding around Checkbox
        marginTop: -9,
        marginBottom: -9,
      },
    },
    // Use non rounded buttons
    MuiButton: {
      root: {
        borderRadius: 5,
        fontWeight: 400, // Lower a bit the weight of buttons
      },
    },
  },
});

const theme: Theme = {
  gdevelopTheme,
  muiTheme,
};

export default theme;
