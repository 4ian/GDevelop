// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';

const EmptyBehaviorsPlaceholder = () => (
  <EmptyPlaceholder
    renderButtons={() => <HelpButton helpPagePath="/behaviors" />}
  >
    <Text>
      <Trans>There are no behaviors here.</Trans>
    </Text>
    <Text>
      <Trans>
        Behaviors are predefined actions that are assigned to objects. Behaviors
        can have no or multiple parameters.
      </Trans>
    </Text>
    <Text>
      <Trans>
        Add your first behavior using the button "Add a behavior to the object".
      </Trans>
    </Text>
  </EmptyPlaceholder>
);

export default EmptyBehaviorsPlaceholder;
