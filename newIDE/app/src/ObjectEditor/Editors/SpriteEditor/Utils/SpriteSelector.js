// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import SelectField from '../../../../UI/SelectField';
import SelectOption from '../../../../UI/SelectOption';

import Toggle from '../../../../UI/Toggle';
import { mapFor } from '../../../../Utils/MapFor';
import { getCurrentElements } from './SpriteObjectHelper';
import { ResponsiveLineStackLayout } from '../../../../UI/Layout';

type Props = {|
  spriteConfiguration: gdSpriteObject,

  animationIndex: number,
  directionIndex: number,
  spriteIndex: number,

  chooseAnimation: number => void,
  chooseDirection: number => void,
  chooseSprite: number => void,

  sameForAllAnimations: boolean,
  sameForAllSprites: boolean,

  setSameForAllAnimations: boolean => void,
  setSameForAllSprites: boolean => void,

  setSameForAllAnimationsLabel: string | React.Node,
  setSameForAllSpritesLabel: string | React.Node,
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
      spriteConfiguration,
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

    const { animation, direction } = getCurrentElements(
      spriteConfiguration,
      animationIndex,
      directionIndex,
      spriteIndex
    );

    return (
      <React.Fragment>
        <ResponsiveLineStackLayout>
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Animation</Trans>}
            value={this.props.animationIndex}
            onChange={(e, i, value: string) =>
              chooseAnimation(parseInt(value, 10) || 0)
            }
          >
            {mapFor(0, spriteConfiguration.getAnimationsCount(), i => {
              const animation = spriteConfiguration.getAnimation(i);
              return (
                <SelectOption
                  key={i}
                  value={i}
                  primaryText={t`Animation #${i} ${animation.getName()}`}
                />
              );
            })}
          </SelectField>
          {animation && animation.getDirectionsCount() > 1 && (
            <SelectField
              fullWidth
              floatingLabelText={<Trans>Direction</Trans>}
              value={this.props.directionIndex}
              onChange={(e, i, value: string) =>
                chooseDirection(parseInt(value, 10) || 0)
              }
            >
              {mapFor(0, animation.getDirectionsCount(), i => {
                return (
                  <SelectOption
                    value={i}
                    key={i}
                    primaryText={t`Direction #${i}`}
                  />
                );
              })}
            </SelectField>
          )}
          {direction && (
            <SelectField
              fullWidth
              floatingLabelText={<Trans>Frame</Trans>}
              value={this.props.spriteIndex}
              onChange={(e, i, value: string) =>
                chooseSprite(parseInt(value, 10) || 0)
              }
            >
              {mapFor(0, direction.getSpritesCount(), i => {
                return (
                  <SelectOption
                    value={i}
                    key={i}
                    primaryText={t`Frame #${i}`}
                  />
                );
              })}
            </SelectField>
          )}
        </ResponsiveLineStackLayout>
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
