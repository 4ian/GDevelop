import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PolygonsList from './PolygonsList';
import CollisionMasksPreview from './CollisionMasksPreview';
import ImagePreview from '../../../ImagePreview';
import {
  getCurrentElements,
  allSpritesHaveSameCollisionMasksAs,
  copyAnimationsSpriteCollisionMasks,
} from '../Utils/SpriteObjectHelper';
import every from 'lodash/every';
const gd = global.gd;

export default class CollisionMasksEditor extends Component {
  state = {
    animationIndex: 0,
    directionIndex: 0,
    spriteIndex: 0,
    sameCollisionMasksForAnimations: true,
    sameCollisionMasksForSprites: true,
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

    this.forceUpdate(); // Refresh the preview
    if (this.props.onCollisionMasksUpdated)
      this.props.onCollisionMasksUpdated();
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

  _onToggleSamePointsForAnimation = enable => {
    if (enable) {
      // eslint-disable-next-line
      const answer = confirm(
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

  _onToggleSameCollisionMasksForSprites = enable => {
    if (enable) {
      // eslint-disable-next-line
      const answer = confirm(
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

  render() {
    const { object, resourcesLoader, project } = this.props;
    const {
      sameCollisionMasksForAnimations,
      sameCollisionMasksForSprites,
      animationIndex,
      directionIndex,
      spriteIndex,
    } = this.state;
    const spriteObject = gd.asSpriteObject(object);

    if (!object.getAnimationsCount()) return null;
    const {
      hasValidAnimation,
      animation,
      hasValidDirection,
      direction,
      hasValidSprite,
      sprite,
    } = getCurrentElements(
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
        >
          {hasValidSprite && <CollisionMasksPreview polygons={sprite.getCustomCollisionMask()} />}
        </ImagePreview>
        <Line>
          <Column expand>
            <Toggle
              label="Share same collision masks for all animations"
              labelPosition="right"
              toggled={sameCollisionMasksForAnimations}
              onToggle={(e, checked) =>
                this._onToggleSamePointsForAnimation(checked)}
            />
            <Line>
              {!sameCollisionMasksForAnimations && ( //TODO: factor with points editor?
                <SelectField
                  floatingLabelText="Animation"
                  value={this.state.animationIndex}
                  onChange={(e, i, value) => this.chooseAnimation(value)}
                >
                  {mapFor(0, spriteObject.getAnimationsCount(), i => {
                    const animation = spriteObject.getAnimation(i);
                    return (
                      <MenuItem
                        key={i}
                        value={i}
                        primaryText={`Animation #${i} ${animation.getName()}`}
                      />
                    );
                  })}
                </SelectField>
              )}
              {!sameCollisionMasksForAnimations &&
                hasValidAnimation &&
                animation.getDirectionsCount() > 1 && (
                  <SelectField
                    floatingLabelText="Direction"
                    value={this.state.directionIndex}
                    onChange={(e, i, value) => this.chooseDirection(value)}
                  >
                    {mapFor(0, animation.getDirectionsCount(), i => {
                      return (
                        <MenuItem
                          value={i}
                          key={i}
                          primaryText={`Direction #${i}`}
                        />
                      );
                    })}
                  </SelectField>
                )}
              {!sameCollisionMasksForSprites &&
                hasValidDirection && (
                  <SelectField
                    floatingLabelText="Frame"
                    value={this.state.spriteIndex}
                    onChange={(e, i, value) => this.chooseSprite(value)}
                  >
                    {mapFor(0, direction.getSpritesCount(), i => {
                      return (
                        <MenuItem
                          value={i}
                          key={i}
                          primaryText={`Frame #${i}`}
                        />
                      );
                    })}
                  </SelectField>
                )}
            </Line>
            <Toggle
              label="Share same collision masks for all sprites of the animation"
              labelPosition="right"
              toggled={sameCollisionMasksForSprites}
              onToggle={(e, checked) =>
                this._onToggleSameCollisionMasksForSprites(checked)}
            />
          </Column>
        </Line>
        {!!sprite &&
          !sprite.isCollisionMaskAutomatic() && (
            <React.Fragment>
              <PolygonsList
                polygons={sprite.getCustomCollisionMask()}
                onPolygonsUpdated={this._updateCollisionMasks}
              />
              <FlatButton
                label="Restore the default collision mask"
                primary={false}
                onClick={() => this._onSetCollisionMaskAutomatic(true)}
              />
            </React.Fragment>
          )}
        {!!sprite &&
          sprite.isCollisionMaskAutomatic() && (
            <React.Fragment>
              <EmptyMessage>
                This sprite uses the default collision mask, a rectangle that is
                as large as the sprite.
              </EmptyMessage>
              <FlatButton
                label="Use a custom collision mask"
                primary={false}
                onClick={() => this._onSetCollisionMaskAutomatic(false)}
              />
            </React.Fragment>
          )}
        {!sprite && (
          <EmptyMessage>
            Choose an animation and frame to edit the collision masks
          </EmptyMessage>
        )}
      </div>
    );
  }
}
