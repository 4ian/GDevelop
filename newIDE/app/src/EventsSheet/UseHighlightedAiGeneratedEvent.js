// @flow
import * as React from 'react';

type Props = {|
  isActive: boolean,
|};

type Output = {|
  addNewAiGeneratedEventIds: (ids: Set<string>) => void,
  highlightedAiGeneratedEventIds: Set<string>,
|};

export const useHighlightedAiGeneratedEvent = ({ isActive }: Props): Output => {
  const [
    highlightedAiGeneratedEventIds,
    setHighlightedAiGeneratedEventIds,
  ] = React.useState<Set<string>>(() => new Set());

  const resetHighlightsOnNextAddition = React.useRef(false);

  React.useEffect(
    () => {
      // When the events sheet is "navigated away", then next time there is a generated event,
      // the previously highlighted event(s) will be reset (because we consider the user saw them).
      if (!isActive) {
        resetHighlightsOnNextAddition.current = true;
      }
    },
    [isActive]
  );

  const addNewAiGeneratedEventIds = React.useCallback((ids: Set<string>) => {
    setHighlightedAiGeneratedEventIds(prev => {
      const newSet = new Set(
        resetHighlightsOnNextAddition.current ? new Set() : prev
      );
      ids.forEach(id => newSet.add(id));

      resetHighlightsOnNextAddition.current = false;

      return newSet;
    });
  }, []);

  return { addNewAiGeneratedEventIds, highlightedAiGeneratedEventIds };
};
