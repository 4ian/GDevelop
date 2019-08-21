// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Dialog from '../UI/Dialog';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import SubscriptionChecker from '../Profile/SubscriptionChecker';
import {
  getErrors,
  displayProjectErrorsBox,
  validatePackageName,
} from './ProjectErrorsChecker';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import { Line, Column } from '../UI/Grid';
import HelpButton from '../UI/HelpButton';

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
  minFPS: number,
  maxFPS: number,
  isFolderProject: boolean,
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
      minFPS: project.getMinimumFPS(),
      maxFPS: project.getMaximumFPS(),
      isFolderProject: project.isFolderProject(),
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
      minFPS,
      maxFPS,
      isFolderProject,
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
    project.setMinimumFPS(minFPS);
    project.setMaximumFPS(maxFPS);
    project.getLoadingScreen().showGDevelopSplash(showGDevelopSplash);
    project.setFolderProject(isFolderProject);

    if (!displayProjectErrorsBox(t, getErrors(t, project))) return;

    this.props.onApply();
  };

  render() {
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
      minFPS,
      maxFPS,
      isFolderProject,
    } = this.state;

    const defaultPackageName = 'com.example.mygame';
    const admobHint = 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY';
    const defaultVersion = '1.0.0';

    return (
      <React.Fragment>
        <Dialog
          actions={[
            <FlatButton
              label={<Trans>Cancel</Trans>}
              primary={false}
              onClick={this.props.onClose}
              key="cancel"
            />,
            <FlatButton
              label={<Trans>Apply</Trans>}
              primary={true}
              keyboardFocused={true}
              onClick={this._onApply}
              key="apply"
            />,
          ]}
          secondaryActions={[
            <HelpButton
              helpPagePath="/interface/project-manager/properties"
              key="help"
            />,
          ]}
          open={this.props.open}
          onRequestClose={this.props.onClose}
          autoScrollBodyContent={true}
        >
          <SemiControlledTextField
            floatingLabelText={<Trans>Game name</Trans>}
            fullWidth
            type="text"
            value={name}
            onChange={value => this.setState({ name: value })}
          />
          <SemiControlledTextField
            floatingLabelText={<Trans>Game's window width</Trans>}
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
            floatingLabelText={<Trans>Game's window height</Trans>}
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
            floatingLabelText={<Trans>Author name</Trans>}
            fullWidth
            hintText={<Trans>Your name</Trans>}
            type="text"
            value={author}
            onChange={value => this.setState({ author: value })}
          />
          <SemiControlledTextField
            floatingLabelText={<Trans>Version number (X.Y.Z)</Trans>}
            fullWidth
            hintText={defaultVersion}
            type="text"
            value={version}
            onChange={value => this.setState({ version: value })}
          />
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Project file type</Trans>}
            value={isFolderProject}
            onChange={(e, i, value) =>
              this.setState({ isFolderProject: value })
            }
          >
            <MenuItem
              value={false}
              primaryText={<Trans>Single file (default)</Trans>}
            />
            <MenuItem
              value={true}
              primaryText={
                <Trans>
                  Multiple files, saved in folder next to the main file
                </Trans>
              }
            />
          </SelectField>
          <Line noMargin>
            <Column expand noMargin>
              <SemiControlledTextField
                floatingLabelText={<Trans>Minimum FPS</Trans>}
                fullWidth
                type="number"
                value={'' + minFPS}
                onChange={value =>
                  this.setState({
                    minFPS: Math.max(0, parseInt(value, 10)),
                  })
                }
              />
            </Column>
            <Column expand noMargin>
              <SemiControlledTextField
                floatingLabelText={<Trans>Maximum FPS (0 to disable)</Trans>}
                fullWidth
                type="number"
                value={'' + maxFPS}
                onChange={value =>
                  this.setState({
                    maxFPS: Math.max(0, parseInt(value, 10)),
                  })
                }
              />
            </Column>
          </Line>
          {maxFPS > 0 && maxFPS < 60 && (
            <DismissableAlertMessage
              identifier="maximum-fps-too-low"
              kind="warning"
            >
              <Trans>
                Most monitors have a refresh rate of 60 FPS. Setting a maximum
                number of FPS under 60 will force the game to skip frames, and
                the real number of FPS will be way below 60, making the game
                laggy and impacting the gameplay negatively. Consider putting 60
                or more for the maximum number or FPS, or disable it by setting
                0.
              </Trans>
            </DismissableAlertMessage>
          )}
          {minFPS < 20 && (
            <DismissableAlertMessage
              identifier="minimum-fps-too-low"
              kind="warning"
            >
              <Trans>
                Setting the minimum number of FPS below 20 will increase a lot
                the time that is allowed between the simulation of two frames of
                the game. If case of a sudden slowdown, or on slow computers,
                this can create buggy behaviors like objects passing beyond a
                wall. Consider setting 20 as the minimum FPS.
              </Trans>
            </DismissableAlertMessage>
          )}
          <SemiControlledTextField
            floatingLabelText={
              <Trans>Package name (for iOS and Android)</Trans>
            }
            fullWidth
            hintText={defaultPackageName}
            type="text"
            value={packageName}
            onChange={value => this.setState({ packageName: value })}
            errorText={
              validatePackageName(packageName) ? (
                undefined
              ) : (
                <Trans>
                  The package name is containing invalid characters or not
                  following the convention "xxx.yyy.zzz" (numbers allowed after
                  a letter only).
                </Trans>
              )
            }
          />
          <SelectField
            fullWidth
            floatingLabelText={
              <Trans>Device orientation (for iOS and Android)</Trans>
            }
            value={orientation}
            onChange={(e, i, value) => this.setState({ orientation: value })}
          >
            <MenuItem
              value="default"
              primaryText={<Trans>Platform default</Trans>}
            />
            <MenuItem
              value="landscape"
              primaryText={<Trans>Landscape</Trans>}
            />
            <MenuItem value="portrait" primaryText={<Trans>Portrait</Trans>} />
          </SelectField>
          <SelectField
            fullWidth
            floatingLabelText={
              <Trans>Scale mode (also called "Sampling")</Trans>
            }
            floatingLabelFixed
            value={scaleMode}
            onChange={(e, i, value) => this.setState({ scaleMode: value })}
          >
            <MenuItem
              value="linear"
              primaryText={
                <Trans>
                  Linear (antialiased rendering, good for most games)
                </Trans>
              }
            />
            <MenuItem
              value="nearest"
              primaryText={
                <Trans>
                  Nearest (no antialiasing, good for pixel perfect games)
                </Trans>
              }
            />
          </SelectField>
          {scaleMode === 'nearest' && (
            <DismissableAlertMessage
              identifier="use-non-smoothed-textures"
              kind="info"
            >
              <Trans>
                To obtain the best pixel-perfect effect possible, go in the
                resources editor and disable the Smoothing for all images of
                your game. It will be done automatically for new images added
                from now.
              </Trans>
            </DismissableAlertMessage>
          )}
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Fullscreen/game size mode</Trans>}
            floatingLabelFixed
            value={sizeOnStartupMode}
            onChange={(e, i, value) =>
              this.setState({ sizeOnStartupMode: value })
            }
          >
            <MenuItem
              value=""
              primaryText={<Trans>No changes to the game size</Trans>}
            />
            <MenuItem
              value="adaptWidth"
              primaryText={<Trans>Change width to fit the screen</Trans>}
            />
            <MenuItem
              value="adaptHeight"
              primaryText={<Trans>Change height to fit the screen</Trans>}
            />
          </SelectField>
          <SemiControlledTextField
            floatingLabelText={
              <Trans>AdMob application ID (for iOS and Android)</Trans>
            }
            fullWidth
            hintText={admobHint}
            type="text"
            value={adMobAppId}
            onChange={value => this.setState({ adMobAppId: value })}
          />
          <Checkbox
            label={
              <Trans>
                Display GDevelop splash at startup (in exported game)
              </Trans>
            }
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
          id="Disable GDevelop splash at startup"
          title={<Trans>Disable GDevelop splash at startup</Trans>}
        />
      </React.Fragment>
    );
  }
}

export default ProjectPropertiesDialog;
