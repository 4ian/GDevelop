// @flow
import { createMuiTheme, darken, lighten } from '@material-ui/core/styles';
import '../SharedEventsSheet.css';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table
import '../SharedMarkdown.css';
import './ThemeColors.css';
import './Theme.css';
import '../SharedMosaic.css';
import '../SharedTable.css';

const background_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--background-color');
const canvas_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--canvas-color');
const alternate_canvas_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--alternate-canvas-color');
const system_selection_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--system-selection-color');
const separator_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--separator-color');
const list_item_separator_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--list-item-separator-color');
const text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--text-color');
const selected_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--selected-text-color');
const group_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--group-text-color');
const deprecated_group_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--deprecated-group-text-color');
const right_icon_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--right-icon-color');
const selected_right_icon_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--selected-right-icon-color');
const error_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--error-text-color');
const warning_text_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--warning-text-color');
const selected_error_background_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--selected-error-background-color');
const selected_warning_background_color = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue('--selected-warning-background-color');

const gdevelopPurple = '#9100ce';
const gdevelopLightBlue = '#4ab0e4';

const systemSelectionColor = system_selection_color; //OS X selection

// Use the fonts provided by the operating system(s) as possible.
// If you update this font list, be sure to do it in all the other places using fonts in the codebase.
const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, 'Helvetica Neue', Helvetica, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

/**
 * The background color of the main window
 */
const backgroundColor = background_color;

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
    valid: '#00aa00',
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
    selectedBackgroundColor: gdevelopLightBlue,
    selectedTextColor: selected_text_color,
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
    selectedTextColor: selected_text_color,
    rightIconColor: right_icon_color,
    selectedRightIconColor: selected_right_icon_color,
    errorTextColor: error_text_color,
    warningTextColor: warning_text_color,
    selectedErrorBackgroundColor: selected_error_background_color,
    selectedWarningBackgroundColor: selected_warning_background_color,
  },
  emptyMessage: {
    shadowColor: '#FFFFFF',
  },
  logo: {
    src: 'res/GD-logo-big.png',
  },
  mosaicRootClassName: 'mosaic-gd', // See Mosaic.css
  eventsSheetRootClassName: 'gd-events-sheet', // See EventsSheet.css
  tableRootClassName: 'gd-table', // See Table.css
  markdownRootClassName: 'gd-markdown', // See Markdown.css
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
        backgroundColor: gdevelopLightBlue,
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

const theme = {
  gdevelopTheme,
  muiTheme,
};
export type Theme = $Exact<typeof theme>;
export default theme;
