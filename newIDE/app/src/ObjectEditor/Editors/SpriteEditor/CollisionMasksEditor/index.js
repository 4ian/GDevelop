// @flow
import { Trans } from '@lingui/macro';
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
  allSpritesHaveSameCollisionMasksAs,
  copyAnimationsSpriteCollisionMasks,
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
import Paper from '../../../../UI/Paper';
import ScrollView from '../../../../UI/ScrollView';
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
  onMasksUpdated?: () => void,
|};

const CollisionMasksEditor = ({
  objectConfiguration,
  resourcesLoader,
  project,
  onMasksUpdated,
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

  const [spriteWidth, setSpriteWidth] = React.useState(0);
  const [spriteHeight, setSpriteHeight] = React.useState(0);
  const forceUpdate = useForceUpdate();

  const spriteConfiguration = gd.asSpriteConfiguration(objectConfiguration);
  const { animation, sprite } = getCurrentElements(
    spriteConfiguration,
    animationIndex,
    directionIndex,
    spriteIndex
  );

  // Note: sprite should always be defined so this value will be correctly initialised.
  const [
    sameCollisionMasksForAnimations,
    setSameCollisionMasksForAnimations,
  ] = React.useState(
    sprite
      ? every(
          mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
            const otherAnimation = spriteConfiguration.getAnimation(i);
            return allSpritesHaveSameCollisionMasksAs(sprite, otherAnimation);
          })
        )
      : false
  );

  // Note: sprite & animation should always be defined so this value will be correctly initialised.
  const [
    sameCollisionMasksForSprites,
    setSameCollisionMasksForSprites,
  ] = React.useState(
    sprite && animation
      ? allSpritesHaveSameCollisionMasksAs(sprite, animation)
      : false
  );

  const updateCollisionMasks = React.useCallback(
    (sameCollisionMasksForAnimations, sameCollisionMasksForSprites) => {
      if (animation && sprite) {
        if (sameCollisionMasksForAnimations) {
          mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
            const otherAnimation = spriteConfiguration.getAnimation(i);
            copyAnimationsSpriteCollisionMasks(sprite, otherAnimation);
          });
        } else if (sameCollisionMasksForSprites) {
          copyAnimationsSpriteCollisionMasks(sprite, animation);
        }
      }

      forceUpdate(); // Refresh the preview and the list
      if (onMasksUpdated) onMasksUpdated();
    },
    [animation, sprite, spriteConfiguration, forceUpdate, onMasksUpdated]
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
        allSpritesHaveSameCollisionMasksAs(sprite, animation)
      );
    },
    [animation, sprite]
  );

  const onSetCollisionMaskAutomatic = React.useCallback(
    (automatic: boolean = true) => {
      if (!sprite) return;
      sprite.setCollisionMaskAutomatic(automatic);
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
    ]
  );

  const setSameCollisionMasksForAllAnimations = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same collision masks for all animations will erase and reset all the other animations collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    const newSameCollisionMasksForAnimationsValue = enable;
    const newSameCollisionMasksForSpritesValue =
      enable || sameCollisionMasksForSprites;

    setSameCollisionMasksForAnimations(newSameCollisionMasksForAnimationsValue);
    setSameCollisionMasksForSprites(newSameCollisionMasksForSpritesValue);
    updateCollisionMasks(
      newSameCollisionMasksForAnimationsValue,
      newSameCollisionMasksForSpritesValue
    );
  };

  const setSameCollisionMasksForAllSprites = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same collision masks for all animations will erase and reset all the other animations collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    const newSameCollisionMasksForAnimationsValue =
      enable && sameCollisionMasksForAnimations;
    const newSameCollisionMasksForSpritesValue = enable;

    setSameCollisionMasksForAnimations(newSameCollisionMasksForAnimationsValue);
    setSameCollisionMasksForSprites(newSameCollisionMasksForSpritesValue);
    updateCollisionMasks(
      newSameCollisionMasksForAnimationsValue,
      newSameCollisionMasksForSpritesValue
    );
  };

  const setCurrentSpriteSize = (spriteWidth: number, spriteHeight: number) => {
    setSpriteWidth(spriteWidth);
    setSpriteHeight(spriteHeight);
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
              onSize={setCurrentSpriteSize}
              renderOverlay={overlayProps =>
                sprite && (
                  <CollisionMasksPreview
                    {...overlayProps}
                    isDefaultBoundingBox={sprite.isCollisionMaskAutomatic()}
                    polygons={sprite.getCustomCollisionMask()}
                    onPolygonsUpdated={() =>
                      updateCollisionMasks(
                        sameCollisionMasksForAnimations,
                        sameCollisionMasksForSprites
                      )
                    }
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
      renderEditor: () => (
        <Paper background="medium" style={styles.rightContainer} square>
          <Column expand noMargin>
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
                />
              </Column>
            </Line>
            <ScrollView>
              {!!sprite && !sprite.isCollisionMaskAutomatic() && (
                <React.Fragment>
                  <PolygonsList
                    polygons={sprite.getCustomCollisionMask()}
                    onPolygonsUpdated={() =>
                      updateCollisionMasks(
                        sameCollisionMasksForAnimations,
                        sameCollisionMasksForSprites
                      )
                    }
                    restoreCollisionMask={() =>
                      onSetCollisionMaskAutomatic(true)
                    }
                    onHoverVertice={setHighlightedVerticePtr}
                    onClickVertice={setSelectedVerticePtr}
                    selectedVerticePtr={selectedVerticePtr}
                    spriteWidth={spriteWidth}
                    spriteHeight={spriteHeight}
                  />
                </React.Fragment>
              )}
              {!!sprite && sprite.isCollisionMaskAutomatic() && (
                <React.Fragment>
                  <EmptyMessage>
                    <Trans>
                      This sprite uses the default collision mask, a rectangle
                      that is as large as the sprite.
                    </Trans>
                  </EmptyMessage>
                  <Line justifyContent="center">
                    <FlatButton
                      label={<Trans>Use a custom collision mask</Trans>}
                      primary={false}
                      onClick={() => onSetCollisionMaskAutomatic(false)}
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
