// @flow
import { type Theme } from '../DefaultTheme';
import { createMuiTheme, darken, lighten } from '@material-ui/core/styles';
import './Mosaic.css';
import './EventsSheet.css';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table
import './Table.css';
import './Markdown.css';

const nord4 = '#D8DEE9';
const nord5 = '#E5E9F0';
const nord6 = '#ECEFF4';
const nord8 = '#88C0D0';
const nord9 = '#81A1C1';
const nord11 = '#BF616A';
const nord12 = '#D08770';
const nord13 = '#EBCB8B';
const nord14 = '#A3BE8C';

// Use the fonts provided by the operating system(s) as possible.
// If you update this font list, be sure to do it in all the other places using fonts in the codebase.
const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, 'Helvetica Neue', Helvetica, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

/**
 * The background color of the main window
 */
const backgroundColor = '#2E3440';

/**
 * The background color of the "papers", "dialogs", etc...
 */
const canvasColor = '#3B4252';

/**
 * The alternate background color, for some lists or search box,
 * to distinguish them from other content.
 */
const alternateCanvasColor = '#4C566A';

// GDevelop specific variables:
const gdevelopTheme = {
  palette: {
    canvasColor,
  },
  message: {
    warning: nord12,
    error: nord11,
    valid: nord14,
  },
  toolbar: {
    backgroundColor: backgroundColor,
    separatorColor: nord4,
  },
  closableTabs: {
    fontFamily,
    containerBackgroundColor: backgroundColor,
    backgroundColor: backgroundColor,
    textColor: nord6,
    selectedBackgroundColor: nord8,
    selectedTextColor: backgroundColor,
    height: 32,
    closeButtonWidth: 24,
  },
  imageThumbnail: {
    selectedBorderColor: nord8,
  },
  list: {
    itemsBackgroundColor: alternateCanvasColor,
  },
  searchBar: {
    backgroundColor: alternateCanvasColor,
  },
  listItem: {
    groupBackgroundColor: backgroundColor,
    groupTextColor: nord6,
    deprecatedGroupTextColor: nord4,
    separatorColor: nord4,
    selectedBackgroundColor: nord8,
    selectedTextColor: backgroundColor,
    rightIconColor: nord4,
    selectedRightIconColor: backgroundColor,
    errorTextColor: nord11,
    warningTextColor: nord13,
    selectedErrorBackgroundColor: nord11,
    selectedWarningBackgroundColor: nord13,
  },
  emptyMessage: {
    shadowColor: '#000',
  },
  logo: {
    src: 'res/GD-logo-big.png',
  },
  mosaicRootClassName: 'mosaic-gd-nord-theme', // See Mosaic.css
  eventsSheetRootClassName: 'gd-events-sheet-nord-theme', // See EventsSheet.css
  tableRootClassName: 'gd-table-nord-theme', // See Table.css
  markdownRootClassName: 'gd-markdown-nord-theme', // See Markdown.css
  gdevelopIconsCSSFilter: 'brightness(110%) hue-rotate(5deg) contrast(90%)',
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
      light: lighten(nord8, 0.05),
      main: nord8,
      dark: darken(nord8, 0.05),
      contrastText: backgroundColor,
    },
    secondary: {
      light: lighten(nord6, 0.05),
      main: nord6,
      dark: darken(nord6, 0.05),
      contrastText: nord4,
    },
    text: {
      primary: nord6,
      secondary: nord5,
      disabled: nord4,
      hint: nord5,
    },
  },
  overrides: {
    MuiTypography: {
      h6: {
        // Make h6, used in Drawer title bars, use the same weight as tabs and mosaic windows
        fontWeight: 400,
      },
    },
    MuiListItem: {
      root: {
        borderBottom: '1px solid #4C566A !important',
      },
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
    MuiInput: {
      underline: {
        '&:before': {
          borderBottom: `1px solid #BBBBBB`,
        },
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: nord8,
      },
    },
    MuiIconButton: {
      root: {
        color: '#D8DEE9',
      },
    },
    MuiListItemIcon: {
      root: {
        // Fix color being grey if not set to (almost) black
        color: '#D8DEE9',
      },
    },
    // Use a more visible color scheme for tabs:
    MuiTabs: {
      root: {
        backgroundColor: nord9,
        minHeight: 32, // Reduce the height of tabs to 32px
      },
    },
    MuiTab: {
      textColorPrimary: {
        color: '#ECEFF4 !important',
      },
      root: {
        // Reduce the height of tabs to 32px
        paddingTop: 0,
        paddingBottom: 0,
        minHeight: 32,
      },
    },
    MuiButtonBase: {
      // Remove the web-ish "pointer" (hand) cursor from buttons
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
        borderRadius: 0,
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
