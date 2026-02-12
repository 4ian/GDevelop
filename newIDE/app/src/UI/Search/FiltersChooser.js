// @flow
import * as React from 'react';
import { type TagsTreeNode } from '../../Utils/GDevelopServices/Filters';

export type ChosenCategory = {|
  node: TagsTreeNode,
  parentNodes: Array<TagsTreeNode>,
|};

export type FiltersState = {|
  chosenFilters: Set<string>,
  addFilter: string => void,
  removeFilter: string => void,
  chosenCategory: ?ChosenCategory,
  setChosenCategory: (?ChosenCategory) => void,
|};

export const useFilters = (): FiltersState => {
  const [chosenCategory, setChosenCategory] = React.useState<?ChosenCategory>(
    null
  );
  const [chosenFilters, setChosenFilters] = React.useState<Set<string>>(
    () => new Set()
  );

  const setChosenCategoryAndUpdateFilters = React.useCallback(
    (newChosenCategory: ?ChosenCategory) => {
      if (!newChosenCategory) {
        // No more category is chosen. Keep the filters
        setChosenCategory(null);
      } else {
        // Remove the filters that are not included in the category,
        // as it would make no sense (not displayed, and everything would be filtered out).
        const newChosenFilters = new Set();
        for (const tag of chosenFilters.keys()) {
          if (newChosenCategory.node.allChildrenTags.includes(tag)) {
            newChosenFilters.add(tag);
          }
        }

        setChosenFilters(newChosenFilters);
        setChosenCategory(newChosenCategory);
      }
    },
    [chosenFilters]
  );

  return {
    chosenCategory,
    setChosenCategory: setChosenCategoryAndUpdateFilters,
    chosenFilters,
    addFilter: (tag: string) => {
      const newChosenFilters = new Set(chosenFilters);
      newChosenFilters.add(tag);
      setChosenFilters(newChosenFilters);
    },
    removeFilter: (tag: string) => {
      const newChosenFilters = new Set(chosenFilters);
      newChosenFilters.delete(tag);

      setChosenFilters(newChosenFilters);
    },
  };
};
