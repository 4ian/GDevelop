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
  leftContainer: {
    display: 'flex',
    overflow: 'hidden', // Ensure large images are not overflowing the other panel.
    flexDirection: 'column', // Ensure the panel provides a scroll bar if needed.
  },
  rightContainer: {
    display: 'flex',
  },
};

const horizontalMosaicNodes: EditorMosaicNode = {
  direction: 'row',
  first: 'preview',
  second: 'properties',
  splitPercentage: 66.67,
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
  onRenamedPoint: (oldName: string, newName: string) => void,
|};

const PointsEditor = ({
  objectConfiguration,
  resourcesLoader,
  project,
  onPointsUpdated,
  onRenamedPoint,
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

  const forceUpdate = useForceUpdate();

  const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);
  const { animation, sprite } = getCurrentElements(
    spriteConfiguration,
    animationIndex,
    directionIndex,
    spriteIndex
  );

  // Note: sprite should always be defined so this value will be correctly initialised.
  const [samePointsForAnimations, setSamePointsForAnimations] = React.useState(
    sprite
      ? every(
          mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
            const otherAnimation = spriteConfiguration.getAnimation(i);
            return allSpritesHaveSamePointsAs(sprite, otherAnimation);
          })
        )
      : false
  );
  // Note: sprite & animation should always be defined so this value will be correctly initialised.
  const [samePointsForSprites, setSamePointsForSprites] = React.useState(
    sprite && animation ? allSpritesHaveSamePointsAs(sprite, animation) : false
  );

  const updatePoints = React.useCallback(
    (samePointsForAnimations: boolean, samePointsForSprites: boolean) => {
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
    [animation, sprite, spriteConfiguration, forceUpdate, onPointsUpdated]
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

  // When an animation or sprite is changed, recompute if all points are the same
  // to enable the toggle.
  // Note: we do not recompute if all animations have the same points, as we consider
  // that if the user has enabled/disabled this, they want to keep it that way.
  React.useEffect(
    () => {
      if (!sprite || !animation) {
        return;
      }
      setSamePointsForSprites(allSpritesHaveSamePointsAs(sprite, animation));
    },
    [animation, sprite]
  );

  const setSamePointsForAllAnimations = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same points for all animations will erase and reset all the other animations points. This can't be undone. Are you sure you want to share these points amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    const newSamePointsForAnimations = enable;
    const newSamePointsForSprites = enable || samePointsForSprites;

    setSamePointsForAnimations(newSamePointsForAnimations);
    setSamePointsForSprites(newSamePointsForSprites);
    updatePoints(newSamePointsForAnimations, newSamePointsForSprites);
  };

  const setSamePointsForAllSprites = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same points for all frames will erase and reset all the other frames points. This can't be undone. Are you sure you want to share these points amongst all the frames of the animation?"
      );
      if (!answer) return;
    }

    const newSamePointsForAnimations = enable && samePointsForAnimations;
    const newSamePointsForSprites = enable;

    setSamePointsForAnimations(newSamePointsForAnimations);
    setSamePointsForSprites(newSamePointsForSprites);
    updatePoints(newSamePointsForAnimations, newSamePointsForSprites);
  };

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
        <Paper background="medium" style={styles.leftContainer} square>
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
              renderOverlay={overlayProps =>
                sprite && (
                  <PointsPreview
                    {...overlayProps}
                    pointsContainer={sprite}
                    onPointsUpdated={() =>
                      updatePoints(
                        samePointsForAnimations,
                        samePointsForSprites
                      )
                    }
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
        <Paper background="medium" style={styles.rightContainer} square>
          <Column noMargin expand>
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
            <ScrollView>
              {!!sprite && (
                <PointsList
                  pointsContainer={sprite}
                  onPointsUpdated={() =>
                    updatePoints(samePointsForAnimations, samePointsForSprites)
                  }
                  selectedPointName={selectedPointName}
                  onHoverPoint={setHighlightedPointName}
                  onSelectPoint={setSelectedPointName}
                  onRenamedPoint={onRenamedPoint}
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
