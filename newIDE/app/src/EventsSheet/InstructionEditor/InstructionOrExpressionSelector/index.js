// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import * as React from 'react';
import { List } from '../../../UI/List';
import SearchBar from '../../../UI/SearchBar';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import {
  type InstructionOrExpressionTreeNode,
  findInTree,
} from '../../../InstructionOrExpression/CreateTree';
import { filterInstructionsList } from '../../../InstructionOrExpression/EnumerateInstructions';
import ThemeConsumer from '../../../UI/Theme/ThemeConsumer';
import { renderInstructionOrExpressionListItem } from '../SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionTree } from '../SelectorListItems/SelectorInstructionsTreeListItem';
import EmptyMessage from '../../../UI/EmptyMessage';
import ScrollView, { type ScrollViewInterface } from '../../../UI/ScrollView';
import { Line } from '../../../UI/Grid';
import { ListItem } from '../../../UI/List';
import { getInstructionListItemValue } from '../SelectorListItems/Keys';

const styles = {
  searchBar: {
    backgroundColor: 'transparent',
    flexShrink: 0,
    zIndex: 1, // Put the SearchBar in front of the list, to display the shadow
  },
};

type Props = {|
  focusOnMount?: boolean,
  instructionsInfo: Array<EnumeratedInstructionOrExpressionMetadata>,
  instructionsInfoTree: InstructionOrExpressionTreeNode,
  selectedType: string,
  onChoose: (type: string, EnumeratedInstructionOrExpressionMetadata) => void,
  iconSize: number,
  useSubheaders?: boolean,
  searchPlaceholderObjectName?: ?string,
  searchPlaceholderIsCondition?: ?boolean,
  helpPagePath?: ?string,
  style?: Object,
|};
type State = {|
  searchText: string,
  searchResults: Array<EnumeratedInstructionOrExpressionMetadata>,
|};

export default class InstructionOrExpressionSelector extends React.PureComponent<
  Props,
  State
> {
  state = {
    searchText: '',
    searchResults: [],
  };
  _searchBar: ?SearchBar;
  _scrollView = React.createRef<ScrollViewInterface>();
  _selectedItem = React.createRef<ListItem>();

  initialInstructionTypePath = findInTree(
    this.props.instructionsInfoTree,
    this.props.selectedType
  );

  componentDidMount() {
    if (this.props.focusOnMount && this._searchBar) {
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
    const displayedInstructionsList = searchText
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
                    : renderInstructionTree({
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
