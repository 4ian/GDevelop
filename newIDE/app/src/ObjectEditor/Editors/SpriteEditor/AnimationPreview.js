// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import { Column } from '../../../UI/Grid';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';
import ImagePreview from '../../../ResourcesList/ResourcePreview/ImagePreview';
import Replay from '@material-ui/icons/Replay';
import Timer from '@material-ui/icons/Timer';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import FlatButton from '../../../UI/FlatButton';
import Text from '../../../UI/Text';
import useForceUpdate from '../../../Utils/UseForceUpdate';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import Play from '../../../UI/CustomSvgIcons/Play';
import Pause from '../../../UI/CustomSvgIcons/Pause';
import { toFixedWithoutTrailingZeros } from '../../../Utils/Mathematics';
import { type SpriteSourceRect } from '../../../Utils/SpriteSourceRect';

const styles = {
  // This container is important to have the loader positioned on top of the image.
  imageContainer: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    width: '100%', // Needed for ImagePreview to be able to scroll horizontally
    height: 'calc(100% - 80px)', // 80px are allocated to the space the play pause button line can take once the responsive line stack layout is collapsed
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
  sourceRects?: Array<?SpriteSourceRect>,
  getImageResourceSource: (resourceName: string) => string,
  isImageResourceSmooth: (resourceName: string) => boolean,
  timeBetweenFrames: number,
  onChangeTimeBetweenFrames?: number => void,
  isLooping: boolean,
  hideCheckeredBackground?: boolean,
  deactivateControls?: boolean,
  displaySpacedView?: boolean,
  fixedHeight?: number,
  fixedWidth?: number,
  isAssetPrivate?: boolean,
  hideAnimationLoader?: boolean,
  project?: gdProject,
|};

