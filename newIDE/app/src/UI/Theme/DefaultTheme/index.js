// @flow
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import './Mosaic.css';
import './EventsSheet.css';

const gdevelopPurple = '#9100ce';
const gdevelopLightBlue = '#4ab0e4';
const gdevelopDarkBlue = '#3c4698';

const systemSelectionColor = '#4c92ff'; //OS X selection

const backgroundColor = '#f7f7f7';
const canvasColor = '#f0f0f0';

const theme = {
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', //OS X font
  palette: {
    primary1Color: gdevelopLightBlue,
    primary2Color: gdevelopDarkBlue,
    accent1Color: gdevelopPurple,
    canvasColor,
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  tabs: {
    backgroundColor: gdevelopLightBlue,
  },
  toolbar: {
    backgroundColor: backgroundColor,
    separatorColor: '#cecece',
    menuHoverColor: systemSelectionColor,
    hoverColor: systemSelectionColor,
  },
  menuItem: {
    dataHeight: 24,
    height: 32,
    hoverColor: systemSelectionColor,
    selectedTextColor: systemSelectionColor,
    padding: 8,
  },
  appBar: {
    color: gdevelopPurple,
  },
  button: {
    height: 32,
    iconButtonSize: 24,
  },
  snackbar: {
    actionColor: gdevelopLightBlue,
  },

  // GDevelop specific variables:
  closableTabs: {
    backgroundColor: backgroundColor,
    textColor: '#878787',
    selectedBackgroundColor: gdevelopLightBlue,
    selectedTextColor: '#ffffff',
    width: 200,
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
    separatorColor: '#e0e0e0',
    selectedBackgroundColor: systemSelectionColor,
    selectedTextColor: '#ffffff',
  },
  emptyMessage: {
    shadowColor: '#FFFFFF'
  },
  logo: {
    src: "res/GD-logo-big.png",
  },
  startPage: {
    backgroundColor,
  },
  mosaicRootClassName: 'mosaic-gd-default-theme',
  eventsSheetRootClassName: 'gd-events-sheet-default-theme',
};

export type Theme = $Exact<typeof theme>;
export default getMuiTheme(theme);
