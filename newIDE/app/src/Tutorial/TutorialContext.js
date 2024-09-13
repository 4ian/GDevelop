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
          setTutorials([
            {
              id: 'education-curriculum-flappy-cat',
              titleByLocale: { en: 'Flappy Cat' },
              descriptionByLocale: {
                en:
                  "It's time to make your first game! And what a way to learn than by making your own version of this mobile sensation. Tap tap tap, make sure the cat doesn't touch the ground or the walls!",
              },
              isPrivateTutorial: true,
              type: 'pdf-tutorial',
              category: 'education-curriculum',
              linkByLocale: {
                en: 'https://api-dev.gdevelop.io/pdf-tutorial/flappy-cat',
              },
              thumbnailUrlByLocale: {
                en:
                  'https://resources.gdevelop-app.com/tutorials/images/flappy-cat.jpg',
              },
              redeemHintByLocale: {
                en:
                  'This tutorial is made for education and accessible to teachers and subscribers to the GDevelop Education plan only.',
              },
              redeemLinkByLocale: {
                en: 'https://gdevelop.io/pricing/education',
              },
              tagsByLocale: [{ en: 'Single player' }, { en: 'Beginner' }],
              sectionByLocale: { en: 'Practical lessons' },
              gameLink: 'https://gd.games/gdevelop/flappy-cat',
              templateUrl:
                'https://resources.gdevelop-app.com/tutorials/templates/flappy-cat/game.json',
            },
          ]);
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
