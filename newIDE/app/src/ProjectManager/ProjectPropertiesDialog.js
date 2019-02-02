// @flow
import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Dialog from '../UI/Dialog';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import SubscriptionChecker from '../Profile/SubscriptionChecker';
import { getErrors, displayProjectErrorsBox } from './ProjectErrorsChecker';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: Function,
  onApply: Function,
  onChangeSubscription: () => void,
|};

type State = {|
  windowDefaultWidth: number,
  windowDefaultHeight: number,
  name: string,
  author: string,
  version: string,
  packageName: string,
  orientation: string,
  adMobAppId: string,
  scaleMode: 'linear' | 'nearest',
  sizeOnStartupMode: string,
  showGDevelopSplash: boolean,
|};

class ProjectPropertiesDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this._loadFrom(props.project);
  }

  _subscriptionChecker: ?SubscriptionChecker = null;

  _loadFrom(project: gdProject): State {
    return {
      windowDefaultWidth: project.getMainWindowDefaultWidth(),
      windowDefaultHeight: project.getMainWindowDefaultHeight(),
      name: project.getName(),
      author: project.getAuthor(),
      version: project.getVersion(),
      packageName: project.getPackageName(),
      orientation: project.getOrientation(),
      adMobAppId: project.getAdMobAppId(),
      scaleMode: project.getScaleMode(),
      sizeOnStartupMode: project.getSizeOnStartupMode(),
      showGDevelopSplash: project.getLoadingScreen().isGDevelopSplashShown(),
    };
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _onApply = () => {
    const t = str => str; //TODO
    const { project } = this.props;
    const {
      windowDefaultWidth,
      windowDefaultHeight,
      name,
      author,
      version,
      packageName,
      orientation,
      adMobAppId,
      scaleMode,
      sizeOnStartupMode,
      showGDevelopSplash,
    } = this.state;
    project.setDefaultWidth(windowDefaultWidth);
    project.setDefaultHeight(windowDefaultHeight);
    project.setName(name);
    project.setAuthor(author);
    project.setVersion(version);
    project.setPackageName(packageName);
    project.setOrientation(orientation);
    project.setAdMobAppId(adMobAppId);
    project.setScaleMode(scaleMode);
    project.setSizeOnStartupMode(sizeOnStartupMode);
    project.getLoadingScreen().showGDevelopSplash(showGDevelopSplash);

    if (!displayProjectErrorsBox(t, getErrors(t, project))) return;

    this.props.onApply();
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.props.onClose}
      />,
      <FlatButton
        label="Apply"
        primary={true}
        keyboardFocused={true}
        onClick={this._onApply}
      />,
    ];
    const {
      name,
      windowDefaultWidth,
      windowDefaultHeight,
      author,
      version,
      packageName,
      orientation,
      adMobAppId,
      scaleMode,
      sizeOnStartupMode,
      showGDevelopSplash,
    } = this.state;

    return (
      <React.Fragment>
        <Dialog
          actions={actions}
          open={this.props.open}
          onRequestClose={this.props.onClose}
          autoScrollBodyContent={true}
        >
          <SemiControlledTextField
            floatingLabelText="Game name"
            fullWidth
            type="text"
            value={name}
            onChange={value => this.setState({ name: value })}
          />
          <SemiControlledTextField
            floatingLabelText="Game's window width"
            fullWidth
            type="number"
            value={'' + windowDefaultWidth}
            onChange={value =>
              this.setState({
                windowDefaultWidth: Math.max(0, parseInt(value, 10)),
              })
            }
          />
          <SemiControlledTextField
            floatingLabelText="Game's window height"
            fullWidth
            type="number"
            value={'' + windowDefaultHeight}
            onChange={value =>
              this.setState({
                windowDefaultHeight: Math.max(0, parseInt(value, 10)),
              })
            }
          />
          <SemiControlledTextField
            floatingLabelText="Author name"
            fullWidth
            hintText="Your name"
            type="text"
            value={author}
            onChange={value => this.setState({ author: value })}
          />
          <SemiControlledTextField
            floatingLabelText="Version number (X.Y.Z)"
            fullWidth
            hintText="1.0.0"
            type="text"
            value={version}
            onChange={value => this.setState({ version: value })}
          />
          <SemiControlledTextField
            floatingLabelText="Package name (for iOS and Android)"
            fullWidth
            hintText="com.example.mygame"
            type="text"
            value={packageName}
            onChange={value => this.setState({ packageName: value })}
          />
          <SelectField
            fullWidth
            floatingLabelText="Device orientation (for iOS and Android)"
            value={orientation}
            onChange={(e, i, value) => this.setState({ orientation: value })}
          >
            <MenuItem value="default" primaryText="Platform default" />
            <MenuItem value="landscape" primaryText="Landscape" />
            <MenuItem value="portrait" primaryText="Portrait" />
          </SelectField>
          <SelectField
            fullWidth
            floatingLabelText={'Scale mode (also called "Sampling")'}
            floatingLabelFixed
            value={scaleMode}
            onChange={(e, i, value) => this.setState({ scaleMode: value })}
          >
            <MenuItem
              value="linear"
              primaryText="Linear (antialiased rendering, good for most games)"
            />
            <MenuItem
              value="nearest"
              primaryText="Nearest (no antialiasing, good for pixel perfect games)"
            />
          </SelectField>
          {scaleMode === 'nearest' && (
            <DismissableAlertMessage
              identifier="use-non-smoothed-textures"
              kind="info"
            >
              To obtain the best pixel-perfect effect possible, go in the
              resources editor and disable the Smoothing for all images of your
              game.
            </DismissableAlertMessage>
          )}
          <SelectField
            fullWidth
            floatingLabelText="Fullscreen/game size mode"
            floatingLabelFixed
            value={sizeOnStartupMode}
            onChange={(e, i, value) =>
              this.setState({ sizeOnStartupMode: value })
            }
          >
            <MenuItem value="" primaryText="No changes to the game size" />
            <MenuItem
              value="adaptWidth"
              primaryText="Change width to fit the screen"
            />
            <MenuItem
              value="adaptHeight"
              primaryText="Change height to fit the screen"
            />
          </SelectField>
          <SemiControlledTextField
            floatingLabelText="AdMob application ID (for iOS and Android)"
            fullWidth
            hintText="ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
            type="text"
            value={adMobAppId}
            onChange={value => this.setState({ adMobAppId: value })}
          />
          <Checkbox
            label="Display GDevelop splash at startup (in exported game)"
            checked={showGDevelopSplash}
            onCheck={(e, checked) => {
              if (!checked) {
                if (
                  this._subscriptionChecker &&
                  !this._subscriptionChecker.checkHasSubscription()
                )
                  return;
              }

              this.setState({
                showGDevelopSplash: checked,
              });
            }}
          />
        </Dialog>
        <SubscriptionChecker
          ref={subscriptionChecker =>
            (this._subscriptionChecker = subscriptionChecker)
          }
          onChangeSubscription={() => {
            this.props.onClose();
            this.props.onChangeSubscription();
          }}
          mode="mandatory"
          title="Disable GDevelop splash at startup"
        />
      </React.Fragment>
    );
  }
}

export default ProjectPropertiesDialog;
