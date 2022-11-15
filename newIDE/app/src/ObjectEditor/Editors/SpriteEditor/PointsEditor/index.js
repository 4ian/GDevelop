// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PointsList from './PointsList';
import PointsPreview from './PointsPreview';
import ImagePreview, {
  isProjectImageResourceSmooth,
} from '../../../../ResourcesList/ResourcePreview/ImagePreview';
import {
  getCurrentElements,
  allSpritesHaveSamePointsAs,
  copyAnimationsSpritePoints,
} from '../Utils/SpriteObjectHelper';
import SpriteSelector from '../Utils/SpriteSelector';
import Window from '../../../../Utils/Window';
import every from 'lodash/every';
import ResourcesLoader from '../../../../ResourcesLoader';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import EditorMosaic, {
  type Editor,
  type EditorMosaicNode,
} from '../../../../UI/EditorMosaic';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import ScrollView from '../../../../UI/ScrollView';
import Paper from '../../../../UI/Paper';
const gd: libGDevelop = global.gd;

const styles = {
  container: {
    display: 'flex',
    overflow: 'hidden', // Ensure large images are not overflowing the other panel.
    flexDirection: 'column', // Ensure the panel provides a scroll bar if needed.
  },
};

const horizontalMosaicNodes: EditorMosaicNode = {
  direction: 'row',
  first: 'preview',
  second: 'properties',
  splitPercentage: 50,
};

const verticalMosaicNodes: EditorMosaicNode = {
  direction: 'column',
  first: 'preview',
  second: 'properties',
  splitPercentage: 50,
};

type Props = {|
  objectConfiguration: gdSpriteObject,
  resourcesLoader: typeof ResourcesLoader,
  project: gdProject,
  onPointsUpdated?: () => void,
|};

