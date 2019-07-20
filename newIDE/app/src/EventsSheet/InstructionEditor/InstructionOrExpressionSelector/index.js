// @flow
import * as React from 'react';
import { List, makeSelectable } from 'material-ui/List';
import SearchBar from '../../../UI/SearchBar';
import { type EnumeratedInstructionOrExpressionMetadata } from './EnumeratedInstructionOrExpressionMetadata.js';
import { type InstructionOrExpressionTreeNode } from './CreateTree';
import ThemeConsumer from '../../../UI/Theme/ThemeConsumer';
import { filterInstructionsList } from './EnumerateInstructions';
import SelectorInstructionOrExpressionListItem from '../SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionTree } from '../SelectorListItems/SelectorInstructionsTreeListItem';

const SelectableList = makeSelectable(List);

const styles = {
  searchBar: {
    margin: '0 auto',
    backgroundColor: 'transparent',
  },
  groupListItemNestedList: {
    padding: 0,
  },
};

type Props = {|
  focusOnMount?: boolean,
  instructionsInfo: Array<EnumeratedInstructionOrExpressionMetadata>,
  instructionsInfoTree: InstructionOrExpressionTreeNode,
  selectedType: string,
  onChoose: (type: string, EnumeratedInstructionOrExpressionMetadata) => void,
  iconSize: number,
  style?: Object,
  useSubheaders?: boolean,
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
      style,
    } = this.props;
    const { searchText } = this.state;
    const displayedInstructionsList = searchText
      ? filterInstructionsList(this.props.instructionsInfo, { searchText })
      : [];

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
              onChange={searchText =>
                this.setState({
                  searchText,
                })
              }
              onRequestSearch={onSubmitSearch}
              style={styles.searchBar}
              ref={searchBar => (this._searchBar = searchBar)}
            />
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
          </div>
        )}
      </ThemeConsumer>
    );
  }
}
