// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import { Line } from '../../../../UI/Grid';
import ImagePreview from '../../../../ResourcesList/ResourcePreview/ImagePreview';
import Replay from 'material-ui/svg-icons/av/replay';
import PlayArrow from 'material-ui/svg-icons/av/play-arrow';
import Pause from 'material-ui/svg-icons/av/pause';
import Timer from 'material-ui/svg-icons/image/timer';
import TextField from 'material-ui/TextField';
import { FlatButton } from 'material-ui';

type Props = {|
  spritesContainer: Object,
  resourcesLoader: Object,
  project: Object,
  timeBetweenFrames: number,
  onChangeTimeBetweenFrames: number => void,
|};

type State = {|
  currentFrameIndex: number,
  currentFrameElapsedTime: number,
  paused: boolean,
  fps: number,
|};

const styles = {
  timeField: {
    width: 75,
  },
  timeIcon: {
    paddingLeft: 6,
    paddingRight: 8,
  },
};

export default class AnimationPreview extends Component<Props, State> {
  state = {
    currentFrameIndex: 0,
    currentFrameElapsedTime: 0,
    paused: false,
    fps: Math.round(1 / this.props.timeBetweenFrames),
  };

  nextUpdate = null;

  componentDidMount() {
    this.nextUpdate = requestAnimationFrame(this._updateAnimation);
  }

  componentWillUnmount() {
    if (this.nextUpdate) cancelAnimationFrame(this.nextUpdate);
  }

  replay = () =>
    this.setState({
      currentFrameIndex: 0,
      currentFrameElapsedTime: 0,
      paused: false,
    });

  play = () =>
    this.setState({
      paused: false,
    });

  pause = () =>
    this.setState({
      paused: true,
    });

  _updateAnimation = () => {
    const animationSpeedScale = 1;

    const { spritesContainer, timeBetweenFrames } = this.props;
    const { currentFrameIndex, currentFrameElapsedTime, paused } = this.state;

    const elapsedTime = 1 / 60;
    let newFrameIndex = currentFrameIndex;
    let newFrameElapsedTime = currentFrameElapsedTime;
    newFrameElapsedTime += paused ? 0 : elapsedTime * animationSpeedScale;

    if (newFrameElapsedTime > timeBetweenFrames) {
      const count = Math.floor(newFrameElapsedTime / timeBetweenFrames);
      newFrameIndex += count;
      newFrameElapsedTime = newFrameElapsedTime - count * timeBetweenFrames;
      if (newFrameElapsedTime < 0) newFrameElapsedTime = 0;
    }

    if (newFrameIndex >= spritesContainer.getSpritesCount()) {
      newFrameIndex = spritesContainer.isLooping()
        ? newFrameIndex % spritesContainer.getSpritesCount()
        : spritesContainer.getSpritesCount() - 1;
    }
    if (newFrameIndex < 0) newFrameIndex = 0; //May happen if there is no frame.

    this.setState({
      currentFrameIndex: newFrameIndex,
      currentFrameElapsedTime: newFrameElapsedTime,
    });
    this.nextUpdate = requestAnimationFrame(this._updateAnimation);
  };

  render() {
    const {
      spritesContainer,
      resourcesLoader,
      project,
      timeBetweenFrames,
      onChangeTimeBetweenFrames,
    } = this.props;
    const { currentFrameIndex, paused, fps } = this.state;

    const hasValidSprite =
      currentFrameIndex < spritesContainer.getSpritesCount();
    const sprite = hasValidSprite
      ? spritesContainer.getSprite(currentFrameIndex)
      : null;

    return (
      <div>
        <ImagePreview
          resourceName={sprite ? sprite.getImageName() : ''}
          resourcesLoader={resourcesLoader}
          project={project}
        />
        <Line noMargin alignItems="center">
          <span style={styles.timeIcon}>FPS:</span>
          <TextField
            value={fps}
            onChange={(e, text) => {
              const fps = parseFloat(text);
              if (fps > 0) {
                this.setState({ fps });
                onChangeTimeBetweenFrames(parseFloat((1 / fps).toFixed(4)));
                this.replay();
              }
            }}
            id="direction-time-between-frames"
            type="number"
            step={1}
            min={1}
            max={100}
            style={styles.timeField}
            autoFocus={true}
          />
          <Timer style={styles.timeIcon} />
          <TextField
            value={timeBetweenFrames}
            onChange={(e, text) => {
              const time = parseFloat(text);
              if (time > 0) {
                this.setState({ fps: Math.round(1 / time) });
                onChangeTimeBetweenFrames(time);
                this.replay();
              }
            }}
            id="direction-time-between-frames"
            type="number"
            step={0.005}
            precision={2}
            min={0.01}
            max={5}
            style={styles.timeField}
          />
          <FlatButton
            icon={<Replay />}
            label={<Trans>Replay</Trans>}
            onClick={this.replay}
          />
          <FlatButton
            icon={paused ? <PlayArrow /> : <Pause />}
            label={paused ? 'Play' : 'Pause'}
            onClick={paused ? this.play : this.pause}
          />
        </Line>
      </div>
    );
  }
}
