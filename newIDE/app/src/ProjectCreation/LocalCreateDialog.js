import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import { findExamples } from './LocalExamplesFinder';
import generateName from '../Utils/NewNameGenerator';
import optionalRequire from '../Utils/OptionalRequire.js';
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
var fs = optionalRequire('fs-extra');

export default class LocalCreateDialog extends Component {
  constructor(props) {
    super(props);

    const outputRootPath = path ? path.join(app.getPath('home'), 'GDevelop projects') : "";
    this.state = {
      outputPath: this._findEmptyPath(outputRootPath),
    };
  }

  _findEmptyPath = basePath => {
    if (!path) return basePath;

    const folderName = generateName('My project', name => {
      try {
        fs.accessSync(path.join(basePath, name));
      } catch (ex) {
        return false;
      }
      return true;
    });

    return path.join(basePath, folderName);
  };

  createFromExample(exampleName) {
    const { outputPath } = this.state;
    if (!fs || !outputPath) return;

    findExamples(examplesPath => {
      fs.mkdirsSync(outputPath);
      fs.copySync(path.join(examplesPath, exampleName), outputPath);
      this.props.onOpen(path.join(outputPath, exampleName + '.json'));
      sendNewGameCreated(exampleName);
    });
  }

  render() {
    const { open, onClose } = this.props;
    if (!open) return null;

    const actions = [
      <FlatButton label="Close" primary={false} onTouchTap={onClose} />,
    ];

    return (
      <Dialog
        title="Create a new game"
        actions={actions}
        modal={true}
        open={open}
      >
        <Column noMargin>
          <Line>
          Choose the game to use as a base:
          </Line>
          <Line>
            <Column expand>
            <FlatButton
              label="Platformer"
              fullWidth
              primary
              onClick={() => this.createFromExample('platformer')}
            />
            <FlatButton label="Space Shooter" fullWidth primary disabled />
            <FlatButton label="Empty game" fullWidth primary disabled />
            </Column>
          </Line>
          <Divider />
          <Line expand>
          <LocalFolderPicker
          fullWidth
            value={this.state.outputPath}
            onChange={outputPath =>
              this.setState({
                outputPath,
              })}
          />
          </Line>
        </Column>
      </Dialog>
    );
  }
}
