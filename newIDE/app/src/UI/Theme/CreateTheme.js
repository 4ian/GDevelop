// @flow
import { darken, lighten } from '@material-ui/core/styles';

const closeableTabSizeOverrides = {
  width: 200,
  height: 30,
  closeButtonWidth: 24,
};

export function getMuiOverrides({
  tabTextColor,
  tabSelectedTextColor,
  tabBackgroundColor,
  tabSelectedBackgroundColor,
  inputBorderBottomColor,
  appBarBackgroundColor,
  appBarTextColor,
  iconColor,
  outlinedButtonBorderColor,
  alternateCanvasBackgroundColor,
  alternateCanvasLightBackgroundColor,
}: {|
  tabTextColor: string,
  tabSelectedTextColor: string,
  tabBackgroundColor: string,
  tabSelectedBackgroundColor: string,
  inputBorderBottomColor: string,
  appBarBackgroundColor: string,
  appBarTextColor: string,
  iconColor: string,
  outlinedButtonBorderColor: string,
  alternateCanvasBackgroundColor: string,
  alternateCanvasLightBackgroundColor: string,
|}) {
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
      caption: {
        fontSize: '12px',
        lineHeight: '16px',
        fontWeight: 400,
        letterSpacing: '0.02em',
      },
    },
    MuiInput: {
      input: {
        padding: 0,
        paddingBottom: 3,
      },
      multiline: {
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
        minWidth: 0,
        paddingRight: 8,
      },
    },
    // Reduce right margins from 16px to 8px in lists:
    MuiListItem: {
      secondaryAction: {
        paddingRight: 40,
      },
      gutters: {
        paddingRight: 16,
        paddingLeft: 16,
      },
    },
    MuiListItemSecondaryAction: {
      root: {
        right: 4,
      },
    },
    // Use a more visible color scheme for tabs:
    MuiTabs: {
      root: {
        height: 28,
        minHeight: 28,
        backgroundColor: tabBackgroundColor,
      },
    },
    MuiTab: {
      textColorPrimary: {
        color: `${tabTextColor} !important`,
        backgroundColor: tabBackgroundColor,
        textTransform: 'none',
        fontWeight: 600,
        minWidth: 130, // Keep enough space for long terms not to wrap.
        maxWidth: 350, // Give enough space on large mobiles without triggering a scroll.
        letterSpacing: '0.3px',
        '&.Mui-selected': {
          color: `${tabSelectedTextColor} !important`,
          backgroundColor: tabSelectedBackgroundColor,
        },
      },
      root: {
        paddingTop: 4,
        paddingBottom: 4,
        height: 28,
        minHeight: 28,
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
        backgroundColor: alternateCanvasLightBackgroundColor,
      },
    },
    MuiAutocomplete: {
      paper: {
        backgroundColor: alternateCanvasBackgroundColor,
      },
      option: {
        // Avoid the default min-height of 48px, which is too big to display options.
        minHeight: 35,
      },
    },
  };
}

export const smallScreenMuiOverrides = {
  MuiTypography: {
    h1: {
      fontSize: '29px',
      lineHeight: '32px',
    },
    h2: {
      fontSize: '24px',
      lineHeight: '32px',
    },
    h3: {
      fontSize: '20px',
      lineHeight: '30px', // Not a multiple of 8, but gives better result in dialog titles.
    },
    h4: {
      fontSize: '16px',
      lineHeight: '24px',
    },
    h5: {
      fontSize: '14px',
      lineHeight: '20px',
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
    caption: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      letterSpacing: '0.02em',
    },
  },
};

const rtlDirection = { direction: 'rtl' };
const rtlOrder = { order: 100 };

export const rtlMuiOverrides = {
  MuiTypography: {
    root: rtlDirection,
  },
  MuiInput: {
    root: rtlDirection,
  },
  MuiTab: {
    root: rtlDirection,
  },
  MuiButton: {
    label: rtlDirection,
  },
  MuiSvgIcon: {
    root: rtlOrder,
  },
  MuiFormControlLabel: {
    root: rtlDirection,
  },
  MuiTextField: {
    root: rtlDirection,
  },
};

