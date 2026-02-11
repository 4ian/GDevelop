// @flow
import * as React from 'react';
import {
  listAllTutorials,
  type Tutorial,
} from '../Utils/GDevelopServices/Tutorial';

type TutorialState = {|
  tutorials: ?Array<Tutorial>,
  fetchTutorials: () => void,
  error: ?Error,
|};

export const TutorialContext = React.createContext<TutorialState>({
  tutorials: null,
  fetchTutorials: () => {},
  error: null,
});

type TutorialStateProviderProps = {|
  children: React.Node,
|};

export const TutorialStateProvider = ({
  children,
}: TutorialStateProviderProps) => {
  const [tutorials, setTutorials] = React.useState<?(Tutorial[])>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const fetchTutorials = React.useCallback(
    () => {
      // Don't attempt to load again tutorials if they
      // were loaded already.
      if (tutorials || isLoading.current) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const allTutorials: Array<Tutorial> = await listAllTutorials();

          console.info(
            `Loaded ${allTutorials ? allTutorials.length : 0} tutorials.`
          );
          setTutorials(allTutorials);
        } catch (error) {
          console.error(`Unable to load the tutorials:`, error);
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [tutorials, isLoading]
  );

  const tutorialState = React.useMemo(
    () => ({
      tutorials,
      fetchTutorials,
      error,
    }),
    [tutorials, fetchTutorials, error]
  );

  return (
    <TutorialContext.Provider value={tutorialState}>
      {children}
    </TutorialContext.Provider>
  );
};
