import React from 'react';
import FlatButton from 'material-ui/FlatButton';

/**
 * Link class.
 */
export default class Link extends React.Component {

    render() {
        return (
            <FlatButton
                label={this.props.label}
                fullWidth
                href={this.props.href}
                hoverColor="#E1F5FE"//"#B3E5FC"
            />
        );
    }
}