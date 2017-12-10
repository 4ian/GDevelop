// @flow

import React, { Component } from 'react';
import { Line, Column } from '../../../../UI/Grid';
import ImagePreview from '../../../ImagePreview';
import Replay from 'material-ui/svg-icons/av/replay';
import PlayArrow from 'material-ui/svg-icons/av/play-arrow';
import Pause from 'material-ui/svg-icons/av/pause';
import { FlatButton } from 'material-ui';

type Props = {
  spritesContainer: Object,
  resourcesLoader: Object,
  project: Object,
};

type State = {
  currentFrameIndex: number,
  currentFrameElapsedTime: number,
  paused: boolean,
};

export default class AnimationPreview extends Component<Props, State> {
  state = {
    currentFrameIndex: 0,
    currentFrameElapsedTime: 0,
    paused: false,
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

    const { spritesContainer } = this.props;
    const { currentFrameIndex, currentFrameElapsedTime, paused } = this.state;
    const timeBetweenFrames = spritesContainer.getTimeBetweenFrames();

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
    const { spritesContainer, resourcesLoader, project } = this.props;
    const { currentFrameIndex, paused } = this.state;

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
        <Line>
          <Column expand>
            <FlatButton
              icon={<Replay />}
              label="Replay"
              onClick={this.replay}
            />
            <FlatButton
              icon={paused ? <PlayArrow /> : <Pause />}
              label={paused ? 'Play' : 'Pause'}
              onClick={paused ? this.play : this.pause}
            />
          </Column>
        </Line>
      </div>
    );
  }
}
