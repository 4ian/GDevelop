// @flow
import { type Theme } from '../DefaultTheme';
import { darken, lighten } from '@material-ui/core/styles';
import './Mosaic.css';
import './EventsSheet.css';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table
import './variables.css';
import './styles.css';

const canvas_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--canvas-color-dark');
const alternate_canvas_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--alternate-canvas-color-dark');
const system_selection_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--system-selection-color-dark');
const separator_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--separator-color-dark');
const list_item_separator_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--list-item-separator-color-dark');
const text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--text-color-dark');
const group_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--group-text-color-dark');
const deprecated_group_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--deprecated-group-text-color-dark');
const right_icon_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--right-icon-color-dark');
const selected_right_icon_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--selected-right-icon-color-dark');
const error_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--error-text-color-dark');
const warning_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--warning-text-color');
const selected_error_background_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--selected-error-background-color-dark');
const selected_warning_background_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--selected-warning-background-color-dark');
const almost_white = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--almost-white-dark');
const not_so_white = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--not-so-white-dark');
const gdevelop_dark_blue = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--gdevelop-dark-blue-dark');
const almostWhite = almost_white;
const lightWhite = '#ddd';
const notSoWhite = not_so_white;
const gdevelopDarkBlue = gdevelop_dark_blue;
const blue = '#2c6bf5';

// Use the fonts provided by the operating system(s) as possible.
// If you update this font list, be sure to do it in all the other places using fonts in the codebase.
const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, 'Helvetica Neue', Helvetica, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

const systemSelectionColor = system_selection_color; //OS X selection

/**
 * The background color of the main window
 */
const backgroundColor = '#252525';

/**
 * The background color of the "papers", "dialogs", etc...
 */
const canvasColor = canvas_color;

/**
 * The alternate background color, for some lists or search box,
 * to distinguish them from other content.
 */
const alternateCanvasColor = alternate_canvas_color;

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
    separatorColor: separator_color,
  },
  closableTabs: {
    fontFamily,
    containerBackgroundColor: backgroundColor,
    backgroundColor: canvasColor,
    textColor: text_color,
    selectedBackgroundColor: gdevelopDarkBlue,
    selectedTextColor: almostWhite,
    width: 200,
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
    groupTextColor: group_text_color,
    deprecatedGroupTextColor: deprecated_group_text_color,
    separatorColor: list_item_separator_color,
    selectedBackgroundColor: systemSelectionColor,
    selectedTextColor: almostWhite,
    rightIconColor: right_icon_color,
    selectedRightIconColor: selected_right_icon_color,
    errorTextColor: error_text_color,
    warningTextColor: warning_text_color,
    selectedErrorBackgroundColor: selected_error_background_color,
    selectedWarningBackgroundColor: selected_warning_background_color,
  },
  emptyMessage: {
    shadowColor: '#000',
  },
  logo: {
    src: 'res/GD-logo.png',
  },
  mosaicRootClassName: 'mosaic-gd-dark-theme' || 'mosaic-gd',
  eventsSheetRootClassName: 'gd-events-sheet-dark-theme' || 'gd-events-sheet',
  tableRootClassName: 'gd-table-dark-theme' || 'gd-table',
  markdownRootClassName: 'gd-markdown-dark-theme' || 'gd-markdown',
  gdevelopIconsCSSFilter: '',
};

// Theme for Material-UI components
const muiThemeOptions = {
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
      light: lighten(blue, 0.05),
      main: blue,
      dark: darken(blue, 0.05),
      contrastText: '#fff',
    },
    secondary: {
      light: lighten(almostWhite, 0.05),
      main: almostWhite,
      dark: darken(almostWhite, 0.05),
      contrastText: '#000',
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
      input: {
        padding: 0,
        paddingBottom: 3,
      },
      underline: {
        '&:before': {
          borderBottom: `1px solid #444444`,
        },
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: gdevelopDarkBlue,
      },
    },
    MuiIconButton: {
      root: {
        color: '#fff',
      },
    },
    MuiListItemIcon: {
      root: {
        color: '#fff',
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
        backgroundColor: gdevelopDarkBlue,
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
        borderRadius: 0,
        fontWeight: 400, // Lower a bit the weight of buttons
      },
    },
  },
};

const theme: Theme = {
  gdevelopTheme,
  muiThemeOptions,
};

export default theme;
