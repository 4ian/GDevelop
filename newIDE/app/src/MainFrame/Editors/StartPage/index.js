// @flow
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import BaseEditor from '../BaseEditor';
import Window from '../../../Utils/Window';
import { Line } from '../../../UI/Grid';
import GDevelopLogo from './GDevelopLogo';
import ScrollBackground from './ScrollBackground';
import RaisedButton from 'material-ui/RaisedButton';

const styles = {
  innerContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: 350,
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
  },
  logoPaper: {
    margin: 10,
    padding: 5,
    width: '100%',
    textAlign: 'center',
  },
  buttonsPaper: {
    width: '100%',
  },
};

class StartPage extends BaseEditor {
  constructor() {
    super();

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

  render() {
    const {
      project,
      canOpen,
      onOpen,
      onCreate,
      onOpenProjectManager,
      onCloseProject,
      onOpenAboutDialog,
      onOpenHelpFinder,
    } = this.props;

    return (
      <ScrollBackground>
        <div style={styles.innerContainer}>
          <Line expand justifyContent="center">
            <div style={styles.centerContainer}>
              <Paper
                zDepth={1}
                style={{
                  ...styles.logoPaper,
                }}
              >
                <GDevelopLogo />
                <p>
                  GDevelop is an easy-to-use game creator with no programming
                  language to learn.
                </p>
              </Paper>
              {!project && canOpen && (
                <RaisedButton
                  label="Open a project"
                  fullWidth
                  onClick={onOpen}
                  primary
                />
              )}
              {!project && (
                <RaisedButton
                  label="Create a new project"
                  fullWidth
                  onClick={onCreate}
                  primary
                />
              )}
              {!!project && (
                <RaisedButton
                  label="Open Project Manager"
                  fullWidth
                  onClick={onOpenProjectManager}
                  primary
                />
              )}
              {!!project && (
                <FlatButton
                  label="Close project"
                  fullWidth
                  onClick={onCloseProject}
                />
              )}
              {
                <FlatButton
                  label="Search the documentation"
                  fullWidth
                  onClick={onOpenHelpFinder}
                />
              }
            </div>
          </Line>
          <Line alignItems="center" justifyContent="space-between">
            <div>
              <FlatButton label="About GDevelop" onClick={onOpenAboutDialog} />
              <FlatButton
                label="Gdevelop Forums"
                onClick={() =>
                  Window.openExternalURL('http://forum.compilgames.net')
                }
              />
              <FlatButton
                label="Help and tutorials"
                onClick={() =>
                  Window.openExternalURL(
                    'http://wiki.compilgames.net/doku.php/gdevelop5/start'
                  )
                }
              />
            </div>
            <div>
              <IconButton
                iconClassName="icon-facebook"
                onClick={() =>
                  Window.openExternalURL('https://www.facebook.com/GDevelopApp')
                }
              />
              <IconButton
                iconClassName="icon-twitter"
                onClick={() =>
                  Window.openExternalURL('https://twitter.com/GDevelopApp')
                }
              />
            </div>
          </Line>
        </div>
      </ScrollBackground>
    );
  }
}

export default StartPage;
