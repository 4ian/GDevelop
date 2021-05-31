// @flow
import { darken, lighten } from '@material-ui/core/styles';

export const closeableTabSizeOverrides = {
  width: 200,
  height: 32,
  closeButtonWidth: 24,
};

export function getRootClassNames(
  theme: string
): {|
  eventsSheetRootClassName: string,
  markdownRootClassName: string,
  mosaicRootClassName: string,
  tableRootClassName: string,
|} {
  return {
    mosaicRootClassName: theme,
    eventsSheetRootClassName: theme,
    tableRootClassName: theme,
    markdownRootClassName: theme,
  };
}

export function getMuiOverrides(
  tabTextColor: string,
  tabBackgroundColor: string,
  inputBorderBottomColor: string,
  appBarBackgroundColor: string,
  iconColor: string
): {|
  MuiAccordion: {|
    root: {|
      '&$expanded': {|
        '&:before': {| opacity: number |},
        '&:first-child': {| marginTop: number |},
        margin: string,
      |},
      '&:before': {| display: string |},
      '&:not(:last-child)': {| borderBottom: number |},
      margin: string,
    |},
  |},
  MuiAccordionDetails: {| root: {| padding: number |} |},
  MuiAccordionSummary: {|
    content: {| '&$expanded': {| margin: number |}, margin: number |},
    expandIcon: {| padding: number |},
    root: {| '&$expanded': {| minHeight: null |} |},
  |},
  MuiAppBar: {| colorPrimary: {| backgroundColor: string |} |},
  MuiButton: {| root: {| borderRadius: number, fontWeight: number |} |},
  MuiButtonBase: {| root: {| cursor: string |} |},
  MuiCheckbox: {| root: {| marginBottom: number, marginTop: number |} |},
  MuiDialogContent: {|
    root: {| '&:first-child': {| paddingTop: number |}, padding: number |},
  |},
  MuiDialogTitle: {| root: {| padding: number |} |},
  MuiFormControl: {|
    marginDense: {| marginBottom: number, marginTop: number |},
  |},
  MuiIconButton: {| root: {| color: string |} |},
  MuiInput: {|
    input: {| padding: number, paddingBottom: number |},
    underline: {| '&:before': {| borderBottom: string |} |},
  |},
  MuiListItem: {|
    gutters: {| paddingRight: number |},
    secondaryAction: {| paddingRight: number |},
  |},
  MuiListItemIcon: {| root: {| color: string |} |},
  MuiListItemSecondaryAction: {| root: {| right: number |} |},
  MuiTab: {|
    root: {| minHeight: number, paddingBottom: number, paddingTop: number |},
    textColorPrimary: {| color: string |},
  |},
  MuiTableCell: {|
    sizeSmall: {| paddingBottom: number, paddingTop: number |},
  |},
  MuiTabs: {| root: {| backgroundColor: string, minHeight: number |} |},
  MuiTypography: {| h6: {| fontWeight: number |} |},
|} {
  return {
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
          borderBottom: `1px solid ${inputBorderBottomColor}`,
        },
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: appBarBackgroundColor,
      },
    },
    MuiIconButton: {
      root: {
        // Fix color being grey if not set to (almost) black
        color: iconColor,
      },
    },
    MuiListItemIcon: {
      root: {
        // Fix color being grey if not set to (almost) black
        color: iconColor,
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
        backgroundColor: tabBackgroundColor,
        minHeight: 32, // Reduce the height of tabs to 32px
      },
    },
    MuiTab: {
      textColorPrimary: {
        color: tabTextColor + ' !important',
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
        '&:first-child': {
          paddingTop: 8,
        },
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
    // Make MuiAccordion much more compact than default.
    // Some (or all) of these styles can be removed on MUIv5,
    // which introduces `disableGutters` prop for compactness.
    MuiAccordion: {
      root: {
        margin: '5px 0',
        '&$expanded': {
          margin: '5px 0',
          '&:first-child': {
            marginTop: 5,
          },
          '&:before': {
            opacity: 1,
          },
        },
        '&:not(:last-child)': {
          borderBottom: 0,
        },
        '&:before': {
          display: 'none',
        },
      },
    },
    MuiAccordionSummary: {
      root: {
        '&$expanded': {
          minHeight: null,
        },
      },
      content: {
        margin: 0,
        '&$expanded': {
          margin: 0,
        },
      },
      expandIcon: {
        padding: 0,
      },
    },
    MuiAccordionDetails: {
      root: {
        padding: 8,
      },
    },
  };
}

