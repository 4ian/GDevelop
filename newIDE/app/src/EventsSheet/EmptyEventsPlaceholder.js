// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import HelpButton from '../UI/HelpButton';

const EmptyEventsPlaceholder = () => (
  <PlaceholderMessage>
    <p>
      <Trans>
        There are no events here. Events are composed of conditions and actions.
      </Trans>
    </p>
    <p>
      <Trans>
        Add your first event using the first buttons of the toolbar.
      </Trans>
    </p>
    <HelpButton helpPagePath="/events" />
  </PlaceholderMessage>
);

export default EmptyEventsPlaceholder;
