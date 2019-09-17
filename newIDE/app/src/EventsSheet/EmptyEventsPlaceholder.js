// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';

const EmptyEventsPlaceholder = () => (
  <PlaceholderMessage>
    <Text>
      <Trans>
        There are no events here. Events are composed of conditions and actions.
      </Trans>
    </Text>
    <Text>
      <Trans>
        Add your first event using the first buttons of the toolbar.
      </Trans>
    </Text>
    <HelpButton helpPagePath="/events" />
  </PlaceholderMessage>
);

export default EmptyEventsPlaceholder;
