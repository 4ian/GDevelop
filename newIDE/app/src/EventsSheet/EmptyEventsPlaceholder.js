// @flow
import * as React from 'react';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import HelpButton from '../UI/HelpButton';

const EmptyEventsPlaceholder = () => (
  <PlaceholderMessage>
    <p>
      There are no events here. Events are composed of conditions and actions.
    </p>
    <p>Add your first event using the first buttons of the toolbar.</p>
    <HelpButton helpPagePath="/events" />
  </PlaceholderMessage>
);

export default EmptyEventsPlaceholder;