const AnimationPreview = ({
  animationName,
  resourceNames,
  sourceRects,
  getImageResourceSource,
  isImageResourceSmooth,
  timeBetweenFrames,
  onChangeTimeBetweenFrames,
  isLooping,
  hideCheckeredBackground,
  deactivateControls,
  displaySpacedView,
  fixedHeight,
  fixedWidth,
  isAssetPrivate,
  hideAnimationLoader,
  project,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();

  const fps = Number.parseFloat((1 / timeBetweenFrames).toFixed(4));

  // Use useRef for mutable variables that we want to persist
  // to be readable from inside the animation callback.
  const requestRef = React.useRef();
  const previousTimeRef = React.useRef();
  const currentFrameElapsedTimeRef = React.useRef(0);
  const timeBetweenFramesRef = React.useRef(timeBetweenFrames);
  const pausedRef = React.useRef(false);
  const currentFrameIndexRef = React.useRef(0);
  const isLoopingRef = React.useRef(isLooping);
  const animationNameRef = React.useRef(animationName);
  const resourceNamesKeyRef = React.useRef(JSON.stringify(resourceNames));
  const loadedResourceNamesRef = React.useRef<Set<string>>(new Set());
  const loaderTimeout = React.useRef<?TimeoutID>(null);

  const [isStillLoadingResources, setIsStillLoadingResources] = React.useState(
    true
  );

  // When outside variables change, we need to update the animation callback.
  React.useEffect(
    () => {
      if (isLooping !== isLoopingRef.current) {
        isLoopingRef.current = isLooping;
      }
      if (animationName !== animationNameRef.current) {
        animationNameRef.current = animationName;
      }
      const resourceNamesKey = JSON.stringify(resourceNames);
      if (resourceNamesKey !== resourceNamesKeyRef.current) {
        resourceNamesKeyRef.current = resourceNamesKey;
        loadedResourceNamesRef.current = new Set();
        setIsStillLoadingResources(!!resourceNames.length);
      }
    },
    [timeBetweenFrames, isLooping, animationName, resourceNames]
  );

  const replay = () => {
    currentFrameIndexRef.current = 0;
    currentFrameElapsedTimeRef.current = 0;
    pausedRef.current = false;
    forceUpdate();
  };

  // Variables used inside the requestAnimationFrame callback
  // must be declared as mutable with useRef, otherwise they
  // will not update between calls.
  // $FlowFixMe[recursive-definition]
  // $FlowFixMe[definition-cycle]
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
      const currentResourceName = resourceNames[currentFrameIndex];

      const hasCurrentImageLoaded = loadedResourceNamesRef.current.has(
        currentResourceName
      );
      // $FlowFixMe[constant-condition]
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
          if (!loadedResourceNamesRef.current.has(newResourceName)) {
            // When the array of loaders changes, wait a bit to display the loader to avoid flickering.
            loaderTimeout.current = setTimeout(() => {
              console.warn(
                'The image took too long to load, displaying a loader.'
              );
              setIsStillLoadingResources(true);
            }, 500);
          }
          forceUpdate();
        }
      }
      // $FlowFixMe[incompatible-type]
      requestRef.current = requestAnimationFrame(updateAnimation);
      // $FlowFixMe[incompatible-type]
      previousTimeRef.current = updateTimeInMs;
    },
    [forceUpdate, resourceNames]
  );

  React.useEffect(
    () => {
      // $FlowFixMe[incompatible-type]
      requestRef.current = requestAnimationFrame(updateAnimation);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    },
    [updateAnimation]
  );

  const onImageLoaded = React.useCallback(
    () => {
      loadedResourceNamesRef.current.add(
        resourceNames[currentFrameIndexRef.current]
      );
      // When the array of loaders changes, decide if we display the loader or not.
      // If all images are loaded, then hide loader for instant display.
      const hasFinishedLoadingAllResources = resourceNames.every(resourceName =>
        loadedResourceNamesRef.current.has(resourceName)
      );
      if (hasFinishedLoadingAllResources) {
        setIsStillLoadingResources(false);
      }
      // Image has loaded, so cancel the timeout if it was set.
      if (loaderTimeout.current) {
        clearTimeout(loaderTimeout.current);
        loaderTimeout.current = null;
      }
      forceUpdate();
    },
    [forceUpdate, resourceNames]
  );

  // When changing animation, the index can be out of bounds, so reset the animation.
  if (currentFrameIndexRef.current >= resourceNames.length) {
    currentFrameIndexRef.current = 0;
  }

  const imageFrameIndexes = React.useMemo(
    () => {
      let previousWholeImageName: ?string = null;
      let consecutiveWholeImageFrameIndex = 0;
      return resourceNames.map((resourceName, index) => {
        const sourceRect = sourceRects ? sourceRects[index] : null;
        if (!sourceRect && resourceName) {
          if (resourceName === previousWholeImageName) {
            consecutiveWholeImageFrameIndex++;
          } else {
            previousWholeImageName = resourceName;
            consecutiveWholeImageFrameIndex = 0;
          }
          return consecutiveWholeImageFrameIndex;
        }

        previousWholeImageName = null;
        consecutiveWholeImageFrameIndex = 0;
        return 0;
      });
    },
    [resourceNames, sourceRects]
  );

  const resourceName = resourceNames[currentFrameIndexRef.current];
  const sourceRect = sourceRects
    ? sourceRects[currentFrameIndexRef.current]
    : null;
  const imageFrameIndex = imageFrameIndexes[currentFrameIndexRef.current] || 0;

  return (
    <Column expand noOverflowParent noMargin>
      <div style={styles.imageContainer}>
        <ImagePreview
          resourceName={resourceName}
          imageResourceSource={getImageResourceSource(resourceName)}
          sourceRect={sourceRect}
          project={project}
          imageFrameIndex={imageFrameIndex}
          isImageResourceSmooth={isImageResourceSmooth(resourceName)}
          displaySpacedView={displaySpacedView}
          hideCheckeredBackground={hideCheckeredBackground}
          deactivateControls={deactivateControls}
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
      {!deactivateControls && (
        // Column used to not have the expand behavior when responsive line stack layout is a column
        <Column noMargin>
          <ResponsiveLineStackLayout alignItems="center" noResponsiveLandscape>
            <LineStackLayout
              alignItems="center"
              justifyContent="center"
              noMargin
            >
              <Text>
                <Trans>FPS:</Trans>
              </Text>
              <SemiControlledTextField
                commitOnBlur
                margin="none"
                value={fps.toString()}
                onChange={text => {
                  if (!text) return;
                  const newFps = Number.parseFloat(text);
                  if (newFps > 0) {
                    const newTimeBetweenFrames = 1 / newFps;
                    timeBetweenFramesRef.current = newTimeBetweenFrames;
                    if (onChangeTimeBetweenFrames) {
                      onChangeTimeBetweenFrames(newTimeBetweenFrames);
                    }
                    replay();
                  }
                }}
                id="direction-time-between-frames"
                type="number"
                min={0}
                max={100}
                style={styles.timeField}
              />
              <Timer style={styles.timeIcon} />
              <SemiControlledTextField
                commitOnBlur
                margin="none"
                value={toFixedWithoutTrailingZeros(
                  timeBetweenFramesRef.current,
                  6
                )}
                onChange={text => {
                  if (!text) return;
                  const time = Number.parseFloat(text);
                  if (time > 0) {
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
            </LineStackLayout>
            <LineStackLayout
              alignItems="center"
              justifyContent="center"
              noMargin
            >
              <FlatButton
                leftIcon={<Replay />}
                label={<Trans>Replay</Trans>}
                onClick={replay}
              />
              <FlatButton
                leftIcon={!!pausedRef.current ? <Play /> : <Pause />}
                label={!!pausedRef.current ? 'Play' : 'Pause'}
                onClick={() => {
                  pausedRef.current = !pausedRef.current;
                  forceUpdate();
                }}
              />
            </LineStackLayout>
          </ResponsiveLineStackLayout>
        </Column>
      )}
    </Column>
  );
};

export default AnimationPreview;
