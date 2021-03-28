import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
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
const gd: libGDevelop = global.gd;

// Blank comment: will remove later

export default class CollisionMasksEditor extends Component {
  state = {
    animationIndex: 0,
    directionIndex: 0,
    spriteIndex: 0,
    sameCollisionMasksForAnimations: true,
    sameCollisionMasksForSprites: true,
    spriteWidth: 0,
    spriteHeight: 0,
  };

  componentDidMount() {
    this._updateSameCollisionMasksToggles();
  }

  _updateCollisionMasks = () => {
    const { object } = this.props;
    const { animationIndex, directionIndex, spriteIndex } = this.state;
    const spriteObject = gd.asSpriteObject(object);

    const { animation, sprite } = getCurrentElements(
      spriteObject,
      animationIndex,
      directionIndex,
      spriteIndex
    );

    if (animation && sprite) {
      if (this.state.sameCollisionMasksForAnimations) {
        mapFor(0, spriteObject.getAnimationsCount(), i => {
          const otherAnimation = spriteObject.getAnimation(i);
          copyAnimationsSpriteCollisionMasks(sprite, otherAnimation);
        });
      } else if (this.state.sameCollisionMasksForSprites) {
        copyAnimationsSpriteCollisionMasks(sprite, animation);
      }
    }

    this.forceUpdate(); // Refresh the preview and the list
  };

  chooseAnimation = index => {
    this.setState(
      {
        animationIndex: index,
        directionIndex: 0,
        spriteIndex: 0,
      },
      () => this._updateSameCollisionMasksToggles()
    );
  };

  chooseDirection = index => {
    this.setState({
      directionIndex: index,
      spriteIndex: 0,
    });
  };

  chooseSprite = index => {
    this.setState({
      spriteIndex: index,
    });
  };

  _updateSameCollisionMasksToggles = () => {
    const { object } = this.props;
    const { animationIndex, directionIndex, spriteIndex } = this.state;
    const spriteObject = gd.asSpriteObject(object);

    const { animation, sprite } = getCurrentElements(
      spriteObject,
      animationIndex,
      directionIndex,
      spriteIndex
    );
    if (!animation || !sprite) return;

    this.setState({
      sameCollisionMasksForAnimations: every(
        mapFor(0, spriteObject.getAnimationsCount(), i => {
          const otherAnimation = spriteObject.getAnimation(i);
          return allSpritesHaveSameCollisionMasksAs(sprite, otherAnimation);
        })
      ),
      sameCollisionMasksForSprites: allSpritesHaveSameCollisionMasksAs(
        sprite,
        animation
      ),
    });
  };

  _onSetCollisionMaskAutomatic = (automatic: boolean = true) => {
    const { object } = this.props;
    const { animationIndex, directionIndex, spriteIndex } = this.state;
    const spriteObject = gd.asSpriteObject(object);

    const { sprite } = getCurrentElements(
      spriteObject,
      animationIndex,
      directionIndex,
      spriteIndex
    );
    if (!sprite) return;

    sprite.setCollisionMaskAutomatic(automatic);
    this._updateCollisionMasks();
  };

  _setSameCollisionMasksForAllAnimations = enable => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same collision masks for all animations will erase and reset all the other animations collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    this.setState(
      {
        sameCollisionMasksForAnimations: enable,
        sameCollisionMasksForSprites: enable
          ? true
          : this.state.sameCollisionMasksForSprites,
      },
      () => {
        this._updateCollisionMasks();
      }
    );
  };

  _setSameCollisionMasksForAllSprites = enable => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same collision masks for all frames will erase and reset all the other frames collision masks. This can't be undone. Are you sure you want to share these collision masks amongst all the frames of the animation?"
      );
      if (!answer) return;
    }

    this.setState(
      {
        sameCollisionMasksForAnimations: enable
          ? this.state.sameCollisionMasksForAnimations
          : false,
        sameCollisionMasksForSprites: enable,
      },
      () => {
        this._updateCollisionMasks();
      }
    );
  };

  _setCurrentSpriteSize = (spriteWidth: number, spriteHeight: number) => {
    this.setState({
      spriteWidth,
      spriteHeight,
    });
  };

  render() {
    const { object, resourcesLoader, project } = this.props;
    const {
      sameCollisionMasksForAnimations,
      sameCollisionMasksForSprites,
      animationIndex,
      directionIndex,
      spriteIndex,
      spriteWidth,
      spriteHeight,
    } = this.state;
    const spriteObject = gd.asSpriteObject(object);

    if (!object.getAnimationsCount()) return null;
    const { hasValidSprite, sprite } = getCurrentElements(
      spriteObject,
      animationIndex,
      directionIndex,
      spriteIndex
    );

    return (
      <div>
        <ImagePreview
          resourceName={hasValidSprite ? sprite.getImageName() : ''}
          resourcesLoader={resourcesLoader}
          project={project}
          onSize={this._setCurrentSpriteSize}
          renderOverlay={({ imageWidth, imageHeight, imageZoomFactor }) =>
            hasValidSprite && (
              <CollisionMasksPreview
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                imageZoomFactor={imageZoomFactor}
                isDefaultBoundingBox={sprite.isCollisionMaskAutomatic()}
                polygons={sprite.getCustomCollisionMask()}
                onPolygonsUpdated={this._updateCollisionMasks}
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
              chooseAnimation={this.chooseAnimation}
              chooseDirection={this.chooseDirection}
              chooseSprite={this.chooseSprite}
              sameForAllAnimations={sameCollisionMasksForAnimations}
              sameForAllSprites={sameCollisionMasksForSprites}
              setSameForAllAnimations={
                this._setSameCollisionMasksForAllAnimations
              }
              setSameForAllSprites={this._setSameCollisionMasksForAllSprites}
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
              onPolygonsUpdated={this._updateCollisionMasks}
              spriteWidth={spriteWidth}
              spriteHeight={spriteHeight}
            />
            <Line justifyContent="center">
              <FlatButton
                label={<Trans>Restore the default collision mask</Trans>}
                primary={false}
                onClick={() => this._onSetCollisionMaskAutomatic(true)}
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
                onClick={() => this._onSetCollisionMaskAutomatic(false)}
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
  }
}
