// @flow
import { type Theme } from '../DefaultTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import './Mosaic.css';
import './EventsSheet.css';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table
import './Table.css';
import './Markdown.css';

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
  stepper: {
    textColor: lightWhite,
  },
  raisedButton: {
    primaryTextColor: notSoWhite,
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
    deprecatedGroupTextColor: '#888',
    separatorColor: '#303030',
    selectedBackgroundColor: systemSelectionColor,
    selectedTextColor: almostWhite,
    errorTextColor: '#ff2e16',
    selectedErrorBackgroundColor: '#ff2e16',
  },
  emptyMessage: {
    shadowColor: '#000',
  },
  logo: {
    src: 'res/GD-logo.png',
  },
  mosaicRootClassName: 'mosaic-gd-dark-theme', // See Mosaic.css
  eventsSheetRootClassName: 'gd-events-sheet-dark-theme', // See EventsSheet.css
  tableRootClassName: 'gd-table-dark-theme', // See Table.css
  markdownRootClassName: 'gd-markdown-dark-theme', // See Markdown.css
  gdevelopIconsCSSFilter: '',
};

export default getMuiTheme(theme);
