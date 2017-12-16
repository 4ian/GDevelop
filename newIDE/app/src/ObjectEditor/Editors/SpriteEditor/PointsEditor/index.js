import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PointsList from './PointsList';
import PointsPreview from './PointsPreview';
import ImagePreview from '../../../ImagePreview';
import {
  getCurrentElements,
  allSpritesHaveSamePointsAs,
  copyAnimationsSpritePoints,
} from '../Utils/SpriteObjectHelper';
import every from 'lodash/every';
const gd = global.gd;

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
    if (this.props.onPointsUpdated) this.props.onPointsUpdated();
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

  _onToggleSamePointsForAnimation = enable => {
    if (enable) {
      // eslint-disable-next-line
      const answer = confirm(
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

  _onToggleSamePointsForSprites = enable => {
    if (enable) {
      // eslint-disable-next-line
      const answer = confirm(
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
          {hasValidSprite && <PointsPreview pointsContainer={sprite} />}
        </ImagePreview>
        <Line>
          <Column expand>
            <Toggle
              label="Share same points for all animations"
              labelPosition="right"
              toggled={samePointsForAnimations}
              onToggle={(e, checked) =>
                this._onToggleSamePointsForAnimation(checked)}
            />
            <Line>
              {!samePointsForAnimations && (
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
              {!samePointsForAnimations &&
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
              {!samePointsForSprites &&
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
              label="Share same points for all sprites of the animation"
              labelPosition="right"
              toggled={samePointsForSprites}
              onToggle={(e, checked) =>
                this._onToggleSamePointsForSprites(checked)}
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
            Choose an animation and frame to edit the points
          </EmptyMessage>
        )}
      </div>
    );
  }
}
