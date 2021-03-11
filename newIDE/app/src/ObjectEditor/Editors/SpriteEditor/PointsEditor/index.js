import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PointsList from './PointsList';
import PointsPreview from './PointsPreview';
import ImagePreview from '../../../../ResourcesList/ResourcePreview/ImagePreview';
import {
  getCurrentElements,
  allSpritesHaveSamePointsAs,
  copyAnimationsSpritePoints,
} from '../Utils/SpriteObjectHelper';
import SpriteSelector from '../Utils/SpriteSelector';
import Window from '../../../../Utils/Window';
import every from 'lodash/every';
const gd /*TODO: add flow in this file */ = global.gd;

export default class PointsEditor extends Component {
  state = {
    animationIndex: 0,
    directionIndex: 0,
    spriteIndex: 0,
    samePointsForAnimations: true,
    samePointsForSprites: true,
  };

  componentDidMount() {
    this._updateSamePointsToggles();
  }

  _updatePoints = () => {
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
      if (this.state.samePointsForAnimations) {
        mapFor(0, spriteObject.getAnimationsCount(), i => {
          const otherAnimation = spriteObject.getAnimation(i);
          copyAnimationsSpritePoints(sprite, otherAnimation);
        });
      } else if (this.state.samePointsForSprites) {
        copyAnimationsSpritePoints(sprite, animation);
      }
    }

    this.forceUpdate(); // Refresh the preview
  };

  chooseAnimation = index => {
    this.setState(
      {
        animationIndex: index,
        directionIndex: 0,
        spriteIndex: 0,
      },
      () => this._updateSamePointsToggles()
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

  _updateSamePointsToggles = () => {
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
      samePointsForAnimations: every(
        mapFor(0, spriteObject.getAnimationsCount(), i => {
          const otherAnimation = spriteObject.getAnimation(i);
          return allSpritesHaveSamePointsAs(sprite, otherAnimation);
        })
      ),
      samePointsForSprites: allSpritesHaveSamePointsAs(sprite, animation),
    });
  };

  _setSamePointsForAllAnimations = enable => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same points for all animations will erase and reset all the other animations points. This can't be undone. Are you sure you want to share these points amongst all the animations of the object?"
      );
      if (!answer) return;
    }

    this.setState(
      {
        samePointsForAnimations: enable,
        samePointsForSprites: enable ? true : this.state.samePointsForSprites,
      },
      () => {
        this._updatePoints();
      }
    );
  };

  _setSamePointsForAllSprites = enable => {
    if (enable) {
      const answer = Window.showConfirmDialog(
        "Having the same points for all frames will erase and reset all the other frames points. This can't be undone. Are you sure you want to share these points amongst all the frames of the animation?"
      );
      if (!answer) return;
    }

    this.setState(
      {
        samePointsForAnimations: enable
          ? this.state.samePointsForAnimations
          : false,
        samePointsForSprites: enable,
      },
      () => {
        this._updatePoints();
      }
    );
  };

  render() {
    const { object, resourcesLoader, project } = this.props;
    const {
      samePointsForAnimations,
      samePointsForSprites,
      animationIndex,
      directionIndex,
      spriteIndex,
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
          renderOverlay={({ imageWidth, imageHeight, imageZoomFactor }) =>
            hasValidSprite && (
              <PointsPreview
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                imageZoomFactor={imageZoomFactor}
                pointsContainer={sprite}
                onPointsUpdated={this._updatePoints}
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
              sameForAllAnimations={samePointsForAnimations}
              sameForAllSprites={samePointsForSprites}
              setSameForAllAnimations={this._setSamePointsForAllAnimations}
              setSameForAllSprites={this._setSamePointsForAllSprites}
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
            onPointsUpdated={this._updatePoints}
          />
        )}
        {!sprite && (
          <EmptyMessage>
            <Trans>Choose an animation and frame to edit the points</Trans>
          </EmptyMessage>
        )}
      </div>
    );
  }
}
