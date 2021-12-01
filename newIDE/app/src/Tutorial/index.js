// @flow
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import { ListSearchResults } from '../UI/Search/ListSearchResults';
import { TutorialContext } from './TutorialContext';
import { TutorialListItem } from './TutorialListItem';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';

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

  return (
    <ResponsiveWindowMeasurer>
      {windowWidth => (
        <Column expand noMargin useFullHeight>
          <Line
            expand
            overflow={
              'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
            }
          >
            <ListSearchResults
              onRetry={fetchTutorials}
              error={error}
              searchItems={tutorials}
              getSearchItemUniqueId={tutorial => tutorial.id}
              renderSearchItem={(tutorial, onHeightComputed) => (
                <TutorialListItem
                  onHeightComputed={onHeightComputed}
                  tutorial={tutorial}
                />
              )}
            />
          </Line>
        </Column>
      )}
    </ResponsiveWindowMeasurer>
  );
};
