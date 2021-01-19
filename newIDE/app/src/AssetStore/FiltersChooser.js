// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type Filters,
  type TagsTreeNode,
} from '../Utils/GDevelopServices/Asset';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Subheader from '../UI/Subheader';
import InlineCheckbox from '../UI/InlineCheckbox';
import { ColumnStackLayout } from '../UI/Layout';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import EmptyMessage from '../UI/EmptyMessage';

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

const nodeIdSeparator = ';-/>'; // A seemingly random string to ensure no clashes with tag names.
const toNodeId = (nodes: Array<TagsTreeNode>) =>
  nodes.map(node => node.name).join(nodeIdSeparator);

const TagsTreeItems = ({
  tagsTreeNodes,
  onChoose,
  parentNodes,
}: {|
  parentNodes: Array<TagsTreeNode>,
  tagsTreeNodes: Array<TagsTreeNode>,
  onChoose: ChosenCategory => void,
|}) => {
  if (!tagsTreeNodes.length) return null;

  return tagsTreeNodes.map(node => {
    const newParentNodes = [...parentNodes, node];
    return (
      <TreeItem
        nodeId={toNodeId(newParentNodes)}
        label={node.name}
        key={node.name}
        onLabelClick={() => onChoose({ node, parentNodes })}
        collapseIcon={node.children.length ? <ExpandMoreIcon /> : null}
        expandIcon={node.children.length ? <ChevronRightIcon /> : null}
      >
        <TagsTreeItems
          tagsTreeNodes={node.children}
          parentNodes={newParentNodes}
          onChoose={onChoose}
        />
      </TreeItem>
    );
  });
};

const MemoizedTagsTree = React.memo(function TagsTree({
  chosenCategory,
  setChosenCategory,
  allFilters,
}) {
  return (
    <TreeView
      selected={
        chosenCategory
          ? toNodeId([...chosenCategory.parentNodes, chosenCategory.node])
          : ''
      }
      onNodeSelect={() => {}}
    >
      <TreeItem
        nodeId=""
        label={<Trans>All assets</Trans>}
        onLabelClick={() => setChosenCategory(null)}
      />
      <TagsTreeItems
        tagsTreeNodes={allFilters.tagsTree}
        onChoose={setChosenCategory}
        parentNodes={[]}
      />
    </TreeView>
  );
});

const capitalize = (str: string) => {
  if (!str) return '';

  return str[0].toUpperCase() + str.substr(1);
};

type Props = {|
  filtersState: FiltersState,
  allFilters: ?Filters,
  error: ?Error,
|};

export const FiltersChooser = ({ filtersState, allFilters, error }: Props) => {
  if (!allFilters) {
    return <PlaceholderLoader />;
  }
  if (error) {
    // Error and retry button shown somewhere else in the UI
    return null;
  }

  // Only display the tags that are contained inside the selected category
  const selectedCategoryTags = filtersState.chosenCategory
    ? filtersState.chosenCategory.node.allChildrenTags
    : allFilters.defaultTags;

  return (
    <React.Fragment>
      {allFilters.tagsTree.length ? (
        <React.Fragment>
          <Subheader>Categories</Subheader>
          <MemoizedTagsTree
            chosenCategory={filtersState.chosenCategory}
            setChosenCategory={filtersState.setChosenCategory}
            allFilters={allFilters}
          />
        </React.Fragment>
      ) : null}
      <Subheader>Filters</Subheader>
      <ColumnStackLayout>
        {!selectedCategoryTags ? (
          <EmptyMessage>
            <Trans>Choose a category to display filters</Trans>
          </EmptyMessage>
        ) : selectedCategoryTags.length ? (
          selectedCategoryTags.map(tag => (
            <InlineCheckbox
              key={tag}
              label={capitalize(tag)}
              checked={filtersState.chosenFilters.has(tag)}
              onCheck={() => {
                if (filtersState.chosenFilters.has(tag)) {
                  filtersState.removeFilter(tag);
                } else {
                  filtersState.addFilter(tag);
                }
              }}
            />
          ))
        ) : (
          <EmptyMessage>
            <Trans>No filters in this category.</Trans>
          </EmptyMessage>
        )}
      </ColumnStackLayout>
    </React.Fragment>
  );
};
