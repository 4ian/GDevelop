import React from 'react';
import Paper from 'material-ui/Paper';

/**
 * Error component style.
 */
const styles = {
    paper: {

    }
};

/**
 * Error component.
 */
export default class Error extends React.Component {

    render() {
        return (
            <Paper style={this.props.style || styles.paper}>
                {this.props.message}
            </Paper>
        );
    }
}
