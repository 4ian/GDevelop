import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import BaseEditor from './BaseEditor';
import AboutDialog from './AboutDialog';
import { Line, Column } from '../UI/Grid';

const styles = {
  logoPaper: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    padding: 5,
    maxWidth: 400,
    textAlign: 'center',
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

  getLabel() {
    return 'Unknown editor';
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
      <Column expand>
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
            <Paper zDepth={1}>
              <FlatButton
                label="Open a project"
                fullWidth
                onClick={this.props.onOpen}
              />
              <FlatButton
                label="Create a new project"
                fullWidth
                onClick={this.props.onCreate}
              />
            </Paper>
          </div>
        </Line>
        <Line justifyContent="space-between">
          <FlatButton label="About GDevelop" onClick={() => this._openAboutDialog(true)} />
        </Line>
        <AboutDialog
          open={this.state.aboutDialogOpen}
          onClose={() => this._openAboutDialog(false)}
        />
      </Column>
    );
  }
}
