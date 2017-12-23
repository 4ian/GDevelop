// @flow
import { type Theme } from '../DefaultTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import './Mosaic.css';

const almostWhite = '#EEE';
const gdevelopDarkBlue = '#3c4698';

const systemSelectionColor = '#4c92ff'; //OS X selection

const backgroundColor = '#252525';
const canvasColor = '#303030';

const theme: Theme = {
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', //OS X font
  palette: {
    primary1Color: gdevelopDarkBlue,
    primary2Color: gdevelopDarkBlue,
    accent1Color: almostWhite,
    canvasColor,
    textColor: '#DDD',
    secondaryTextColor: '#CCC',
    alternateTextColor: '#CCC',
    borderColor: '#888888',
    disabledColor: '#888888',
    pickerHeaderColor: '#444444',
    clockCircleColor: '#444444',
  },
  avatar: {
    backgroundColor: 'transparent',
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
  },
  button: {
    height: 32,
    iconButtonSize: 24,
  },
  snackbar: {
    actionColor: gdevelopDarkBlue,
  },

  // GDevelop specific variables:
  closableTabs: {
    backgroundColor: backgroundColor,
    textColor: '#878787',
    selectedBackgroundColor: gdevelopDarkBlue,
    selectedTextColor: '#ffffff',
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
    separatorColor: '#303030',
    selectedBackgroundColor: systemSelectionColor,
    selectedTextColor: '#ffffff',
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
};

export default getMuiTheme(theme);
