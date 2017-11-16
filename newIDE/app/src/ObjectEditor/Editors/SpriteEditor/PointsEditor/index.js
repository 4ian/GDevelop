import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import EmptyMessage from '../../../../UI/EmptyMessage';
import { Line, Column } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import PointsList from './PointsList';
import ImageThumbnail from '../../../ImageThumbnail';
const gd = global.gd;

export default class PointsEditor extends Component {
  state = {
    animationIndex: 0,
    directionIndex: 0,
    spriteIndex: 0,
  };

  chooseAnimation = index => {
    this.setState({
      animationIndex: index,
      directionIndex: 0,
      spriteIndex: 0,
    });
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

  render() {
    const { object, resourcesLoader, project } = this.props;
    const { animationIndex, directionIndex, spriteIndex } = this.state;
    const spriteObject = gd.asSpriteObject(object);

    if (!object.getAnimationsCount()) return null;
    const hasValidAnimation = animationIndex < object.getAnimationsCount();
    const animation = hasValidAnimation
      ? object.getAnimation(animationIndex)
      : null;
    const hasValidDirection =
      !!animation && directionIndex < animation.getDirectionsCount();
    const direction = hasValidDirection
      ? animation.getDirection(directionIndex)
      : null;
    const hasValidSprite =
      !!direction && spriteIndex < direction.getSpritesCount();
    const sprite = hasValidSprite ? direction.getSprite(spriteIndex) : null;

    return (
      <div noMargin>
        <Line justifyContent="center">
          <ImageThumbnail
            resourceName={hasValidSprite ? sprite.getImageName() : ''}
            resourcesLoader={resourcesLoader}
            project={project}
          />
        </Line>
        <Line justifyContent="center">
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
          {hasValidAnimation &&
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
          {hasValidDirection && (
            <SelectField
              floatingLabelText="Frame"
              value={this.state.spriteIndex}
              onChange={(e, i, value) => this.chooseSprite(value)}
            >
              {mapFor(0, direction.getSpritesCount(), i => {
                return (
                  <MenuItem value={i} key={i} primaryText={`Frame #${i}`} />
                );
              })}
            </SelectField>
          )}
        </Line>
        {!!sprite && <PointsList pointsContainer={sprite} />}
        {!sprite && (
          <EmptyMessage>
            Choose an animation and frame to edit the points
          </EmptyMessage>
        )}
      </div>
    );
  }
}
