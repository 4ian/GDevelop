import muiThemeable from 'material-ui/styles/muiThemeable';

/**
 * Expose the Material UI theme.
 */
const ThemeConsumer = props => props.children(props.muiTheme);

export default muiThemeable()(ThemeConsumer);
