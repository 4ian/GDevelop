// @flow
import { type Theme } from '../DefaultTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import './Mosaic.css';
import './EventsSheet.css';

const almostWhite = '#EEE';
const lightWhite = '#DDD';
const notSoWhite = '#CCC';
const gdevelopDarkBlue = '#3c4698';
const blue = '#2C5FD2';

const systemSelectionColor = '#4c92ff'; //OS X selection

const backgroundColor = '#252525';
const canvasColor = '#303030';

const theme: Theme = {
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', //OS X font
  palette: {
    primary1Color: blue,
    primary2Color: blue,
    accent1Color: almostWhite,
    canvasColor,
    textColor: lightWhite,
    secondaryTextColor: notSoWhite,
    alternateTextColor: '#444',
    borderColor: '#444444',
    disabledColor: '#888888',
    pickerHeaderColor: '#444444',
    clockCircleColor: '#444444',
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  tabs: {
    backgroundColor: gdevelopDarkBlue,
    textColor: lightWhite,
    selectedTextColor: almostWhite,
  },
  toolbar: {
    backgroundColor: backgroundColor,
    separatorColor: '#303030',
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
    color: gdevelopDarkBlue,
    textColor: almostWhite,
  },
  button: {
    height: 32,
    iconButtonSize: 24,
  },
  snackbar: {
    actionColor: blue,
  },

  // GDevelop specific variables:
  closableTabs: {
    backgroundColor: backgroundColor,
    textColor: '#878787',
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
    itemsBackgroundColor: '#494949',
  },
  listItem: {
    groupBackgroundColor: backgroundColor,
    groupTextColor: '#AAA',
    separatorColor: '#303030',
    selectedBackgroundColor: systemSelectionColor,
    selectedTextColor: almostWhite,
  },
  emptyMessage: {
    shadowColor: '#000'
  },
  logo: {
    src: "res/GD-logo.png",
  },
  startPage: {
    backgroundColor,
  },
  mosaicRootClassName: 'mosaic-gd-dark-theme',
  eventsSheetRootClassName: 'gd-events-sheet-dark-theme',
};

export default getMuiTheme(theme);
