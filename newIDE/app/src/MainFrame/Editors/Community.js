import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import BaseEditor from './BaseEditor';
import CustomPaper from '../../UI/CustomPaper';
import Label from '../../UI/Label';
import Link from '../../UI/Link';

/**
 * Community class.
 */
export default class Community extends BaseEditor {

    render() {
        /**
         * Returns a Paper component that represents this component.
         */
        return (
            <CustomPaper>
                <Label label="Community" />
                <Link
                    label="Gdevelop Forum"
                    href="http://forum.compilgames.net"
                />
                <Link
                    label="Gdevelop Site"
                    href="http://www.compilgames.net"
                />
                <Link
                    label="GDevelop wiki"
                    href="http://wiki.compilgames.net"
                />
            </CustomPaper>
        );
    }
}