export function getThemeMode(
  color: string,
  contrastText: string
): {| contrastText: string, dark: any, light: any, main: string |} {
  return {
    light: lighten(color, 0.05),
    main: color,
    dark: darken(color, 0.05),
    contrastText: contrastText,
  };
}

export function createGdevelopTheme(
  styles: any,
  rootClassNameIdentifier: string,
  paletteType: string,
  gdevelopIconsCSSFilter: string = ''
) {
  return {
    gdevelopTheme: {
      palette: {
        canvasColor: styles['ThemeSurfaceCanvasBackgroundColor'],
      },
      message: {
        warning: styles['ThemeMessageWarningColor'],
        error: styles['ThemeMessageErrorColor'],
        valid: styles['ThemeMessageValidColor'],
      },
      toolbar: {
        backgroundColor: styles['ThemeSurfaceWindowBackgroundColor'],
        separatorColor: styles['ThemeToolbarSeparatorColor'],
      },
      closableTabs: {
        fontFamily: styles['GdevelopFontFamily'],
        containerBackgroundColor: styles['ThemeSurfaceWindowBackgroundColor'],
        backgroundColor: styles['ThemeClosableTabsDefaultBackgroundColor'],
        textColor: styles['ThemeClosableTabsDefaultColor'],
        selectedBackgroundColor:
          styles['ThemeClosableTabsSelectedBackgroundColor'],
        selectedTextColor: styles['ThemeClosableTabsSelectedColor'],
        ...closeableTabSizeOverrides,
      },
      imageThumbnail: {
        selectedBorderColor: styles['ThemeSelectionBackgroundColor'],
      },
      imagePreview: {
        backgroundFilter: styles['ThemeImagePreviewBackgroundFilter'],
        borderColor: styles['ThemeImagePreviewBorderColor'],
        frameBorderColor: styles['ThemeImagePreviewFrameBorderColor'],
      },
      list: {
        itemsBackgroundColor:
          styles['ThemeSurfaceAlternateCanvasBackgroundColor'],
      },
      searchBar: {
        backgroundColor: styles['ThemeSurfaceAlternateCanvasBackgroundColor'],
      },
      listItem: {
        groupBackgroundColor: styles['ThemeSurfaceWindowBackgroundColor'],
        groupTextColor: styles['ThemeListItemGroupTextColor'],
        deprecatedGroupTextColor:
          styles['ThemeListItemGroupTextDeprecatedColor'],
        separatorColor: styles['ThemeListItemSeparatorColor'],
        selectedBackgroundColor: styles['ThemeSelectionBackgroundColor'],
        selectedTextColor: styles['ThemeSelectionColor'],
        rightIconColor: styles['ThemeRightIconColor'],
        selectedRightIconColor: styles['ThemeRightIconColor'],
        errorTextColor: styles['ThemeListItemErrorColor'],
        warningTextColor: styles['ThemeListItemWarningColor'],
        selectedErrorBackgroundColor: styles['ThemeListItemErrorColor'],
        selectedWarningBackgroundColor: styles['ThemeListItemWarningColor'],
      },
      emptyMessage: {
        shadowColor: styles['ThemeMessageEmptyShadowColor'],
      },
      ...getRootClassNames(rootClassNameIdentifier),
      logo: {
        src: 'res/GD-logo-big.png',
      },
      gdevelopIconsCSSFilter,
    },
    muiThemeOptions: {
      typography: {
        fontFamily: styles['GdevelopFontFamily'],
      },
      palette: {
        type: paletteType,
        common: {
          black: styles['ThemePaletteBlack'],
          white: styles['ThemePaletteWhite'],
        },
        background: {
          paper: styles['ThemeSurfaceCanvasBackgroundColor'],
          default: styles['ThemeSurfaceWindowBackgroundColor'],
        },
        primary: getThemeMode(
          styles['ThemePrimaryColor'],
          styles['ThemePrimaryTextContrastColor']
        ),
        secondary: getThemeMode(
          styles['ThemeSecondaryColor'],
          styles['ThemeSecondaryTextContrastColor']
        ),
        text: {
          primary: styles['ThemeTextDefaultColor'],
          secondary: styles['ThemeTextSecondaryColor'],
          disabled: styles['ThemeTextDisabledColor'],
          hint: styles['ThemeTextSecondaryColor'],
        },
      },
      overrides: getMuiOverrides(
        styles['ThemeTextContrastColor'],
        styles['TabsBackgroundColor'],
        styles['InputBorderBottomColor'],
        styles['MosaicToolbarBackgroundColor'],
        styles['ThemeTextDefaultColor']
      ),
    },
  };
}
