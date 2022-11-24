// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import Add from '@material-ui/icons/Add';
import Fuse from 'fuse.js';

import { List, type ListItemRefType } from '../../../UI/List';
import SearchBar, {
  useShouldAutofocusSearchbar,
  type SearchBarInterface,
} from '../../../UI/SearchBar';
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
import { getInstructionListItemValue } from '../SelectorListItems/Keys';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';
import {
  tuneMatches,
  type SearchResult,
  sharedFuseConfiguration,
} from '../../../UI/Search/UseSearchStructuredItem';
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
type State<T> = {|
  searchText: string,
  searchResults: Array<T>,
|};

export default class InstructionOrExpressionSelector<
  T: EnumeratedInstructionOrExpressionMetadata
> extends React.PureComponent<Props<T>, State<T>> {
  state: State<T> = {
    searchText: '',
    searchResults: [],
  };
  _searchBar: ?SearchBarInterface;
  _scrollView = React.createRef<ScrollViewInterface>();
  _selectedItem = React.createRef<ListItemRefType>();
  searchApi = null;

  initialInstructionTypePath = findInTree(
    this.props.instructionsInfoTree,
    this.props.selectedType
  );

  componentDidMount() {
    if (
      this.props.focusOnMount &&
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useShouldAutofocusSearchbar() &&
      this._searchBar
    ) {
      this._searchBar.focus();
    }
    if (this._selectedItem.current && this._scrollView.current) {
      this._scrollView.current.scrollTo(this._selectedItem.current);
    }

    this.searchApi = new Fuse(this.props.instructionsInfo, {
      ...sharedFuseConfiguration,
      keys: [
        { name: 'displayedName', weight: 2 },
        { name: 'fullGroupName', weight: 1 },
      ],
    });
  }

  focus = () => {
    if (this._searchBar) this._searchBar.focus();
  };

  render() {
    const {
      selectedType,
      iconSize,
      instructionsInfoTree,
      onChoose,
      searchPlaceholderObjectName,
      searchPlaceholderIsCondition,
      useSubheaders,
      helpPagePath,
      style,
      onClickMore,
      id,
    } = this.props;
    const { searchText } = this.state;
    const displayedInstructionsList: Array<SearchResult<T>> =
      !!searchText && this.searchApi
        ? this.searchApi.search(`'${searchText}`).map(result => ({
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
          onChange={searchText =>
            this.setState({
              searchText,
            })
          }
          onRequestSearch={onSubmitSearch}
          placeholder={
            searchPlaceholderObjectName
              ? searchPlaceholderIsCondition
                ? t`Search ${searchPlaceholderObjectName} conditions`
                : t`Search ${searchPlaceholderObjectName} actions`
              : undefined
          }
          helpPagePath={helpPagePath}
          ref={searchBar => (this._searchBar = searchBar)}
        />
        <ScrollView autoHideScrollbar ref={this._scrollView}>
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
                      id:
                        'instruction-or-expression-' +
                        enumeratedInstructionOrExpressionMetadata.type.replace(
                          /:/g,
                          '-'
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
                    initiallyOpenedPath: this.initialInstructionTypePath,
                    selectedItemRef: this._selectedItem,
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
  }
}
