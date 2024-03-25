// @flow
import { Trans, t } from '@lingui/macro';
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
  allAnimationSpritesHaveSamePointsAs,
  copyAnimationsSpritePoints,
  allObjectSpritesHaveSamePointsAs,
} from '../Utils/SpriteObjectHelper';
import SpriteSelector from '../Utils/SpriteSelector';
import ResourcesLoader from '../../../../ResourcesLoader';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import EditorMosaic, {
  type Editor,
  type EditorMosaicNode,
} from '../../../../UI/EditorMosaic';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import ScrollView from '../../../../UI/ScrollView';
import Paper from '../../../../UI/Paper';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';

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
  animations: gdSpriteAnimationList,
  resourcesLoader: typeof ResourcesLoader,
  project: gdProject,
  onPointsUpdated?: () => void,
  onRenamedPoint: (oldName: string, newName: string) => void,
|};

const PointsEditor = ({
  animations,
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

  const [currentSpriteSize, setCurrentSpriteSize] = React.useState<
    [number, number]
  >([0, 0]);

  const forceUpdate = useForceUpdate();
  const { showConfirmation } = useAlertDialog();

  const { animation, sprite } = getCurrentElements(
    animations,
    animationIndex,
    directionIndex,
    spriteIndex
  );

  // Note: sprite should always be defined so this value will be correctly initialised.
  const [samePointsForAnimations, setSamePointsForAnimations] = React.useState(
    sprite ? allObjectSpritesHaveSamePointsAs(sprite, animations) : false
  );
  // Note: sprite & animation should always be defined so this value will be correctly initialised.
  const [samePointsForSprites, setSamePointsForSprites] = React.useState(
    sprite && animation
      ? allAnimationSpritesHaveSamePointsAs(sprite, animation)
      : false
  );

  const updatePoints = React.useCallback(
    (samePointsForAnimations: boolean, samePointsForSprites: boolean) => {
      if (animation && sprite) {
        if (samePointsForAnimations) {
          mapFor(0, animations.getAnimationsCount(), i => {
            const otherAnimation = animations.getAnimation(i);
            copyAnimationsSpritePoints(sprite, otherAnimation);
          });
        } else if (samePointsForSprites) {
          copyAnimationsSpritePoints(sprite, animation);
        }
      }

      forceUpdate(); // Refresh the preview
      if (onPointsUpdated) onPointsUpdated();
    },
    [animation, sprite, animations, forceUpdate, onPointsUpdated]
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
      setSamePointsForSprites(
        allAnimationSpritesHaveSamePointsAs(sprite, animation)
      );
    },
    [animation, sprite]
  );

  const setSamePointsForAllAnimations = React.useCallback(
    async (enable: boolean) => {
      if (enable) {
        const answer = await showConfirmation({
          title: t`Use same points for all animations?`,
          message: t`
          Having the same points for all animations will erase and reset all the other animations points. This can't be undone. Are you sure you want to share these points amongst all the animations of the object?`,
          confirmButtonLabel: t`Use same points`,
          dismissButtonLabel: t`Cancel`,
        });
        if (!answer) return;
      }

      const newSamePointsForAnimations = enable;
      const newSamePointsForSprites = enable || samePointsForSprites;

      setSamePointsForAnimations(newSamePointsForAnimations);
      setSamePointsForSprites(newSamePointsForSprites);
      updatePoints(newSamePointsForAnimations, newSamePointsForSprites);
    },
    [samePointsForSprites, updatePoints, showConfirmation]
  );

  const setSamePointsForAllSprites = React.useCallback(
    async (enable: boolean) => {
      if (enable) {
        const answer = await showConfirmation({
          title: t`Use same points for all frames?`,
          message: t`Having the same points for all frames will erase and reset all the other frames points. This can't be undone. Are you sure you want to share these points amongst all the frames of the animation?`,
          confirmButtonLabel: t`Use same points`,
          dismissButtonLabel: t`Cancel`,
        });
        if (!answer) return;
      }

      const newSamePointsForAnimations = enable && samePointsForAnimations;
      const newSamePointsForSprites = enable;

      setSamePointsForAnimations(newSamePointsForAnimations);
      setSamePointsForSprites(newSamePointsForSprites);
      updatePoints(newSamePointsForAnimations, newSamePointsForSprites);
    },
    [samePointsForAnimations, updatePoints, showConfirmation]
  );

  // Keep panes vertical for small screens, side-by-side for large screens
  const { isMobile } = useResponsiveWindowSize();
  const editorNodes = isMobile ? verticalMosaicNodes : horizontalMosaicNodes;

  if (!animations.getAnimationsCount()) return null;
  const resourceName = sprite ? sprite.getImageName() : '';

  const editors: { [string]: Editor } = {
    preview: {
      type: 'primary',
      noTitleBar: true,
      noSoftKeyboardAvoidance: true,
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
              onImageSize={setCurrentSpriteSize}
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
      noSoftKeyboardAvoidance: true,
      renderEditor: () => (
        <Paper background="medium" style={styles.rightContainer} square>
          <Column noMargin expand>
            <Line>
              <Column expand>
                <SpriteSelector
                  animations={animations}
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
                  spriteSize={currentSpriteSize}
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
