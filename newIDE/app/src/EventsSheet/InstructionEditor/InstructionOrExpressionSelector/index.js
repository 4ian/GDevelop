// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import Fuse from 'fuse.js';

import { List, type ListItemRefType } from '../../../UI/List';
import SearchBar, { type SearchBarInterface } from '../../../UI/SearchBar';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import {
  type TreeNode,
  findInTree,
} from '../../../InstructionOrExpression/CreateTree';
import { renderInstructionOrExpressionListItem } from '../SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionOrExpressionTree } from '../SelectorListItems/SelectorInstructionsTreeListItem';
import EmptyMessage from '../../../UI/EmptyMessage';
import ScrollView, { type ScrollViewInterface } from '../../../UI/ScrollView';
import { Line } from '../../../UI/Grid';
import RaisedButton from '../../../UI/RaisedButton';
import {
  getInstructionListItemValue,
  getInstructionOrExpressionIdentifier,
} from '../SelectorListItems/Keys';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import {
  tuneMatches,
  type SearchResult,
  sharedFuseConfiguration,
  getFuseSearchQueryForMultipleKeys,
} from '../../../UI/Search/UseSearchStructuredItem';
import Add from '../../../UI/CustomSvgIcons/Add';
const gd: libGDevelop = global.gd;

const getGroupIconSrc = (key: string) => {
  return gd.JsPlatform.get()
    .getInstructionOrExpressionGroupMetadata(key)
    .getIcon();
};

type Props<T> = {|
  focusOnMount?: boolean,
  instructionsInfo: Array<T>,
  instructionsInfoTree: TreeNode<T>,
  selectedType: string,
  onChoose: (type: string, T) => void,
  iconSize: number,
  useSubheaders?: boolean,
  searchPlaceholderObjectName?: ?string,
  searchPlaceholderIsCondition?: ?boolean,
  helpPagePath?: ?string,
  style?: Object,
  onClickMore?: () => void,
  id?: ?string,
|};

const InstructionOrExpressionSelector = <
  T: EnumeratedInstructionOrExpressionMetadata
>({
  focusOnMount,
  instructionsInfo,
  instructionsInfoTree,
  selectedType,
  onChoose,
  iconSize,
  useSubheaders,
  searchPlaceholderObjectName,
  searchPlaceholderIsCondition,
  helpPagePath,
  style,
  onClickMore,
  id,
}: Props<T>) => {
  const searchBarRef = React.useRef<?SearchBarInterface>(null);
  const scrollViewRef = React.useRef<?ScrollViewInterface>(null);
  const selectedItemRef = React.useRef<?ListItemRefType>(null);
  const [searchText, setSearchText] = React.useState<string>('');
  const searchApi = React.useMemo(
    () =>
      new Fuse(instructionsInfo, {
        ...sharedFuseConfiguration,
        keys: [
          { name: 'displayedName', weight: 2 },
          { name: 'fullGroupName', weight: 1 },
        ],
      }),
    [instructionsInfo]
  );
  const initialInstructionTypePathRef = React.useRef<?(string[])>(
    findInTree(instructionsInfoTree, selectedType)
  );

  const displayedInstructionsList: Array<SearchResult<T>> =
    !!searchText && searchApi
      ? searchApi
          .search(
            getFuseSearchQueryForMultipleKeys(searchText, [
              'displayedName',
              'fullGroupName',
            ])
          )
          .map(result => ({
            item: result.item,
            matches: tuneMatches(result, searchText),
          }))
      : [];
  const hasResults = !searchText || !!displayedInstructionsList.length;

  const onSubmitSearch = () => {
    if (!displayedInstructionsList.length) return;

    onChoose(
      displayedInstructionsList[0].item.type,
      displayedInstructionsList[0].item
    );
  };

  React.useEffect(
    () => {
      if (selectedItemRef.current && scrollViewRef.current) {
        scrollViewRef.current.scrollTo(selectedItemRef.current);
      }
    },
    // When the component is mounted, if an item is already selected
    // (this happens when a user edits an existing instruction), auto scroll
    // to the item in the list.
    []
  );

  return (
    <div
      style={{
        // Important for the component to not take the full height in a dialog,
        // allowing to let the scrollview do its job.
        minHeight: 0,
        ...style,
      }}
      id={id}
    >
      <SearchBar
        value={searchText}
        onChange={setSearchText}
        onRequestSearch={onSubmitSearch}
        placeholder={
          searchPlaceholderObjectName
            ? searchPlaceholderIsCondition
              ? t`Search ${searchPlaceholderObjectName} conditions`
              : t`Search ${searchPlaceholderObjectName} actions`
            : undefined
        }
        helpPagePath={helpPagePath}
        ref={searchBarRef}
        autoFocus={focusOnMount ? 'desktop' : undefined}
      />
      <ScrollView autoHideScrollbar ref={scrollViewRef}>
        {hasResults && (
          <List>
            {searchText ? (
              displayedInstructionsList.map(
                ({
                  item: enumeratedInstructionOrExpressionMetadata,
                  matches,
                }) =>
                  renderInstructionOrExpressionListItem({
                    instructionOrExpressionMetadata: enumeratedInstructionOrExpressionMetadata,
                    id: getInstructionOrExpressionIdentifier(
                      enumeratedInstructionOrExpressionMetadata
                    ),
                    iconSize: iconSize,
                    onClick: () =>
                      onChoose(
                        enumeratedInstructionOrExpressionMetadata.type,
                        enumeratedInstructionOrExpressionMetadata
                      ),
                    matches,
                    selectedValue: getInstructionListItemValue(selectedType),
                  })
              )
            ) : (
              <>
                {renderInstructionOrExpressionTree({
                  instructionTreeNode: instructionsInfoTree,
                  iconSize,
                  onChoose,
                  useSubheaders,
                  selectedValue: getInstructionListItemValue(selectedType),
                  initiallyOpenedPath: initialInstructionTypePathRef.current,
                  selectedItemRef: selectedItemRef,
                  getGroupIconSrc,
                })}
                {onClickMore && (
                  <ResponsiveLineStackLayout justifyContent="center">
                    <RaisedButton
                      primary
                      icon={<Add />}
                      onClick={onClickMore}
                      label={<Trans>Add a new behavior to the object</Trans>}
                    />
                  </ResponsiveLineStackLayout>
                )}
              </>
            )}
          </List>
        )}
        {!hasResults && (
          <Line>
            <EmptyMessage>
              <Trans>
                Nothing corresponding to your search. Try browsing the list
                instead.
              </Trans>
            </EmptyMessage>
          </Line>
        )}
      </ScrollView>
    </div>
  );
};

export default InstructionOrExpressionSelector;
