// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../../../../UI/FlatButton';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PolygonsList from './PolygonsList';
import CollisionMasksPreview from './CollisionMasksPreview';
import ImagePreview from '../../../../ResourcesList/ResourcePreview/ImagePreview';
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
const gd: libGDevelop = global.gd;

type Props = {|
  object: any, // @todo passed as gdSpriteObject but used as gdObject?
  resourcesLoader: typeof ResourcesLoader,
  project: gdProject,
|};

const CollisionMasksEditor = (props: Props) => {
  const [animationIndex, setAnimationIndex] = React.useState(0);
  const [directionIndex, setDirectionIndex] = React.useState(0);
  const [spriteIndex, setSpriteIndex] = React.useState(0);
  const [
    sameCollisionMasksForAnimations,
    setSameCollisionMasksForAnimations,
  ] = React.useState<boolean>(true);
  const [
    sameCollisionMasksForSprites,
    setSameCollisionMasksForSprites,
  ] = React.useState<boolean>(true);
  const [spriteWidth, setSpriteWidth] = React.useState(0);
  const [spriteHeight, setSpriteHeight] = React.useState(0);
  const forceUpdate = useForceUpdate();

  const spriteObject = gd.asSpriteObject(props.object);
  const { animation, sprite, hasValidSprite } = getCurrentElements(
    spriteObject,
    animationIndex,
    directionIndex,
    spriteIndex
  );

  const updateCollisionMasks = React.useCallback(
    () => {
      if (animation && sprite) {
        if (sameCollisionMasksForAnimations) {
          mapFor(0, spriteObject.getAnimationsCount(), i => {
            const otherAnimation = spriteObject.getAnimation(i);
            copyAnimationsSpriteCollisionMasks(sprite, otherAnimation);
          });
        } else if (sameCollisionMasksForSprites) {
          copyAnimationsSpriteCollisionMasks(sprite, animation);
        }
      }

      forceUpdate(); // Refresh the preview and the list
    },
    [
      animation,
      sprite,
      spriteObject,
      sameCollisionMasksForAnimations,
      sameCollisionMasksForSprites,
      forceUpdate,
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
        mapFor(0, spriteObject.getAnimationsCount(), i => {
          const otherAnimation = spriteObject.getAnimation(i);
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

  React.useEffect(updateCollisionMasks, [
    sameCollisionMasksForAnimations,
    sameCollisionMasksForSprites,
  ]);

  React.useEffect(updateSameCollisionMasksToggles, [animationIndex]);

  if (!props.object.getAnimationsCount()) return null;
  return (
    <div>
      <ImagePreview
        resourceName={hasValidSprite ? sprite.getImageName() : ''}
        resourcesLoader={props.resourcesLoader}
        project={props.project}
        onSize={setCurrentSpriteSize}
        renderOverlay={({ imageWidth, imageHeight, imageZoomFactor }) =>
          hasValidSprite && (
            <CollisionMasksPreview
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              imageZoomFactor={imageZoomFactor}
              isDefaultBoundingBox={sprite.isCollisionMaskAutomatic()}
              polygons={sprite.getCustomCollisionMask()}
              onPolygonsUpdated={updateCollisionMasks}
            />
          )
        }
      />
      <Line>
        <Column expand>
          <SpriteSelector
            spriteObject={spriteObject}
            animationIndex={animationIndex}
            directionIndex={directionIndex}
            spriteIndex={spriteIndex}
            chooseAnimation={chooseAnimation}
            chooseDirection={chooseDirection}
            chooseSprite={chooseSprite}
            sameForAllAnimations={sameCollisionMasksForAnimations}
            sameForAllSprites={sameCollisionMasksForSprites}
            setSameForAllAnimations={setSameCollisionMasksForAllAnimations}
            setSameForAllSprites={setSameCollisionMasksForAllSprites}
            setSameForAllAnimationsLabel={
              <Trans>Share same collision masks for all animations</Trans>
            }
            setSameForAllSpritesLabel={
              <Trans>
                Share same collision masks for all sprites of this animation
              </Trans>
            }
          />
        </Column>
      </Line>
      {!!sprite && !sprite.isCollisionMaskAutomatic() && (
        <React.Fragment>
          <PolygonsList
            polygons={sprite.getCustomCollisionMask()}
            onPolygonsUpdated={updateCollisionMasks}
            spriteWidth={spriteWidth}
            spriteHeight={spriteHeight}
          />
          <Line justifyContent="center">
            <FlatButton
              label={<Trans>Restore the default collision mask</Trans>}
              primary={false}
              onClick={() => onSetCollisionMaskAutomatic(true)}
            />
          </Line>
        </React.Fragment>
      )}
      {!!sprite && sprite.isCollisionMaskAutomatic() && (
        <React.Fragment>
          <EmptyMessage>
            <Trans>
              This sprite uses the default collision mask, a rectangle that is
              as large as the sprite.
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
    </div>
  );
};

export default CollisionMasksEditor;
