// @flow
import { Trans, t } from '@lingui/macro';
import React from 'react';
import FlatButton from '../../../../UI/FlatButton';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PolygonsList from './PolygonsList';
import CollisionMasksPreview from './CollisionMasksPreview';
import ImagePreview, {
  isProjectImageResourceSmooth,
} from '../../../../ResourcesList/ResourcePreview/ImagePreview';
import {
  getCurrentElements,
  allAnimationSpritesHaveSameCollisionMasksAs,
  copyAnimationsSpriteCollisionMasks,
  allObjectSpritesHaveSameCollisionMaskAs,
} from '../Utils/SpriteObjectHelper';
import SpriteSelector from '../Utils/SpriteSelector';
import ResourcesLoader from '../../../../ResourcesLoader';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import EditorMosaic, {
  type Editor,
  type EditorMosaicNode,
} from '../../../../UI/EditorMosaic';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import Paper from '../../../../UI/Paper';
import ScrollView from '../../../../UI/ScrollView';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import AlertMessage from '../../../../UI/AlertMessage';

const styles = {
  leftContainer: {
    display: 'flex',
    overflow: 'hidden', // Ensure large images are not overflowing the other panel.
    flexDirection: 'column', // Ensure the panel provides a scroll bar if needed.
  },
  rightContainer: {
    display: 'flex',
    paddingLeft: 4,
    paddingRight: 4,
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
  onMasksUpdated?: () => void,
  onCreateMatchingSpriteCollisionMask: () => Promise<void>,
|};

const CollisionMasksEditor = ({
  animations,
  resourcesLoader,
  project,
  onMasksUpdated,
  onCreateMatchingSpriteCollisionMask,
}: Props) => {
  const [animationIndex, setAnimationIndex] = React.useState(0);
  const [directionIndex, setDirectionIndex] = React.useState(0);
  const [spriteIndex, setSpriteIndex] = React.useState(0);
  const [
    highlightedVerticePtr,
    setHighlightedVerticePtr,
  ] = React.useState<?number>(null);
  const [selectedVerticePtr, setSelectedVerticePtr] = React.useState<?number>(
    null
  );

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
  const [
    sameCollisionMasksForAnimations,
    setSameCollisionMasksForAnimations,
  ] = React.useState(
    sprite ? allObjectSpritesHaveSameCollisionMaskAs(sprite, animations) : false
  );

  // Note: sprite & animation should always be defined so this value will be correctly initialised.
  const [
    sameCollisionMasksForSprites,
    setSameCollisionMasksForSprites,
  ] = React.useState(
    sprite && animation
      ? allAnimationSpritesHaveSameCollisionMasksAs(sprite, animation)
      : false
  );

  const updateCollisionMasks = React.useCallback(
    (sameCollisionMasksForAnimations, sameCollisionMasksForSprites) => {
      if (animation && sprite) {
        if (sameCollisionMasksForAnimations) {
          mapFor(0, animations.getAnimationsCount(), i => {
            const otherAnimation = animations.getAnimation(i);
            copyAnimationsSpriteCollisionMasks(sprite, otherAnimation);
          });
        } else if (sameCollisionMasksForSprites) {
          copyAnimationsSpriteCollisionMasks(sprite, animation);
        }
      }

      forceUpdate(); // Refresh the preview and the list
      if (onMasksUpdated) onMasksUpdated();
    },
    [animation, sprite, animations, forceUpdate, onMasksUpdated]
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

  // When an animation or sprite is changed, recompute if all collision masks are the same
  // to enable the toggle.
  // Note: we do not recompute if all animations have the same collision masks, as we consider
  // that if the user has enabled/disabled this, they want to keep it that way.
  React.useEffect(
    () => {
      if (!animation || !sprite) return;

      setSameCollisionMasksForSprites(
        allAnimationSpritesHaveSameCollisionMasksAs(sprite, animation)
      );
    },
    [animation, sprite]
  );

  const onSetFullImageCollisionMask = React.useCallback(
    async (fullImage: boolean = true) => {
      if (!sprite) return;
      if (fullImage) {
        // Revert to non-automatic collision mask.
        animations.setAdaptCollisionMaskAutomatically(false);
      }
      sprite.setFullImageCollisionMask(fullImage);
      updateCollisionMasks(
        sameCollisionMasksForAnimations,
        sameCollisionMasksForSprites
      );
    },
    [
      sprite,
      updateCollisionMasks,
      sameCollisionMasksForAnimations,
      sameCollisionMasksForSprites,
      animations,
    ]
  );

  const setSameCollisionMasksForAllAnimations = React.useCallback(
    async (enable: boolean) => {
      if (enable) {
        const answer = await showConfirmation({
          title: t`Use same collision mask for all animations?`,
          message: t`Having the same collision masks for all animations will erase and reset all the other animations collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the animations of the object?`,
          confirmButtonLabel: t`Use same collision mask`,
          dismissButtonLabel: t`Cancel`,
        });
        if (!answer) return;
      }

      const newSameCollisionMasksForAnimationsValue = enable;
      const newSameCollisionMasksForSpritesValue =
        enable || sameCollisionMasksForSprites;

      setSameCollisionMasksForAnimations(
        newSameCollisionMasksForAnimationsValue
      );
      setSameCollisionMasksForSprites(newSameCollisionMasksForSpritesValue);
      updateCollisionMasks(
        newSameCollisionMasksForAnimationsValue,
        newSameCollisionMasksForSpritesValue
      );
    },
    [sameCollisionMasksForSprites, updateCollisionMasks, showConfirmation]
  );

  const setSameCollisionMasksForAllSprites = React.useCallback(
    async (enable: boolean) => {
      if (enable) {
        const answer = await showConfirmation({
          title: t`Use same collision mask for all frames?`,
          message: t`
          Having the same collision masks for all frames will erase and reset all the other frames collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the frames of the animation?`,
          confirmButtonLabel: t`Use same collision mask`,
          dismissButtonLabel: t`Cancel`,
        });
        if (!answer) return;
      }

      const newSameCollisionMasksForAnimationsValue =
        enable && sameCollisionMasksForAnimations;
      const newSameCollisionMasksForSpritesValue = enable;

      setSameCollisionMasksForAnimations(
        newSameCollisionMasksForAnimationsValue
      );
      setSameCollisionMasksForSprites(newSameCollisionMasksForSpritesValue);
      updateCollisionMasks(
        newSameCollisionMasksForAnimationsValue,
        newSameCollisionMasksForSpritesValue
      );
    },
    [sameCollisionMasksForAnimations, updateCollisionMasks, showConfirmation]
  );

  const onSetAutomaticallyAdaptCollisionMasks = React.useCallback(
    async value => {
      // If enabling automatic while custom was selected, then ask for confirmation.
      if (value && sprite && !sprite.isFullImageCollisionMask()) {
        const answer = await showConfirmation({
          title: t`Adapt collision mask?`,
          message: t`
            You will lose all custom collision masks. Do you want to continue?`,
          confirmButtonLabel: t`Adapt automatically`,
          dismissButtonLabel: t`Cancel`,
        });
        if (!answer) return;
      }

      animations.setAdaptCollisionMaskAutomatically(value);

      // Recompute collision mask when enabling automatic, and enable same masks for all animations & sprites.
      if (value) {
        onCreateMatchingSpriteCollisionMask();
        setSameCollisionMasksForAnimations(true);
        setSameCollisionMasksForSprites(true);
      }
      forceUpdate();
    },
    [
      animations,
      forceUpdate,
      onCreateMatchingSpriteCollisionMask,
      showConfirmation,
      sprite,
    ]
  );

  const onUseCustomCollisionMask = React.useCallback(
    () => {
      onSetFullImageCollisionMask(false);
      onSetAutomaticallyAdaptCollisionMasks(false);
    },
    [onSetFullImageCollisionMask, onSetAutomaticallyAdaptCollisionMasks]
  );

  const onPolygonsUpdated = React.useCallback(
    () => {
      // Revert to non-automatic collision mask.
      animations.setAdaptCollisionMaskAutomatically(false);
      updateCollisionMasks(
        sameCollisionMasksForAnimations,
        sameCollisionMasksForSprites
      );
    },
    [
      animations,
      updateCollisionMasks,
      sameCollisionMasksForAnimations,
      sameCollisionMasksForSprites,
    ]
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
          <Column expand noMargin useFullHeight>
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
                  <CollisionMasksPreview
                    {...overlayProps}
                    isDefaultBoundingBox={sprite.isFullImageCollisionMask()}
                    hideControls={animations.adaptCollisionMaskAutomatically()}
                    polygons={sprite.getCustomCollisionMask()}
                    onPolygonsUpdated={onPolygonsUpdated}
                    highlightedVerticePtr={highlightedVerticePtr}
                    selectedVerticePtr={selectedVerticePtr}
                    onClickVertice={setSelectedVerticePtr}
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
          <Column expand noMargin>
            <Line>
              <Column expand noMargin>
                <SpriteSelector
                  animations={animations}
                  animationIndex={animationIndex}
                  directionIndex={directionIndex}
                  spriteIndex={spriteIndex}
                  chooseAnimation={chooseAnimation}
                  chooseDirection={chooseDirection}
                  chooseSprite={chooseSprite}
                  sameForAllAnimations={sameCollisionMasksForAnimations}
                  sameForAllSprites={sameCollisionMasksForSprites}
                  setSameForAllAnimations={
                    setSameCollisionMasksForAllAnimations
                  }
                  setSameForAllSprites={setSameCollisionMasksForAllSprites}
                  setSameForAllAnimationsLabel={
                    <Trans>Share same collision masks for all animations</Trans>
                  }
                  setSameForAllSpritesLabel={
                    <Trans>
                      Share same collision masks for all sprites of this
                      animation
                    </Trans>
                  }
                  hideControlsForSprite={(sprite: gdSprite) =>
                    animations.adaptCollisionMaskAutomatically() ||
                    sprite.isFullImageCollisionMask()
                  }
                />
              </Column>
            </Line>
            <ScrollView>
              {!!sprite &&
                !sprite.isFullImageCollisionMask() &&
                !animations.adaptCollisionMaskAutomatically() && (
                  <React.Fragment>
                    <PolygonsList
                      polygons={sprite.getCustomCollisionMask()}
                      onPolygonsUpdated={onPolygonsUpdated}
                      onSetFullImageCollisionMask={() =>
                        onSetFullImageCollisionMask(true)
                      }
                      onSetAutomaticallyAdaptCollisionMasks={() =>
                        onSetAutomaticallyAdaptCollisionMasks(true)
                      }
                      onHoverVertice={setHighlightedVerticePtr}
                      onClickVertice={setSelectedVerticePtr}
                      selectedVerticePtr={selectedVerticePtr}
                      spriteSize={currentSpriteSize}
                    />
                  </React.Fragment>
                )}
              {!!sprite &&
                !sprite.isFullImageCollisionMask() &&
                animations.adaptCollisionMaskAutomatically() && (
                  <React.Fragment>
                    <AlertMessage kind="info">
                      <Trans>
                        Automatic collision mask activated. Click on the button
                        to replace it with a custom one.
                      </Trans>
                    </AlertMessage>
                    <Line justifyContent="center">
                      <FlatButton
                        label={<Trans>Use a custom collision mask</Trans>}
                        primary={false}
                        onClick={onUseCustomCollisionMask}
                      />
                    </Line>
                  </React.Fragment>
                )}
              {!!sprite && sprite.isFullImageCollisionMask() && (
                <React.Fragment>
                  <AlertMessage kind="info">
                    <Trans>
                      This sprite uses a rectangle that is as large as the
                      sprite for its collision mask.
                    </Trans>
                  </AlertMessage>
                  <Line justifyContent="center">
                    <FlatButton
                      label={<Trans>Use a custom collision mask</Trans>}
                      primary={false}
                      onClick={onUseCustomCollisionMask}
                    />
                  </Line>
                </React.Fragment>
              )}
              {!sprite && (
                <EmptyMessage>
                  <Trans>
                    Choose an animation and frame to edit the collision masks
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

export default CollisionMasksEditor;
