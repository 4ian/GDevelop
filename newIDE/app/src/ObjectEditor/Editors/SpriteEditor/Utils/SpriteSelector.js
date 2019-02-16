// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import Toggle from 'material-ui/Toggle';
import { Line } from '../../../../UI/Grid';
import { mapFor } from '../../../../Utils/MapFor';
import { getCurrentElements } from './SpriteObjectHelper';

type Props = {|
  spriteObject: gdSpriteObject,

  animationIndex: number,
  directionIndex: number,
  spriteIndex: number,

  chooseAnimation: number => void,
  chooseDirection: number => void,
  chooseSprite: number => void,

  sameForAllAnimations: boolean,
  sameForAllSprites: boolean,

  setSameForAllAnimations: boolean => void,
  setSameForAllSprites: number => void,

  setSameForAllAnimationsLabel: string,
  setSameForAllSpritesLabel: string,
|};

/**
 * A component that displays selector to browse the animations/directions/sprite
 * of a Sprite object. Also have toggles so that the user can choose if the edited property
 * (typically, the points or the collision masks of the sprite) should be shared between
 * all sprites of an animation, or between all sprites of all animations of the object.
 */
export default class SpriteSelector extends React.Component<Props, void> {
  render() {
    const {
      spriteObject,
      animationIndex,
      directionIndex,
      spriteIndex,
      sameForAllAnimations,
      sameForAllSprites,
      chooseAnimation,
      chooseDirection,
      chooseSprite,
      setSameForAllAnimations,
      setSameForAllSprites,
      setSameForAllAnimationsLabel,
      setSameForAllSpritesLabel,
    } = this.props;

    const {
      hasValidAnimation,
      animation,
      hasValidDirection,
      direction,
    } = getCurrentElements(
      spriteObject,
      animationIndex,
      directionIndex,
      spriteIndex
    );

    return (
      <React.Fragment>
        <Line>
          <SelectField
            floatingLabelText={<Trans>Animation</Trans>}
            value={this.props.animationIndex}
            onChange={(e, i, value) => chooseAnimation(value)}
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
          {hasValidAnimation && animation.getDirectionsCount() > 1 && (
            <SelectField
              floatingLabelText={<Trans>Direction</Trans>}
              value={this.props.directionIndex}
              onChange={(e, i, value) => chooseDirection(value)}
            >
              {mapFor(0, animation.getDirectionsCount(), i => {
                return (
                  <MenuItem value={i} key={i} primaryText={`Direction #${i}`} />
                );
              })}
            </SelectField>
          )}
          {hasValidDirection && (
            <SelectField
              floatingLabelText={<Trans>Frame</Trans>}
              value={this.props.spriteIndex}
              onChange={(e, i, value) => chooseSprite(value)}
            >
              {mapFor(0, direction.getSpritesCount(), i => {
                return (
                  <MenuItem value={i} key={i} primaryText={`Frame #${i}`} />
                );
              })}
            </SelectField>
          )}
        </Line>
        <Toggle
          label={setSameForAllAnimationsLabel}
          labelPosition="right"
          toggled={sameForAllAnimations}
          onToggle={(e, checked) => setSameForAllAnimations(checked)}
        />
        <Toggle
          label={setSameForAllSpritesLabel}
          labelPosition="right"
          toggled={sameForAllSprites}
          onToggle={(e, checked) => setSameForAllSprites(checked)}
        />
      </React.Fragment>
    );
  }
}
