import React from 'react';
import BaseEditor from './BaseEditor';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';

const styles = {

    communityPaper: {
        backgroundColor: '#FFFFFF',
        padding: 5,
        margin: "0px 0px 10px 0px",
        maxWidth: 400,
        textAlign: "left",
    },

    communityHeader: {
        // backgroundColor: "rgba(225, 245, 254, 0.41)",
    },

    communityLabelHeader: {
        color: "rgba(0, 0, 0, 0.71)",
        fontSize: "1.5em",
        textTransform: "capitalize"
    }
};

export default class Community extends BaseEditor {

    render() {
        return (
            <Paper zDepth={1} style={styles.communityPaper}>
                {/* <FlatButton
                    label="Community"
                    disabled
                    fullWidth
                    labelStyle={styles.communityLabelHeader}
                    style={styles.communityHeader}
                /> */}
                <FlatButton
                    label="Gdevelop Forum"
                    fullWidth
                    href="http://forum.compilgames.net"
                    hoverColor="#E1F5FE"//"#B3E5FC"

                />
                <FlatButton
                    label="Gdevelop Site"
                    fullWidth
                    href="http://www.compilgames.net"
                    hoverColor="#E1F5FE"//"#B3E5FC"
                />
                <FlatButton
                    label="GDevelop wiki"
                    fullWidth
                    href="http://wiki.compilgames.net"
                    hoverColor="#E1F5FE"//"#B3E5FC"
                />
            </Paper>
        );
    }
}