// @flow
import { Trans } from '@lingui/macro';
import { List } from '@material-ui/core';
import * as React from 'react';
import { Column } from '../UI/Grid';
import PlaceholderError from '../UI/PlaceholderError';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { TutorialContext } from './TutorialContext';
import TutorialListItem from './TutorialListItem';

type Props = {};

export const TutorialsList = (props: Props) => {
  const { tutorials, error, fetchTutorials } = React.useContext(
    TutorialContext
  );

  React.useEffect(
    () => {
      fetchTutorials();
    },
    [fetchTutorials]
  );

  if (error) {
    return (
      <PlaceholderError onRetry={fetchTutorials}>
        <Trans>
          Can't load the tutorials. Verify your internet connection or retry
          later.
        </Trans>
      </PlaceholderError>
    );
  }

  if (!tutorials) {
    return <PlaceholderLoader />;
  }

  return (
    <Column expand noMargin>
      <List>
        {tutorials &&
          tutorials.map(tutorial => (
            <TutorialListItem key={tutorial.id} tutorial={tutorial} />
          ))}
      </List>
    </Column>
  );
};
