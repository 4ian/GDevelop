// @flow
import { Trans } from '@lingui/macro';

import React, { PureComponent } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { Line, Column } from '../UI/Grid';
import FlatButton from 'material-ui/FlatButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import IconButton from 'material-ui/IconButton';
import InlineCheckbox from '../UI/InlineCheckbox';
import { showMessageBox } from '../UI/Messages/MessageBox';
import {
  type SearchInEventsInputs,
  type ReplaceInEventsInputs,
} from './EventsSearcher';

type Props = {|
  onSearchInEvents: SearchInEventsInputs => void,
  onReplaceInEvents: ReplaceInEventsInputs => void,
  resultsCount: ?number,
  hasEventSelected: boolean,
  onGoToPreviousSearchResult: () => ?gdBaseEvent,
  onGoToNextSearchResult: () => ?gdBaseEvent,
|};
type State = {|
  searchDirty: boolean,
  searchText: string,
  replaceText: string,
  matchCase: boolean,
  searchInSelection: boolean,
|};

export default class SearchPanel extends PureComponent<Props, State> {
  searchTextField: ?TextField;
  state = {
    searchDirty: false,
    searchText: '',
    replaceText: '',
    matchCase: false,
    searchInSelection: false,
  };

  focus = () => {
    if (this.searchTextField) {
      this.searchTextField.focus();
    }
  };

  launchSearch = () => {
    const { searchText, searchInSelection, matchCase } = this.state;
    this.props.onSearchInEvents({
      searchInSelection,
      searchText,
      matchCase,
      searchInActions: true,
      searchInConditions: true,
    });
    this.setState({
      searchDirty: false,
    });
  };

  launchReplace = () => {
    const {
      searchDirty,
      searchText,
      replaceText,
      searchInSelection,
      matchCase,
    } = this.state;
    if (searchDirty) {
      showMessageBox(
        'Click on Search first, inspect the results and then click on Replace to do the replacement(s).'
      );
      return;
    }

    this.props.onReplaceInEvents({
      searchInSelection,
      searchText,
      replaceText,
      matchCase,
      searchInActions: true,
      searchInConditions: true,
    });
  };

  render() {
    const {
      resultsCount,
      hasEventSelected,
      onGoToPreviousSearchResult,
      onGoToNextSearchResult,
    } = this.props;
    const { searchText, replaceText, searchInSelection } = this.state;

    return (
      <Paper>
        <Column>
          <Line alignItems="baseline">
            <TextField
              ref={_searchTextField =>
                (this.searchTextField = _searchTextField)
              }
              hintText={<Trans>Text to search</Trans>}
              onChange={(e, searchText) =>
                this.setState({ searchText, searchDirty: true })
              }
              value={searchText}
              fullWidth
            />
            <FlatButton
              disabled={!searchText}
              primary
              label={<Trans>Search</Trans>}
              onClick={this.launchSearch}
            />
          </Line>
          <Line alignItems="baseline">
            <TextField
              hintText={<Trans>Text to replace</Trans>}
              onChange={(e, replaceText) => this.setState({ replaceText })}
              value={replaceText}
              fullWidth
            />
            <FlatButton
              disabled={
                !replaceText ||
                !searchText ||
                (!hasEventSelected && searchInSelection)
              }
              label={<Trans>Replace</Trans>}
              onClick={this.launchReplace}
            />
          </Line>
          <Line noMargin alignItems="center" justifyContent="space-between">
            <Line noMargin alignItems="center">
              <InlineCheckbox
                label={<Trans>Case insensitive</Trans>}
                checked={!this.state.matchCase}
                onCheck={(e, checked) => this.setState({ matchCase: !checked })}
              />
              {/* <InlineCheckbox //TODO: Implement search/replace in selection
                label={<Trans>Replace in selection</Trans>}
                checked={this.state.searchInSelection}
                onCheck={(e, checked) =>
                  this.setState({ searchInSelection: checked })}
              /> */}
            </Line>
            <Line noMargin alignItems="center">
              <p>
                {resultsCount === null || resultsCount === undefined
                  ? ''
                  : resultsCount !== 0
                  ? `${resultsCount} results`
                  : `No results`}
              </p>
              <IconButton
                disabled={!resultsCount}
                onClick={() => onGoToPreviousSearchResult()}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                disabled={!resultsCount}
                onClick={() => onGoToNextSearchResult()}
              >
                <ChevronRight />
              </IconButton>
            </Line>
          </Line>
        </Column>
      </Paper>
    );
  }
}
