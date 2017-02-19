import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default getMuiTheme({
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', //OS X font
  palette: {
    primary1Color: '#3c4698',
    primary2Color: '#4ab0e4',
    accent1Color: '#9100ce',
    canvasColor: '#f0f0f0',
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  toolbar: {
    backgroundColor: '#f7f7f7',
    separatorColor: '#cecece',
    menuHoverColor: '#4c92ff', //OS X selection
    hoverColor: '#4c92ff', //OS X selection
  },
  menuItem: {
    dataHeight: 24,
    height: 32,
    hoverColor: '#4c92ff', //OS X selection
    padding: 8,
  },
  appBar: {
    color: '#9100ce',
  },
  button: {
    height: 32,
    iconButtonSize: 24,
  },
});
