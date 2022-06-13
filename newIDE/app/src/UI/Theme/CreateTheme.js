// @flow
import { darken, lighten } from '@material-ui/core/styles';

export const closeableTabSizeOverrides = {
  width: 200,
  height: 32,
  closeButtonWidth: 24,
};

export function getRootClassNames(theme: string) {
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
  appBarTextColor: string,
  iconColor: string,
  outlinedButtonBorderColor: string
) {
  return {
    MuiTypography: {
      h5: {
        // Make h6, used in Drawer title bars, use the same weight as tabs and mosaic windows
        fontWeight: 600,
      },
      h6: {
        // Make h6, used in Drawer title bars, use the same weight as tabs and mosaic windows
        fontWeight: 600,
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
        // Use some colors as mosaic titles:
        backgroundColor: appBarBackgroundColor,
        color: appBarTextColor,
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
        color: darken(tabTextColor, 0.2) + ' !important',
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.3px',
        '&.Mui-selected': {
          color: tabTextColor + ' !important',
        },
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
    MuiPaper: {
      rounded: {
        borderRadius: 8,
      },
    },
    MuiButton: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.3px',
      },
      outlined: { borderColor: outlinedButtonBorderColor },
    },
    // Make MuiAccordion much more compact than default.
    // Some (or all) of these styles can be removed on MUIv5,
    // which introduces `disableGutters` prop for compactness.
    MuiAccordion: {
      root: {
        margin: '5px',
        '&$expanded': {
          margin: '5px',
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

export function getThemeMode(color: string, contrastText: string) {
  return {
    light: lighten(color, 0.05),
    main: color,
    dark: darken(color, 0.05),
    contrastText: contrastText,
  };
}

export function createGdevelopTheme({
  styles,
  rootClassNameIdentifier,
  paletteType,
  gdevelopIconsCSSFilter,
}: {
  styles: any,
  rootClassNameIdentifier: string,
  paletteType: string,
  gdevelopIconsCSSFilter: ?string,
}) {
  return {
    gdevelopTheme: {
      isModern: true,
      palette: {
        type: paletteType,
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
      text: {
        highlighted: {
          backgroundColor: styles['ThemeTextHighlightedBackgroundColor'],
        },
      },
      dropIndicator: {
        canDrop: styles['ThemeDropIndicatorCanDropColor'],
        cannotDrop: styles['ThemeDropIndicatorCannotDropColor'],
        border: styles['ThemeDropIndicatorBorderColor'],
      },
      closableTabs: {
        fontFamily: styles['GdevelopModernFontFamily'],
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
        fontFamily: styles['GdevelopModernFontFamily'],
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
        styles['MosaicTitleColor'],
        styles['ThemeTextDefaultColor'],
        styles['ThemeTextDefaultColor']
      ),
    },
  };
}
