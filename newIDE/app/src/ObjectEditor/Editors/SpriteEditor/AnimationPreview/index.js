// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import ImagePreview from '../../../../ResourcesList/ResourcePreview/ImagePreview';
import Replay from '@material-ui/icons/Replay';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import Timer from '@material-ui/icons/Timer';
import TextField from '../../../../UI/TextField';
import FlatButton from '../../../../UI/FlatButton';
import Text from '../../../../UI/Text';
import useForceUpdate from '../../../../Utils/UseForceUpdate';

const styles = {
  timeField: {
    width: 75,
  },
  timeIcon: {
    paddingLeft: 6,
    paddingRight: 8,
  },
};

type Props = {|
  resourceNames: string[],
  getImageResourceSource: (resourceName: string) => string,
  isImageResourceSmooth: (resourceName: string) => boolean,
  project: gdProject,
  timeBetweenFrames: number,
  onChangeTimeBetweenFrames?: number => void,
  isLooping: boolean,
  hideCheckeredBackground?: boolean,
  hideControls?: boolean,
  initialZoom?: number,
  fixedHeight?: number,
|};

const AnimationPreview = ({
  resourceNames,
  getImageResourceSource,
  isImageResourceSmooth,
  project,
  timeBetweenFrames,
  onChangeTimeBetweenFrames,
  isLooping,
  hideCheckeredBackground,
  hideControls,
  initialZoom,
  fixedHeight,
}: Props) => {
  const forceUdpate = useForceUpdate();

  // Use state for elements that don't need to be read from inside the animation callback.
  const [fps, setFps] = React.useState<number>(
    Math.round(1 / timeBetweenFrames)
  );

  // Use useRef for mutable variables that we want to persist
  // to be readable from inside the animation callback.
  const requestRef = React.useRef();
  const previousTimeRef = React.useRef();
  const currentFrameElapsedTimeRef = React.useRef(0);
  const timeBetweenFramesRef = React.useRef(timeBetweenFrames);
  const pausedRef = React.useRef(false);
  const currentFrameIndexRef = React.useRef(0);
  const isLoopingRef = React.useRef(isLooping);

  // When outside variables change, we need to update the animation callback.
  React.useEffect(
    () => {
      if (timeBetweenFrames !== timeBetweenFramesRef.current) {
        timeBetweenFramesRef.current = timeBetweenFrames;
        setFps(Math.round(1 / timeBetweenFrames));
      }
      if (isLooping !== isLoopingRef.current) {
        isLoopingRef.current = isLooping;
      }
    },
    [timeBetweenFrames, isLooping]
  );

  const replay = () => {
    currentFrameIndexRef.current = 0;
    currentFrameElapsedTimeRef.current = 0;
    pausedRef.current = false;
    forceUdpate();
  };

  // Variables used inside the requestAnimationFrame callback
  // must be declared as mutable with useRef, otherwise they
  // will not update between calls.
  const updateAnimation = React.useCallback(
    (updateTimeInMs: number) => {
      // Mutable variables used inside the requestAnimationFrame callback
      const previousUpdateTimeInMs = previousTimeRef.current;
      const currentFrameIndex = currentFrameIndexRef.current;
      const currentFrameElapsedTime = currentFrameElapsedTimeRef.current;
      const currentTimeBetweenFrames = timeBetweenFramesRef.current;
      const paused = pausedRef.current;
      const isLooping = isLoopingRef.current;
      const numberOfFrames = resourceNames.length;

      if (previousUpdateTimeInMs) {
        const elapsedTime = (updateTimeInMs - previousUpdateTimeInMs) / 1000;

        let newFrameIndex = currentFrameIndex;
        let newFrameElapsedTime =
          currentFrameElapsedTime + (paused ? 0 : elapsedTime);

        // Increase frame index if time elapsed is greater than time between frames.
        if (newFrameElapsedTime > currentTimeBetweenFrames) {
          const count = Math.floor(
            newFrameElapsedTime / currentTimeBetweenFrames
          );
          newFrameIndex += count;
          newFrameElapsedTime =
            newFrameElapsedTime - count * currentTimeBetweenFrames;
          if (newFrameElapsedTime < 0) newFrameElapsedTime = 0;
        }

        // Reset to 0 if we reached the end of the animation.
        if (newFrameIndex >= numberOfFrames) {
          newFrameIndex = isLooping
            ? newFrameIndex % numberOfFrames
            : numberOfFrames - 1;
        }
        if (newFrameIndex < 0) newFrameIndex = 0; //May happen if there is no frame.

        currentFrameIndexRef.current = newFrameIndex;
        currentFrameElapsedTimeRef.current = newFrameElapsedTime;
        // Ensure we trigger an update if the animation changes,
        // as the refs will not do it.
        if (currentFrameIndex !== newFrameIndex) {
          forceUdpate();
        }
      }
      requestRef.current = requestAnimationFrame(updateAnimation);
      previousTimeRef.current = updateTimeInMs;
    },
    [forceUdpate, resourceNames]
  );

  React.useEffect(
    () => {
      requestRef.current = requestAnimationFrame(updateAnimation);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    },
    [updateAnimation]
  );

  // When changing animation, the index can be out of bounds, so reset the animation.
  if (currentFrameIndexRef.current >= resourceNames.length) {
    currentFrameIndexRef.current = 0;
  }

  const resourceName = resourceNames[currentFrameIndexRef.current];

  return (
    <Column expand noOverflowParent>
      <ImagePreview
        resourceName={resourceName}
        imageResourceSource={getImageResourceSource(resourceName)}
        isImageResourceSmooth={isImageResourceSmooth(resourceName)}
        initialZoom={initialZoom}
        project={project}
        hideCheckeredBackground={hideCheckeredBackground}
        hideControls={hideControls}
        fixedHeight={fixedHeight}
      />
      {!hideControls && (
        <Line noMargin alignItems="center">
          <Text>
            <Trans>FPS:</Trans>
          </Text>
          <Spacer />
          <TextField
            margin="none"
            value={fps}
            onChange={(e, text) => {
              const fps = parseFloat(text);
              if (fps > 0) {
                setFps(fps);
                const newTimeBetweenFrames = parseFloat((1 / fps).toFixed(4));
                timeBetweenFramesRef.current = newTimeBetweenFrames;
                if (onChangeTimeBetweenFrames) {
                  onChangeTimeBetweenFrames(newTimeBetweenFrames);
                }
                replay();
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
            margin="none"
            value={timeBetweenFramesRef.current}
            onChange={(e, text) => {
              const time = parseFloat(text);
              if (time > 0) {
                setFps(Math.round(1 / time));
                timeBetweenFramesRef.current = time;
                if (onChangeTimeBetweenFrames) {
                  onChangeTimeBetweenFrames(time);
                }
                replay();
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
            onClick={replay}
          />
          <FlatButton
            icon={!!pausedRef.current ? <PlayArrow /> : <Pause />}
            label={!!pausedRef.current ? 'Play' : 'Pause'}
            onClick={() => {
              pausedRef.current = !pausedRef.current;
              forceUdpate();
            }}
          />
        </Line>
      )}
    </Column>
  );
};

export default AnimationPreview;