function getMuiThemeModeFromMainColor(color: string, contrastText: string) {
  return {
    light: lighten(color, 0.05),
    main: color,
    dark: darken(color, 0.05),
    contrastText: contrastText,
  };
}

function getMuiThemeColors(styles: any) {
  // If there is no dark variant on the primary color, we consider:
  // - light and dark variants have to be computed from the main color
  // - the theme will use Material UI default values for Success, Info, Warning and Error colors.
  if (!styles['ThemePrimaryDark'])
    return {
      primary: getMuiThemeModeFromMainColor(
        styles['ThemePrimaryColor'],
        styles['ThemePrimaryTextContrastColor']
      ),
      secondary: getMuiThemeModeFromMainColor(
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
        hot: {
          backgroundColor: styles['ThemeMessageHotBackgroundColor'],
          color: styles['ThemeMessageHotColor'],
        },
      },
      titlebar: {
        backgroundColor: styles['ThemeSurfaceTitlebarBackgroundColor'],
      },
      toolbar: {
        backgroundColor: styles['ThemeSurfaceToolbarBackgroundColor'],
        separatorColor: styles['ThemeToolbarSeparatorColor'],
      },
      swipeableDrawer: {
        topBar: {
          pillColor: styles['ThemeSwipeableDrawerTopBarPillColor'],
        },
      },
      text: {
        color: {
          primary: styles['ThemeTextDefaultColor'],
          secondary: styles['ThemeTextSecondaryColor'],
          disabled: styles['ThemeTextDisabledColor'],
        },
        highlighted: {
          backgroundColor: styles['ThemeTextHighlightedBackgroundColor'],
        },
      },
      linearProgress: {
        color: {
          complete: styles['ThemeLinearProgressColorComplete'],
          incomplete: styles['ThemeLinearProgressColorIncomplete'],
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
      dialog: {
        backgroundColor: styles['ThemeDialogBackgroundColor'],
        separator: styles['ThemeDialogSeparatorColor'],
      },
      link: {
        color: {
          default: styles['ThemeLinkColor'],
          hover: styles['ThemeLinkHoverColor'],
        },
      },
      switch: {
        trackColor: {
          default: styles['ThemeSwitchDefaultTrackColor'],
          toggled: styles['ThemeSwitchToggledTrackColor'],
          disabled: styles['ThemeSwitchDisabledTrackColor'],
        },
        thumbColor: {
          default: styles['ThemeSwitchDefaultThumbColor'],
          toggled: styles['ThemeSwitchToggledThumbColor'],
          disabled: styles['ThemeSwitchDisabledThumbColor'],
        },
      },
      tabs: {
        indicator: {
          backgroundColor: styles['ThemeTabsIndicatorColor'],
        },
        separator: {
          color: styles['ThemeTabsSeparatorColor'],
        },
      },
      dropIndicator: {
        canDrop: styles['ThemeDropIndicatorCanDropColor'],
        cannotDrop: styles['ThemeDropIndicatorCannotDropColor'],
        border: styles['ThemeDropIndicatorBorderColor'],
      },
      example: {
        difficulty: {
          color: {
            simple: styles['ThemeExampleDifficultyColorSimple'],
            advanced: styles['ThemeExampleDifficultyColorAdvanced'],
            expert: styles['ThemeExampleDifficultyColorExpert'],
          },
        },
      },
      closableTabs: {
        fontFamily: styles['GdevelopModernFontFamily'],
        backgroundColor: styles['ThemeClosableTabsDefaultBackgroundColor'],
        textColor: styles['ThemeClosableTabsDefaultColor'],
        selectedBackgroundColor:
          styles['ThemeClosableTabsSelectedBackgroundColor'],
        selectedTextColor: styles['ThemeClosableTabsSelectedColor'],
        selectedBorderColor: styles['ThemeClosableTabsSelectedBorderColor'],
        ...closeableTabSizeOverrides,
      },
      imagePreview: {
        backgroundFilter: styles['ThemeImagePreviewBackgroundFilter'],
        borderColor: styles['ThemeImagePreviewBorderColor'],
        frameBorderColor: styles['ThemeImagePreviewFrameBorderColor'],
      },
      list: {
        itemsBackgroundColor:
          styles['ThemeSurfaceAlternateCanvasLightBackgroundColor'],
      },
      searchBar: {
        backgroundColor: {
          default: styles['ThemeSearchBarDefaultBackgroundColor'],
          disabled: styles['ThemeSearchBarDisabledBackgroundColor'],
        },
        textColor: {
          default: styles['ThemeSearchBarDefaultTextColor'],
          focused: styles['ThemeSearchBarFocusedTextColor'],
          disabled: styles['ThemeSearchBarDisabledTextColor'],
        },
        borderColor: {
          hovered: styles['ThemeSearchBarHoveredBorderColor'],
          focused: styles['ThemeSearchBarFocusedBorderColor'],
        },
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
      paper: {
        backgroundColor: {
          dark: styles['ThemeSurfaceCanvasBackgroundColor'],
          medium: styles['ThemeSurfaceAlternateCanvasBackgroundColor'],
          light: styles['ThemeSurfaceAlternateCanvasLightBackgroundColor'],
        },
      },
      notification: { badgeColor: styles['ThemeNotificationBadgeColor'] },
      emptyMessage: {
        shadowColor: styles['ThemeMessageEmptyShadowColor'],
      },
      iconButton: {
        selectedBackgroundColor:
          styles['ThemeIconButtonSelectedBackgroundColor'],
        selectedColor: styles['ThemeIconButtonSelectedColor'],
      },
      uiRootClassName: rootClassNameIdentifier,
      logo: {
        src: 'res/GD-logo-big.png',
      },
      gdevelopIconsCSSFilter,
      chart: {
        fontFamily: styles['GdevelopModernFontFamily'],
        dataColor1:
          paletteType === 'dark'
            ? lighten(styles['ThemePrimaryColor'], 0.3)
            : styles['ThemePrimaryColor'],
        textColor: styles['ThemeTextDefaultColor'],
        gridColor: styles['ThemeTextDisabledColor'],
      },
      statusIndicator: {
        success: styles['ThemeSuccessColor'],
        error: styles['ThemeErrorColor'],
        warning: styles['ThemeWarningColor'],
      },
      credits: {
        backgroundColor: styles['ThemePrimaryLight'],
        color: styles['ThemePrimaryTextContrastColor'],
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
        ...getMuiThemeColors(styles),
        text: {
          primary: styles['ThemeTextDefaultColor'],
          secondary: styles['ThemeTextSecondaryColor'],
          disabled: styles['ThemeTextDisabledColor'],
          hint: styles['ThemeTextSecondaryColor'],
        },
      },
      overrides: getMuiOverrides({
        tabTextColor: styles['ThemeTabsTextColor'],
        tabSelectedTextColor: styles['ThemeTabsSelectedTextColor'],
        tabBackgroundColor: styles['ThemeTabsBackgroundColor'],
        tabSelectedBackgroundColor: styles['ThemeTabsSelectedBackgroundColor'],
        inputBorderBottomColor: styles['InputBorderBottomColor'],
        appBarBackgroundColor: styles['MosaicToolbarBackgroundColor'],
        appBarTextColor: styles['MosaicTitleColor'],
        iconColor: styles['ThemeTextDefaultColor'],
        outlinedButtonBorderColor: styles['ThemeTextDefaultColor'],
        alternateCanvasBackgroundColor:
          styles['ThemeSurfaceAlternateCanvasBackgroundColor'],
        alternateCanvasLightBackgroundColor:
          styles['ThemeSurfaceAlternateCanvasLightBackgroundColor'],
      }),
    },
  };
}
