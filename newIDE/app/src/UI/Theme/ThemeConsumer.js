import muiThemeable from 'material-ui/styles/muiThemeable';

/**
 * Expose the Material UI theme.
 * TODO: All components using muiThemeable HOC should be migrated to
 * use this component instead (will ease any future migration).
 */
const ThemeConsumer = props => props.children(props.muiTheme);

export default muiThemeable()(ThemeConsumer);
