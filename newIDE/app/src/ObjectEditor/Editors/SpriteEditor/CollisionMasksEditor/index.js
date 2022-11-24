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
  // Note: these two booleans are set to false to avoid erasing points of other
  // animations/frames (and they will be updated by updateSameCollisionMasksToggles). In
  // theory, they should be set to the appropriate value at their initialization,
  // for consistency of the state.
  const [
    sameCollisionMasksForAnimations,
    setSameCollisionMasksForAnimations,
  ] = React.useState(false);
  const [
    sameCollisionMasksForSprites,
    setSameCollisionMasksForSprites,
  ] = React.useState(false);
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

  const updateCollisionMasks = React.useCallback(
    () => {
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
    [
      animation,
      sprite,
      spriteConfiguration,
      sameCollisionMasksForAnimations,
      sameCollisionMasksForSprites,
      forceUpdate,
      onMasksUpdated,
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

  const updateSameCollisionMasksToggles = () => {
    if (!animation || !sprite) return;

    setSameCollisionMasksForAnimations(
      every(
        mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
          const otherAnimation = spriteConfiguration.getAnimation(i);
          return allSpritesHaveSameCollisionMasksAs(sprite, otherAnimation);
        })
      )
    );

    setSameCollisionMasksForSprites(
      allSpritesHaveSameCollisionMasksAs(sprite, animation)
    );
  };

  const onSetCollisionMaskAutomatic = React.useCallback(
    (automatic: boolean = true) => {
      if (!sprite) return;
      sprite.setCollisionMaskAutomatic(automatic);
      updateCollisionMasks();
    },
    [sprite, updateCollisionMasks]
  );

  const setSameCollisionMasksForAllAnimations = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same collision masks for all animations will erase and reset all the other animations collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    setSameCollisionMasksForAnimations(enable);
    setSameCollisionMasksForSprites(enable || sameCollisionMasksForSprites);
  };

  const setSameCollisionMasksForAllSprites = (enable: boolean) => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same collision masks for all animations will erase and reset all the other animations collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    setSameCollisionMasksForAnimations(
      enable && sameCollisionMasksForAnimations
    );
    setSameCollisionMasksForSprites(enable);
  };

  const setCurrentSpriteSize = (spriteWidth: number, spriteHeight: number) => {
    setSpriteWidth(spriteWidth);
    setSpriteHeight(spriteHeight);
  };

  // Note: might be worth fixing these warnings:
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(updateCollisionMasks, [
    sameCollisionMasksForAnimations,
    sameCollisionMasksForSprites,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(updateSameCollisionMasksToggles, [animationIndex]);

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
              project={project}
              onSize={setCurrentSpriteSize}
              renderOverlay={overlayProps =>
                sprite && (
                  <CollisionMasksPreview
                    {...overlayProps}
                    isDefaultBoundingBox={sprite.isCollisionMaskAutomatic()}
                    polygons={sprite.getCustomCollisionMask()}
                    onPolygonsUpdated={updateCollisionMasks}
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
                    onPolygonsUpdated={updateCollisionMasks}
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
