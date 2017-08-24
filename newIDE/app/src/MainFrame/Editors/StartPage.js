import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import BaseEditor from './BaseEditor';
import AboutDialog from '../AboutDialog';
import Window from '../../Utils/Window';
import { Line, Column } from '../../UI/Grid';

const styles = {
  logoPaper: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    padding: 5,
    width: 400,
    textAlign: 'center',
  },
  buttonsPaper: {
    width: 400,
  },
};

export default class StartPage extends BaseEditor {
  constructor(props) {
    super(props);

    this.state = {
      aboutDialogOpen: false,
    };
  }

  getProject() {
    return undefined;
  }

  updateToolbar() {
    if (this.props.setToolbar) this.props.setToolbar(null);
  }

  _openAboutDialog = (open = true) => {
    this.setState({
      aboutDialogOpen: open,
    });
  };

  render() {
    return (
      <Column expand noMargin>
        <Line expand>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Paper zDepth={1} style={styles.logoPaper}>
              <img src="res/GD-logo-simple.png" alt="" />
              <p>
                GDevelop is an easy-to-use game creator with no programming language to learn.
              </p>
            </Paper>
            <Paper zDepth={1} style={styles.buttonsPaper}>
              {this.props.canOpen &&
                <FlatButton
                  label="Open a project"
                  fullWidth
                  onClick={this.props.onOpen}
                />}
              <FlatButton
                label="Create a new project"
                fullWidth
                onClick={this.props.onCreate}
              />
            </Paper>
          </div>
        </Line>
        <Line>
          <FlatButton
            label="About GDevelop"
            onClick={() => this._openAboutDialog(true)}
          />
          <FlatButton
            label="Gdevelop Forum"
            onClick={() => Window.openExternalURL("http://forum.compilgames.net")}
          />
          <FlatButton
            label="Gdevelop Wiki"
            onClick={() => Window.openExternalURL("http://wiki.compilgames.net")}
          />
        </Line>
        <AboutDialog
          open={this.state.aboutDialogOpen}
          onClose={() => this._openAboutDialog(false)}
        />
      </Column>
    );
  }
}
