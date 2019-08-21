// @flow
import { Trans } from '@lingui/macro';

import React, { PureComponent } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { Line, Column } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import IconButton from 'material-ui/IconButton';
import InlineCheckbox from '../UI/InlineCheckbox';
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
  searchText: string,
  replaceText: string,
  matchCase: boolean,
  searchInActions: boolean,
  searchInConditions: boolean,
  searchInSelection: boolean,
|};

export default class SearchPanel extends PureComponent<Props, State> {
  searchTextField: ?TextField;
  state = {
    searchText: '',
    replaceText: '',
    matchCase: false,
    searchInActions: true,
    searchInConditions: true,
    searchInSelection: false,
  };

  focus = () => {
    if (this.searchTextField) {
      this.searchTextField.focus();
    }
  };

  launchSearch = () => {
    const {
      searchText,
      searchInSelection,
      matchCase,
      searchInActions,
      searchInConditions,
    } = this.state;
    this.props.onSearchInEvents({
      searchInSelection,
      searchText,
      matchCase,
      searchInActions,
      searchInConditions,
    });
  };

  launchReplace = () => {
    const {
      searchText,
      replaceText,
      searchInSelection,
      matchCase,
      searchInActions,
      searchInConditions,
    } = this.state;

    this.launchSearch();

    this.props.onReplaceInEvents({
      searchInSelection,
      searchText,
      replaceText,
      matchCase,
      searchInActions,
      searchInConditions,
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
              onChange={(e, searchText) => this.setState({ searchText })}
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
              <p>
                <Trans>Filter by</Trans>
              </p>
              <InlineCheckbox
                label={<Trans>Conditions</Trans>}
                checked={this.state.searchInConditions}
                onCheck={(e, checked) =>
                  this.setState({ searchInConditions: checked })
                }
              />
              <InlineCheckbox
                label={<Trans>Actions</Trans>}
                checked={this.state.searchInActions}
                onCheck={(e, checked) =>
                  this.setState({ searchInActions: checked })
                }
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
