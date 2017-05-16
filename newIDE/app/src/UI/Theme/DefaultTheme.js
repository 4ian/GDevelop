import getMuiTheme from 'material-ui/styles/getMuiTheme';

const gdevelopPurple = '#9100ce';
const gdevelopLightBlue = '#4ab0e4';
const gdevelopDarkBlue = '#3c4698';

const systemSelectionColor = '#4c92ff'; //OS X selection

const backgroundColor = '#f7f7f7';

export default getMuiTheme({
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', //OS X font
  palette: {
    primary1Color: gdevelopLightBlue,
    primary2Color: gdevelopDarkBlue,
    accent1Color: gdevelopPurple,
    canvasColor: '#f0f0f0',
  },
  avatar: {
    backgroundColor: 'transparent',
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
    padding: 8,
  },
  appBar: {
    color: gdevelopPurple,
  },
  button: {
    height: 32,
    iconButtonSize: 24,
  },
  tabs: {
    backgroundColor: backgroundColor,
    textColor: '#878787',
    selectedBackgroundColor: gdevelopLightBlue,
    selectedTextColor: '#ffffff',
    width: 200,
    height: 32,
  },
});
