// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import Timer from 'material-ui/svg-icons/image/timer';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Brush from 'material-ui/svg-icons/image/brush';
import PlayArrow from 'material-ui/svg-icons/av/play-arrow';
import TextField from 'material-ui/TextField';
import Dialog from '../../../UI/Dialog';
import AnimationPreview from './AnimationPreview';
import ResourcesLoader from '../../../ResourcesLoader';
import { type ResourceExternalEditor } from '../../../ResourcesList/ResourceExternalEditor.flow';

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
  repeatContainer: {
    width: 130,
  },
  repeatLabel: {
    whiteSpace: 'nowrap',
  },
  spacer: {
    width: 16,
  },
};

const formatTime = time => Number(time.toFixed(6));

type Props = {|
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

  componentWillReceiveProps(newProps: Props) {
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

    return (
      <div style={styles.container}>
        {!!resourceExternalEditors.length && (
          <FlatButton
            label={resourceExternalEditors[0].displayName}
            icon={<Brush />}
            onClick={() => onEditWith(resourceExternalEditors[0])}
          />
        )}
        <FlatButton
          label={<Trans>Preview</Trans>}
          icon={<PlayArrow />}
          onClick={() => this.openPreview(true)}
        />
        <Timer style={styles.timeIcon} />
        <TextField
          value={this.state.timeBetweenFrames}
          onChange={(e, text) => this.setState({ timeBetweenFrames: text })}
          onBlur={() => this.saveTimeBetweenFrames()}
          id="direction-time-between-frames"
          style={styles.timeField}
          type="number"
          step={0.005}
          precision={2}
          min={0.01}
          max={5}
        />
        <span style={styles.spacer} />
        <div style={styles.repeatContainer}>
          <Checkbox
            checkedIcon={<Repeat />}
            uncheckedIcon={<Repeat />}
            checked={direction.isLooping()}
            label={direction.isLooping() ? 'Loop' : "Don't loop"}
            onCheck={(e, check) => this.setLooping(check)}
            labelStyle={styles.repeatLabel}
          />
        </div>
        {this.state.previewOpen && (
          <Dialog
            actions={
              <FlatButton
                label={<Trans>OK</Trans>}
                primary
                onClick={() => this.openPreview(false)}
              />
            }
            autoScrollBodyContent
            noMargin
            modal
            onRequestClose={() => this.openPreview(false)}
            open={this.state.previewOpen}
          >
            <AnimationPreview
              spritesContainer={direction}
              resourcesLoader={resourcesLoader}
              project={project}
              timeBetweenFrames={this.state.timeBetweenFrames}
              onChangeTimeBetweenFrames={text =>
                this.setState({ timeBetweenFrames: text })
              }
            />
          </Dialog>
        )}
      </div>
    );
  }
}
