import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';

/**
 * Define custom Paper styile.
 */
const style = {
    customPaperStyle: {
        backgroundColor: '#FFFFFF',
        padding: 5,
        margin: "0px 0px 10px 0px",
        maxWidth: 400,
    }
};

/**
 * CustomPaper class.
 */
export default class CustomPaper extends React.Component {

    /**
     * Returns a custom Paper.
     */
    render() {
        return (
            <Paper zDepth={1} style={this.props.style || style.customPaperStyle}>
                {this.props.children}
            </Paper>
        );

    }
}