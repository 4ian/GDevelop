// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import { List, type ListItemRefType } from '../../../UI/List';
import SearchBar, { useShouldAutofocusSearchbar } from '../../../UI/SearchBar';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import {
  type TreeNode,
  findInTree,
} from '../../../InstructionOrExpression/CreateTree';
import { filterInstructionsList } from '../../../InstructionOrExpression/EnumerateInstructions';
import ThemeConsumer from '../../../UI/Theme/ThemeConsumer';
import { renderInstructionOrExpressionListItem } from '../SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionOrExpressionTree } from '../SelectorListItems/SelectorInstructionsTreeListItem';
import EmptyMessage from '../../../UI/EmptyMessage';
import ScrollView, { type ScrollViewInterface } from '../../../UI/ScrollView';
import { Line } from '../../../UI/Grid';
import { getInstructionListItemValue } from '../SelectorListItems/Keys';

const styles = {
  searchBar: {
    backgroundColor: 'transparent',
    flexShrink: 0,
    zIndex: 1, // Put the SearchBar in front of the list, to display the shadow
  },
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
  _searchBar: ?SearchBar;
  _scrollView = React.createRef<ScrollViewInterface>();
  _selectedItem = React.createRef<ListItemRefType>();

  initialInstructionTypePath = findInTree(
    this.props.instructionsInfoTree,
    this.props.selectedType
  );

  componentDidMount() {
    if (
      this.props.focusOnMount &&
      // This is not a real hook
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useShouldAutofocusSearchbar() &&
      this._searchBar
    ) {
      this._searchBar.focus();
    }
    if (this._selectedItem.current && this._scrollView.current) {
      this._scrollView.current.scrollTo(this._selectedItem.current);
    }
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
    } = this.props;
    const { searchText } = this.state;
    const displayedInstructionsList: Array<T> = searchText
      ? filterInstructionsList(this.props.instructionsInfo, { searchText })
      : [];
    const hasResults = !searchText || !!displayedInstructionsList.length;

    const onSubmitSearch = () => {
      if (!displayedInstructionsList.length) return;

      onChoose(displayedInstructionsList[0].type, displayedInstructionsList[0]);
    };

    return (
      <ThemeConsumer>
        {muiTheme => (
          <div
            style={{
              backgroundColor: muiTheme.list.itemsBackgroundColor,
              ...style,
            }}
          >
            <SearchBar
              value={searchText}
              onChange={searchText =>
                this.setState({
                  searchText,
                })
              }
              onRequestSearch={onSubmitSearch}
              style={styles.searchBar}
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
            <ScrollView
              ref={
                // $FlowFixMe - improper typing of ScrollView?
                this._scrollView
              }
            >
              {hasResults && (
                <List>
                  {searchText
                    ? displayedInstructionsList.map(
                        enumeratedInstructionOrExpressionMetadata =>
                          renderInstructionOrExpressionListItem({
                            instructionOrExpressionMetadata: enumeratedInstructionOrExpressionMetadata,
                            iconSize: iconSize,
                            onClick: () =>
                              onChoose(
                                enumeratedInstructionOrExpressionMetadata.type,
                                enumeratedInstructionOrExpressionMetadata
                              ),
                            selectedValue: getInstructionListItemValue(
                              selectedType
                            ),
                          })
                      )
                    : renderInstructionOrExpressionTree({
                        instructionTreeNode: instructionsInfoTree,
                        iconSize,
                        onChoose,
                        useSubheaders,
                        selectedValue: getInstructionListItemValue(
                          selectedType
                        ),
                        initiallyOpenedPath: this.initialInstructionTypePath,
                        selectedItemRef: this._selectedItem,
                      })}
                </List>
              )}
              {!hasResults && (
                <Line>
                  <EmptyMessage>
                    <Trans>
                      Nothing corresponding to your search. Try browsing the
                      list instead.
                    </Trans>
                  </EmptyMessage>
                </Line>
              )}
            </ScrollView>
          </div>
        )}
      </ThemeConsumer>
    );
  }
}
