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
  animations: gdSpriteAnimationList,

  animationIndex: number,
  directionIndex: number,
  spriteIndex: number,

  chooseAnimation: number => void,
  chooseDirection: number => void,
  chooseSprite: number => void,

  sameForAllAnimations: boolean,
  sameForAllSprites: boolean,

  setSameForAllAnimations: boolean => Promise<void>,
  setSameForAllSprites: boolean => Promise<void>,

  setSameForAllAnimationsLabel: React.Node,
  setSameForAllSpritesLabel: React.Node,

  hideControlsForSprite?: (sprite: gdSprite) => boolean,
|};

/**
 * A component that displays selector to browse the animations/directions/sprite
 * of a Sprite object. Also have toggles so that the user can choose if the edited property
 * (typically, the points or the collision masks of the sprite) should be shared between
 * all sprites of an animation, or between all sprites of all animations of the object.
 */
const SpriteSelector = ({
  animations,
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
  hideControlsForSprite,
}: Props) => {
  const { animation, direction, sprite } = getCurrentElements(
    animations,
    animationIndex,
    directionIndex,
    spriteIndex
  );

  const shouldHideControls =
    !direction ||
    !direction.getSpritesCount() ||
    !sprite ||
    (hideControlsForSprite && hideControlsForSprite(sprite));

  return (
    <React.Fragment>
      <ResponsiveLineStackLayout noColumnMargin>
        <SelectField
          fullWidth
          floatingLabelText={<Trans>Animation</Trans>}
          value={animationIndex}
          onChange={(e, i, value: string) =>
            chooseAnimation(parseInt(value, 10) || 0)
          }
        >
          {mapFor(0, animations.getAnimationsCount(), i => {
            const animation = animations.getAnimation(i);
            return (
              <SelectOption
                key={i}
                value={i}
                label={t`Animation #${i} ${animation.getName()}`}
              />
            );
          })}
        </SelectField>
        {animation && animation.getDirectionsCount() > 1 && (
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Direction</Trans>}
            value={directionIndex}
            onChange={(e, i, value: string) =>
              chooseDirection(parseInt(value, 10) || 0)
            }
          >
            {mapFor(0, animation.getDirectionsCount(), i => {
              return (
                <SelectOption value={i} key={i} label={t`Direction #${i}`} />
              );
            })}
          </SelectField>
        )}
        {direction && (
          <SelectField
            fullWidth
            floatingLabelText={<Trans>Frame</Trans>}
            value={spriteIndex}
            onChange={(e, i, value: string) =>
              chooseSprite(parseInt(value, 10) || 0)
            }
          >
            {mapFor(0, direction.getSpritesCount(), i => {
              return <SelectOption value={i} key={i} label={t`Frame #${i}`} />;
            })}
          </SelectField>
        )}
      </ResponsiveLineStackLayout>
      {!shouldHideControls && (
        <>
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
        </>
      )}
    </React.Fragment>
  );
};

export default SpriteSelector;
