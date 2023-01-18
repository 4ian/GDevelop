// @flow
import * as React from 'react';
import { Column, Spacer } from '../../../UI/Grid';
import useDismissableTutorialMessage from '../../../Hints/useDismissableTutorialMessage';

/**
 * TODO: Use context directly in SpriteEditor
 * when switching SpriteEditor class component to functional component.
 */
const SpacedDismissableTutorialMessage = () => {
  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intermediate-changing-animations'
  );
  return DismissableTutorialMessage ? (
    <Column noMargin>
      {DismissableTutorialMessage}
      <Spacer />
    </Column>
  ) : null;
};

export default SpacedDismissableTutorialMessage;
