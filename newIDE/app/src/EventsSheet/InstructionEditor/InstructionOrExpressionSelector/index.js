// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { List, makeSelectable } from 'material-ui/List';
import SearchBar from '../../../UI/SearchBar';
import { type EnumeratedInstructionOrExpressionMetadata } from './EnumeratedInstructionOrExpressionMetadata.js';
import { type InstructionOrExpressionTreeNode } from './CreateTree';
import ThemeConsumer from '../../../UI/Theme/ThemeConsumer';
import { filterInstructionsList } from './EnumerateInstructions';
import SelectorInstructionOrExpressionListItem from '../SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionTree } from '../SelectorListItems/SelectorInstructionsTreeListItem';
import EmptyMessage from '../../../UI/EmptyMessage';
import ScrollView from '../../../UI/ScrollView';
import { Column, Line } from '../../../UI/Grid';

const SelectableList = makeSelectable(List);

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
  searchBarHintText?: React.Node,
|};
type State = {|
  searchText: string,
  searchResults: Array<EnumeratedInstructionOrExpressionMetadata>,
|};

export default class InstructionOrExpressionSelector extends React.Component<
  Props,
  State
> {
  state = {
    searchText: '',
    searchResults: [],
  };
  _searchBar: ?SearchBar;

  componentDidMount() {
    if (this.props.focusOnMount && this._searchBar) {
      this._searchBar.focus();
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
      searchBarHintText,
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
          <Column noMargin expand>
            <SearchBar
              value={searchText}
              onChange={searchText =>
                this.setState({
                  searchText,
                })
              }
              onRequestSearch={onSubmitSearch}
              style={styles.searchBar}
              placeholder={searchBarHintText}
              ref={searchBar => (this._searchBar = searchBar)}
            />
            <ScrollView
              style={{ backgroundColor: muiTheme.list.itemsBackgroundColor }}
            >
              {hasResults && (
                <SelectableList value={selectedType}>
                  {searchText
                    ? displayedInstructionsList.map(
                        enumeratedInstructionOrExpressionMetadata => (
                          <SelectorInstructionOrExpressionListItem
                            instructionOrExpressionMetadata={
                              enumeratedInstructionOrExpressionMetadata
                            }
                            iconSize={iconSize}
                            onClick={() =>
                              onChoose(
                                enumeratedInstructionOrExpressionMetadata.type,
                                enumeratedInstructionOrExpressionMetadata
                              )
                            }
                          />
                        )
                      )
                    : renderInstructionTree({
                        instructionTreeNode: instructionsInfoTree,
                        iconSize,
                        onChoose,
                        useSubheaders: true,
                      })}
                </SelectableList>
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
          </Column>
        )}
      </ThemeConsumer>
    );
  }
}