const PointsEditor = ({
  objectConfiguration,
  resourcesLoader,
  project,
  onPointsUpdated,
}: Props) => {
  const [animationIndex, setAnimationIndex] = React.useState(0);
  const [directionIndex, setDirectionIndex] = React.useState(0);
  const [spriteIndex, setSpriteIndex] = React.useState(0);
  const [selectedPointName, setSelectedPointName] = React.useState<?string>(
    null
  );
  const [
    highlightedPointName,
    setHighlightedPointName,
  ] = React.useState<?string>(null);

  // Note: these two booleans are set to false to avoid erasing points of other
  // animations/frames (and they will be updated by updateSamePointsToggles). In
  // theory, they should be set to the appropriate value at their initialization,
  // for consistency of the state.
  const [samePointsForAnimations, setSamePointsForAnimations] = React.useState(
    false
  );
  const [samePointsForSprites, setSamePointsForSprites] = React.useState(false);
  const forceUpdate = useForceUpdate();

  const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);
  const { animation, sprite } = getCurrentElements(
    spriteConfiguration,
    animationIndex,
    directionIndex,
    spriteIndex
  );

  const updatePoints = React.useCallback(
    () => {
      if (animation && sprite) {
        if (samePointsForAnimations) {
          mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
            const otherAnimation = spriteConfiguration.getAnimation(i);
            copyAnimationsSpritePoints(sprite, otherAnimation);
          });
        } else if (samePointsForSprites) {
          copyAnimationsSpritePoints(sprite, animation);
        }
      }

      forceUpdate(); // Refresh the preview
      if (onPointsUpdated) onPointsUpdated();
    },
    [
      animation,
      sprite,
      spriteConfiguration,
      samePointsForAnimations,
      samePointsForSprites,
      forceUpdate,
      onPointsUpdated,
    ]
  );

  const chooseAnimation = index => {
    setAnimationIndex(index);
    setDirectionIndex(0);
    setSpriteIndex(0);
  };

  const chooseDirection = index => {
    setDirectionIndex(index);
    setSpriteIndex(0);
  };

  const chooseSprite = index => {
    setSpriteIndex(index);
  };

  const updateSamePointsToggles = () => {
    if (!animation || !sprite) return;

    setSamePointsForAnimations(
      every(
        mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
          const otherAnimation = spriteConfiguration.getAnimation(i);
          return allSpritesHaveSamePointsAs(sprite, otherAnimation);
        })
      )
    );

    setSamePointsForSprites(allSpritesHaveSamePointsAs(sprite, animation));
  };

  const setSamePointsForAllAnimations = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same points for all animations will erase and reset all the other animations points. This can't be undone. Are you sure you want to share these points amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    setSamePointsForAnimations(enable);
    setSamePointsForSprites(enable || samePointsForSprites);
  };

  const setSamePointsForAllSprites = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same points for all frames will erase and reset all the other frames points. This can't be undone. Are you sure you want to share these points amongst all the frames of the animation?"
      );
      if (!answer) return;
    }

    setSamePointsForAnimations(enable && samePointsForAnimations);
    setSamePointsForSprites(enable);
  };

  // Note: might be worth fixing these warnings:
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(updateSamePointsToggles, [animationIndex]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(updatePoints, [
    samePointsForAnimations,
    samePointsForSprites,
  ]);

  // Keep panes vertical for small screens, side-by-side for large screens
  const screenSize = useResponsiveWindowWidth();
  const editorNodes =
    screenSize === 'small' ? verticalMosaicNodes : horizontalMosaicNodes;

  if (!objectConfiguration.getAnimationsCount()) return null;
  const resourceName = sprite ? sprite.getImageName() : '';

  const editors: { [string]: Editor } = {
    preview: {
      type: 'primary',
      noTitleBar: true,
      renderEditor: () => (
        <Paper background="medium" style={styles.container} square>
          <Column noMargin expand useFullHeight>
            <ImagePreview
              resourceName={resourceName}
              imageResourceSource={resourcesLoader.getResourceFullUrl(
                project,
                resourceName,
                {}
              )}
              isImageResourceSmooth={isProjectImageResourceSmooth(
                project,
                resourceName
              )}
              project={project}
              renderOverlay={overlayProps =>
                sprite && (
                  <PointsPreview
                    {...overlayProps}
                    pointsContainer={sprite}
                    onPointsUpdated={updatePoints}
                    selectedPointName={selectedPointName}
                    highlightedPointName={highlightedPointName}
                    onClickPoint={setSelectedPointName}
                  />
                )
              }
            />
          </Column>
        </Paper>
      ),
    },
    properties: {
      type: 'secondary',
      noTitleBar: true,
      renderEditor: () => (
        <Paper background="medium" style={styles.container} square>
          <Column noMargin expand>
            <ScrollView>
              <Line>
                <Column expand>
                  <SpriteSelector
                    spriteConfiguration={spriteConfiguration}
                    animationIndex={animationIndex}
                    directionIndex={directionIndex}
                    spriteIndex={spriteIndex}
                    chooseAnimation={chooseAnimation}
                    chooseDirection={chooseDirection}
                    chooseSprite={chooseSprite}
                    sameForAllAnimations={samePointsForAnimations}
                    sameForAllSprites={samePointsForSprites}
                    setSameForAllAnimations={setSamePointsForAllAnimations}
                    setSameForAllSprites={setSamePointsForAllSprites}
                    setSameForAllAnimationsLabel={
                      <Trans>Share same points for all animations</Trans>
                    }
                    setSameForAllSpritesLabel={
                      <Trans>
                        Share same points for all sprites of this animation
                      </Trans>
                    }
                  />
                </Column>
              </Line>
              {!!sprite && (
                <PointsList
                  pointsContainer={sprite}
                  onPointsUpdated={updatePoints}
                  selectedPointName={selectedPointName}
                  onHoverPoint={setHighlightedPointName}
                  onSelectPoint={setSelectedPointName}
                />
              )}
              {!sprite && (
                <EmptyMessage>
                  <Trans>
                    Choose an animation and frame to edit the points
                  </Trans>
                </EmptyMessage>
              )}
            </ScrollView>
          </Column>
        </Paper>
      ),
    },
  };

  return (
    <div style={{ flex: 1 }}>
      <EditorMosaic editors={editors} initialNodes={editorNodes} />
    </div>
  );
};

export default PointsEditor;
