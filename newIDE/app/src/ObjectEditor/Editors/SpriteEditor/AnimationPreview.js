// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import { Column, Line } from '../../../UI/Grid';
import { LineStackLayout } from '../../../UI/Layout';
import ImagePreview from '../../../ResourcesList/ResourcePreview/ImagePreview';
import Replay from '@material-ui/icons/Replay';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import Timer from '@material-ui/icons/Timer';
import TextField from '../../../UI/TextField';
import FlatButton from '../../../UI/FlatButton';
import Text from '../../../UI/Text';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';

const styles = {
  // This container is important to have the loader positioned on top of the image.
  imageContainer: {
    position: 'relative',
    display: 'flex',
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    left: 'calc(50% - 30px)',
    top: 'calc(50% - 30px)',
  },
  timeField: {
    width: 75,
  },
  timeIcon: {
    paddingLeft: 6,
    paddingRight: 8,
  },
};

type Props = {|
  animationName: string,
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
  fixedWidth?: number,
  isAssetPrivate?: boolean,
  hideAnimationLoader?: boolean,
|};

const AnimationPreview = ({
  animationName,
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
  fixedWidth,
  isAssetPrivate,
  hideAnimationLoader,
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
  const currentResourceNameRef = React.useRef(resourceNames[0]);
  const isLoopingRef = React.useRef(isLooping);
  const animationNameRef = React.useRef(animationName);
  const imagesLoadedArray = React.useRef(
    new Array(resourceNames.length).fill(false)
  );
  const loaderTimeout = React.useRef<?TimeoutID>(null);

  const [isStillLoadingResources, setIsStillLoadingResources] = React.useState(
    true
  );

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
      if (animationName !== animationNameRef.current) {
        animationNameRef.current = animationName;
        imagesLoadedArray.current = new Array(resourceNames.length).fill(false);
      }
    },
    [timeBetweenFrames, isLooping, animationName, resourceNames]
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

      const hasCurrentImageLoaded =
        imagesLoadedArray.current[currentFrameIndex];
      if (previousUpdateTimeInMs && hasCurrentImageLoaded) {
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
        if (newFrameIndex < 0) newFrameIndex = 0; // May happen if there is no frame.

        currentFrameIndexRef.current = newFrameIndex;
        currentFrameElapsedTimeRef.current = newFrameElapsedTime;
        const newResourceName = resourceNames[currentFrameIndexRef.current];
        // Ensure we trigger an update if the frame changes,
        // as the refs will not do it.
        if (currentFrameIndex !== newFrameIndex) {
          if (newResourceName === currentResourceNameRef.current) {
            // Important: if the resource name is the same on the following frame,
            // it means the same image is used for multiple frames in the animation.
            // In this case, we can consider the image as already loaded.
            // Not doing so will cause the animation to be stuck on this frame,
            // as the image onLoad will never be triggered.
            imagesLoadedArray.current[currentFrameIndexRef.current] = true;
          } else {
            imagesLoadedArray.current[currentFrameIndexRef.current] = false;
            // When the array of loaders changes, wait a bit to display the loader to avoid flickering.
            loaderTimeout.current = setTimeout(() => {
              console.warn(
                'The image took too long to load, displaying a loader.'
              );
              setIsStillLoadingResources(true);
            }, 500);
          }
          currentResourceNameRef.current = newResourceName;
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

  const onImageLoaded = React.useCallback(
    () => {
      imagesLoadedArray.current[currentFrameIndexRef.current] = true;
      // When the array of loaders changes, decide if we display the loader or not.
      // If all images are loaded, then hide loader for instant display.
      const hasFinishedLoadingAllResources = !imagesLoadedArray.current.some(
        hasImageLoaded => !hasImageLoaded
      );
      if (hasFinishedLoadingAllResources) {
        setIsStillLoadingResources(false);
      }
      // Image has loaded, so cancel the timeout if it was set.
      if (loaderTimeout.current) {
        clearTimeout(loaderTimeout.current);
        loaderTimeout.current = null;
      }
      forceUdpate();
    },
    [forceUdpate]
  );

  // When changing animation, the index can be out of bounds, so reset the animation.
  if (currentFrameIndexRef.current >= resourceNames.length) {
    currentFrameIndexRef.current = 0;
  }

  const resourceName = resourceNames[currentFrameIndexRef.current];

  return (
    <Column expand noOverflowParent noMargin>
      <Line noMargin expand>
        <div style={styles.imageContainer}>
          <ImagePreview
            resourceName={resourceName}
            imageResourceSource={getImageResourceSource(resourceName)}
            isImageResourceSmooth={isImageResourceSmooth(resourceName)}
            initialZoom={initialZoom}
            project={project}
            hideCheckeredBackground={hideCheckeredBackground}
            hideControls={hideControls}
            fixedHeight={fixedHeight}
            fixedWidth={fixedWidth}
            onImageLoaded={onImageLoaded}
            isImagePrivate={isAssetPrivate}
            hideLoader // Handled by the animation preview, important to let the browser cache the image.
          />
          {!hideAnimationLoader && isStillLoadingResources && (
            <div style={styles.loaderContainer}>
              <PlaceholderLoader />
            </div>
          )}
        </div>
      </Line>
      {!hideControls && (
        <LineStackLayout noMargin alignItems="center">
          <Text>
            <Trans>FPS:</Trans>
          </Text>
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
            leftIcon={<Replay />}
            label={<Trans>Replay</Trans>}
            onClick={replay}
          />
          <FlatButton
            leftIcon={!!pausedRef.current ? <PlayArrow /> : <Pause />}
            label={!!pausedRef.current ? 'Play' : 'Pause'}
            onClick={() => {
              pausedRef.current = !pausedRef.current;
              forceUdpate();
            }}
          />
        </LineStackLayout>
      )}
    </Column>
  );
};

export default AnimationPreview;
