// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import HelpButton from '../../UI/HelpButton';
import Text from '../../UI/Text';
import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';

const EmptyEventsPlaceholder = () => (
  <EmptyPlaceholder renderButtons={() => <HelpButton helpPagePath="/events" />}>
    <Text>
      <Trans>There are no events here.</Trans>
    </Text>
    <Text>
      <Trans>
        Events are composed of conditions (on the left of an event) and actions
        (on the right). When conditions are fulfilled, the actions are executed.
      </Trans>
    </Text>
    <Text>
      <Trans>Add your first event using the button "Add a new event".</Trans>
    </Text>
  </EmptyPlaceholder>
);

export default EmptyEventsPlaceholder;
