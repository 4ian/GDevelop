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
  outlinedButtonBorderColor: string,
  alternateCanvasBackgroundColor: string
) {
  return {
    MuiTypography: {
      h1: {
        fontSize: '44px',
        lineHeight: '56px',
        fontWeight: 900,
        letterSpacing: '0.01em',
      },
      h2: {
        fontSize: '33px',
        lineHeight: '40px',
        fontWeight: 700,
      },
      h3: {
        fontSize: '25px',
        lineHeight: '32px',
        fontWeight: 700,
      },
      h4: {
        fontSize: '19px',
        lineHeight: '24px',
        fontWeight: 700,
        letterSpacing: '0.01em',
      },
      h5: {
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
      h6: {
        // Make h6, used in Drawer title bars, use the same weight as tabs and mosaic windows
        fontWeight: 600,
      },
      body1: {
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: 400,
        letterSpacing: '0.01em',
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
      outlinedSizeSmall: {
        fontSize: '12px',
        fontWeight: 700,
      },
      containedSizeSmall: {
        fontSize: '12px',
        fontWeight: 700,
      },
      textSizeSmall: {
        fontSize: '12px',
        fontWeight: 700,
      },
    },
    MuiSvgIcon: {
      fontSizeSmall: {
        fontSize: '15px',
      },
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
    MuiCardHeader: {
      root: {
        padding: 0,
        flexGrow: 0,
      },
    },
    MuiMenu: {
      paper: {
        backgroundColor: alternateCanvasBackgroundColor,
      },
    },
    MuiAutocomplete: {
      paper: {
        backgroundColor: alternateCanvasBackgroundColor,
      },
    },
  };
}

function getThemeModeFromMainColor(color: string, contrastText: string) {
  return {
    light: lighten(color, 0.05),
    main: color,
    dark: darken(color, 0.05),
    contrastText: contrastText,
  };
}

function getThemeColors(styles: any) {
  // If there is no dark variant on the primary color, we consider:
  // - light and dark variants have to be computed from the main color
  // - the theme will use Material UI default values for Success, Info, Warning and Error colors.
  if (!styles['ThemePrimaryDark'])
    return {
      primary: getThemeModeFromMainColor(
        styles['ThemePrimaryColor'],
        styles['ThemePrimaryTextContrastColor']
      ),
      secondary: getThemeModeFromMainColor(
        styles['ThemeSecondaryColor'],
        styles['ThemeSecondaryTextContrastColor']
      ),
    };

  return {
    primary: {
      light: styles['ThemePrimaryLight'],
      main: styles['ThemePrimaryColor'],
      dark: styles['ThemePrimaryDark'],
      contrastText: styles['ThemePrimaryTextContrastColor'],
    },
    secondary: {
      light: styles['ThemeSecondaryLight'],
      main: styles['ThemeSecondaryColor'],
      dark: styles['ThemeSecondaryDark'],
      contrastText: styles['ThemeSecondaryTextContrastColor'],
    },
    success: {
      light: styles['ThemeSuccessLight'],
      main: styles['ThemeSuccessColor'],
      dark: styles['ThemeSuccessDark'],
      contrastText: styles['ThemeSuccessTextContrastColor'],
    },
    info: {
      light: styles['ThemeInfoLight'],
      main: styles['ThemeInfoColor'],
      dark: styles['ThemeInfoDark'],
      contrastText: styles['ThemeInfoTextContrastColor'],
    },
    warning: {
      light: styles['ThemeWarningLight'],
      main: styles['ThemeWarningColor'],
      dark: styles['ThemeWarningDark'],
      contrastText: styles['ThemeWarningTextContrastColor'],
    },
    error: {
      light: styles['ThemeErrorLight'],
      main: styles['ThemeErrorColor'],
      dark: styles['ThemeErrorDark'],
      contrastText: styles['ThemeErrorTextContrastColor'],
    },
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
      palette: {
        type: paletteType,
        canvasColor: styles['ThemeSurfaceCanvasBackgroundColor'],
        alternateCanvasColor:
          styles['ThemeSurfaceAlternateCanvasBackgroundColor'],
        primary: styles['ThemePrimaryColor'],
        secondary: styles['ThemeSecondaryColor'],
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
        color: {
          primary: styles['ThemeTextDefaultColor'],
          secondary: styles['ThemeTextSecondaryColor'],
        },
        highlighted: {
          backgroundColor: styles['ThemeTextHighlightedBackgroundColor'],
        },
      },
      home: {
        header: {
          backgroundColor: styles['ThemeHomeHeaderBackgroundColor'],
        },
        separator: {
          color: styles['ThemeHomeSeparatorColor'],
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
      chart: {
        fontFamily: styles['GdevelopModernFontFamily'],
        tooltipBackgroundColor:
          styles['ThemeSurfaceAlternateCanvasBackgroundColor'],
        dataColor1:
          paletteType === 'dark'
            ? lighten(styles['ThemePrimaryColor'], 0.3)
            : styles['ThemePrimaryColor'],
        textColor: styles['ThemeTextDefaultColor'],
        gridColor: styles['ThemeTextDisabledColor'],
      },
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
          alternate: styles['ThemeSurfaceAlternateCanvasBackgroundColor'],
        },
        ...getThemeColors(styles),
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
        styles['ThemeTextDefaultColor'],
        styles['ThemeSurfaceAlternateCanvasBackgroundColor']
      ),
    },
  };
}
