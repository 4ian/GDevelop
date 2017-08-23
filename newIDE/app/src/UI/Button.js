import React from 'react';
import FlatButton from 'material-ui/FlatButton';

/**
 * Buttom class
 */
export default class Button extends React.Component {

    render() {
        return (
            <FlatButton
                label={this.props.label}
                fullWidth
                onClick={this.props.onClick}
                hoverColor="#E1F5FE"
            />
        );
    }
}