import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import muiThemeable from 'material-ui/styles/muiThemeable';
import BaseEditor from './BaseEditor';
import AboutDialog from '../AboutDialog';
import Window from '../../Utils/Window';
import { Line } from '../../UI/Grid';

const styles = {
  scrollContainer: {
    flex: 1,
    display: 'flex',
    overflowY: 'scroll',
  },
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
  logo: {
    width: '100%',
  },
};

class ThemableStartPage extends BaseEditor {
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
    const {
      project,
      canOpen,
      onOpen,
      onCreate,
      onOpenProjectManager,
      onCloseProject,
      muiTheme,
    } = this.props;

    return (
      <div
        style={{
          backgroundColor: muiTheme.palette.canvasColor,
          ...styles.scrollContainer,
        }}
      >
        <div style={styles.innerContainer}>
          <Line expand justifyContent="center">
            <div style={styles.centerContainer}>
              <Paper
                zDepth={1}
                style={{
                  backgroundColor: muiTheme.startPage.backgroundColor,
                  ...styles.logoPaper,
                }}
              >
                <img src={muiTheme.logo.src} alt="" style={styles.logo} />
                <p>
                  GDevelop is an easy-to-use game creator with no programming
                  language to learn.
                </p>
              </Paper>
              <Paper zDepth={1} style={styles.buttonsPaper}>
                {!project &&
                  canOpen && (
                    <FlatButton
                      label="Open a project"
                      fullWidth
                      onClick={onOpen}
                    />
                  )}
                {!project && (
                  <FlatButton
                    label="Create a new project"
                    fullWidth
                    onClick={onCreate}
                  />
                )}
                {!!project && (
                  <FlatButton
                    label="Open Project Manager"
                    fullWidth
                    onClick={onOpenProjectManager}
                  />
                )}
                {!!project && (
                  <FlatButton
                    label="Close project"
                    fullWidth
                    onClick={onCloseProject}
                  />
                )}
              </Paper>
            </div>
          </Line>
          <Line alignItems="center" justifyContent="space-between">
            <div>
              <FlatButton
                label="About GDevelop"
                onClick={() => this._openAboutDialog(true)}
              />
              <FlatButton
                label="Gdevelop Forums"
                onClick={() =>
                  Window.openExternalURL('http://forum.compilgames.net')}
              />
              <FlatButton
                label="Help and tutorials"
                onClick={() =>
                  Window.openExternalURL(
                    'http://wiki.compilgames.net/doku.php/gdevelop5/start'
                  )}
              />
            </div>
            <div>
              <IconButton
                iconClassName="icon-facebook"
                onClick={() =>
                  Window.openExternalURL(
                    'https://www.facebook.com/GameDevelop'
                  )}
              />
              <IconButton
                iconClassName="icon-twitter"
                onClick={() =>
                  Window.openExternalURL('https://twitter.com/game_develop')}
              />
            </div>
          </Line>
          <AboutDialog
            open={this.state.aboutDialogOpen}
            onClose={() => this._openAboutDialog(false)}
          />
        </div>
      </div>
    );
  }
}

const StartPage = muiThemeable()(ThemableStartPage);
export default StartPage;
