// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import Timer from '@material-ui/icons/Timer';
import TextButton from '../../../UI/TextButton';
import Checkbox from '../../../UI/Checkbox';
import Brush from '@material-ui/icons/Brush';
import PlayArrow from '@material-ui/icons/PlayArrow';
import TextField from '../../../UI/TextField';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import AnimationPreview from './AnimationPreview';
import ResourcesLoader from '../../../ResourcesLoader';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor.flow';
import { ResponsiveWindowMeasurer } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { isProjectImageResourceSmooth } from '../../../ResourcesList/ResourcePreview/ImagePreview';

const styles = {
  container: {
    paddingLeft: 12,
    paddingRight: 12,
    display: 'flex',
    alignItems: 'center',
  },
  timeField: {
    width: 75,
  },
  timeIcon: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  spacer: {
    width: 16,
  },
};

const formatTime = (time: number) => Number(time.toFixed(6));

type Props = {|
  animationName: string,
  direction: gdDirection,
  resourcesLoader: typeof ResourcesLoader,
  project: gdProject,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onEditWith: ResourceExternalEditor => void,
|};

type State = {|
  timeBetweenFrames: number,
  timeError: boolean,
  previewOpen: boolean,
|};

export default class DirectionTools extends Component<Props, State> {
  state = {
    timeBetweenFrames: formatTime(this.props.direction.getTimeBetweenFrames()),
    timeError: false,
    previewOpen: false,
  };

  // To be updated, see https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops.
  UNSAFE_componentWillReceiveProps(newProps: Props) {
    this.setState({
      timeBetweenFrames: formatTime(
        this.props.direction.getTimeBetweenFrames()
      ),
      timeError: false,
    });
  }

  saveTimeBetweenFrames = () => {
    const { direction } = this.props;

    const newTime = Math.max(parseFloat(this.state.timeBetweenFrames), 0.00001);
    const newTimeIsValid = !isNaN(newTime);

    if (newTimeIsValid) direction.setTimeBetweenFrames(newTime);
    this.setState({
      timeBetweenFrames: formatTime(
        this.props.direction.getTimeBetweenFrames()
      ),
      timeError: newTimeIsValid,
    });
  };

  setLooping = (check: boolean) => {
    const { direction } = this.props;

    direction.setLoop(!!check);
    this.forceUpdate();
  };

  openPreview = (open: boolean) => {
    this.setState({
      previewOpen: open,
    });
    if (!open) {
      this.saveTimeBetweenFrames();
    }
  };

  render() {
    const {
      direction,
      resourcesLoader,
      project,
      resourceExternalEditors,
      onEditWith,
    } = this.props;

    const imageResourceExternalEditors = resourceExternalEditors.filter(
      ({ kind }) => kind === 'image'
    );

    return (
      <div style={styles.container}>
        <ResponsiveWindowMeasurer>
          {windowWidth =>
            windowWidth !== 'small' &&
            !!imageResourceExternalEditors.length && (
              <TextButton
                label={imageResourceExternalEditors[0].displayName}
                icon={<Brush />}
                onClick={() => onEditWith(imageResourceExternalEditors[0])}
              />
            )
          }
        </ResponsiveWindowMeasurer>
        <TextButton
          label={<Trans>Preview</Trans>}
          icon={<PlayArrow />}
          onClick={() => this.openPreview(true)}
        />
        <Timer style={styles.timeIcon} />
        <TextField
          value={this.state.timeBetweenFrames}
          onChange={(e, text) =>
            this.setState({ timeBetweenFrames: parseFloat(text) || 0 })
          }
          onBlur={() => this.saveTimeBetweenFrames()}
          id="direction-time-between-frames"
          margin="none"
          style={styles.timeField}
          type="number"
          step={0.005}
          precision={2}
          min={0.01}
          max={5}
        />
        <span style={styles.spacer} />
        <Checkbox
          checked={direction.isLooping()}
          label={<Trans>Loop</Trans>}
          onCheck={(e, check) => this.setLooping(check)}
        />
        {this.state.previewOpen && (
          <Dialog
            actions={[
              <DialogPrimaryButton
                label={<Trans>Ok</Trans>}
                primary
                onClick={() => this.openPreview(false)}
                key="ok"
              />,
            ]}
            noMargin
            onRequestClose={() => this.openPreview(false)}
            onApply={() => this.openPreview(false)}
            open={this.state.previewOpen}
            fullHeight
            flexBody
          >
            <AnimationPreview
              animationName={this.props.animationName}
              resourceNames={direction.getSpriteNames().toJSArray()}
              getImageResourceSource={(name: string) =>
                resourcesLoader.getResourceFullUrl(project, name, {})
              }
              isImageResourceSmooth={(name: string) =>
                isProjectImageResourceSmooth(project, name)
              }
              project={project}
              timeBetweenFrames={this.state.timeBetweenFrames}
              onChangeTimeBetweenFrames={text =>
                this.setState({ timeBetweenFrames: text })
              }
              isLooping={direction.isLooping()}
            />
          </Dialog>
        )}
      </div>
    );
  }
}
