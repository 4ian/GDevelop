import React from 'react';
import FlatButton from 'material-ui/FlatButton';

/**
 * Define label style.
 */
const style = {
    style: {
        backgroundColor: "rgba(225, 245, 254, 0.41)",
    },

    labelStyle: {
        color: "rgba(0, 0, 0, 0.71)",
        fontSize: "1.5em",
        textTransform: "capitalize"
    }
};

/**
 * Label class.
 */
export default class Label extends React.Component {

    render() {
        return (
            <FlatButton
                label={this.props.label}
                disabled
                fullWidth
                labelStyle={this.props.labelStyle || style.labelStyle}
                style={this.props.style || style.style}
            />
        );
    }
}