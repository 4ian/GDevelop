// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import * as React from 'react';
import TextField from '../UI/TextField';
import FlatButton from '../UI/FlatButton';
import Window from '../Utils/Window';
import { List, ListItem } from '../UI/List';
import { Column } from '../UI/Grid';
import algoliasearch from 'algoliasearch/lite';
import debounce from 'lodash/debounce';
import Text from '../UI/Text';

const styles = {
  dropdownMenuContainer: {
    maxHeight: 300,
    overflowY: 'scroll',
  },
};

type Props = {|
  onChange: string => void,
  value: string,
|};

type AlgoliaResult = {|
  content: string,
  url: string,
  hierarchy: {|
    lvl0: ?string,
    lvl1: ?string,
    lvl2: ?string,
    lvl3: ?string,
    lvl4: ?string,
    lvl5: ?string,
    lvl6: ?string,
  |},
  objectID: string,
|};

type State = {|
  results: ?Array<AlgoliaResult>,
  error: ?Error,
|};

const fixSomeHtmlCharacters = (str: string) => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'");
};

const indexName = 'gdevelop';
const appId = 'BH4D9OD16A';
const apiKey = '69c73fc1a710bb79543d4b91f6b81c08';
const algoliaOptions = { hitsPerPage: 5 };

export default class DocSearchArea extends React.Component<Props, State> {
  // $FlowFixMe
  client = algoliasearch(appId, apiKey, algoliaOptions);
  state = {
    results: null,
    error: null,
  };

  _handleSearchTextChange = (searchText: string) => {
    this.props.onChange(searchText);
  };

  _launchSearchRequest = debounce(() => {
    if (this.props.value) {
      this.client
        // $FlowFixMe
        .search([
          {
            indexName: indexName,
            query: this.props.value,
            params: algoliaOptions,
          },
        ])
        .then(
          data => {
            let hits = data.results[0].hits;
            console.log(hits);

            this.setState({
              results: hits,
              error: null,
            });
          },
          error => {
            this.setState({
              error,
            });
          }
        );
    }
  }, 200);

  componentDidUpdate(prevProps: Props) {
    if (prevProps.value !== this.props.value && this.props.value) {
      this._launchSearchRequest();
    }
  }

  _renderResult = (result: AlgoliaResult) => {
    const primaryText =
      result.hierarchy.lvl0 ||
      result.hierarchy.lvl1 ||
      result.hierarchy.lvl2 ||
      result.hierarchy.lvl3 ||
      result.hierarchy.lvl4 ||
      result.hierarchy.lvl5 ||
      result.hierarchy.lvl6 ||
      '';

    const secondaryText = [
      result.hierarchy.lvl0,
      result.hierarchy.lvl1,
      result.hierarchy.lvl2,
      result.hierarchy.lvl3,
      result.hierarchy.lvl4,
      result.hierarchy.lvl5,
      result.hierarchy.lvl6,
    ]
      .filter(text => !!text)
      .filter(text => text !== primaryText)
      .join(' - ');

    return (
      <ListItem
        key={result.objectID}
        primaryText={fixSomeHtmlCharacters(primaryText)}
        secondaryText={fixSomeHtmlCharacters(result.content || secondaryText)}
        secondaryTextLines={2}
        onClick={() => {
          Window.openExternalURL(result.url);
        }}
      />
    );
  };

  render() {
    return (
      <div>
        <TextField
          id={'help-finder-search-bar'}
          fullWidth
          translatableHintText={t`Search on the documentation.`}
          value={this.props.value}
          onChange={(e, text) => this.props.onChange(text)}
        />
        <div
          id="help-finder-dropdown-menu-container"
          className="algolia-autocomplete"
          style={{
            ...styles.dropdownMenuContainer,
            visibility: !this.props.value ? 'hidden' : undefined,
          }}
        />
        {this.state.error ? (
          <Text>
            <Trans>
              Unable to search in the documentation. Are you sure you are online
              and have a proper internet connection?
            </Trans>
          </Text>
        ) : this.state.results ? (
          <List>
            {this.state.results.map(result => this._renderResult(result))}
          </List>
        ) : (
          <React.Fragment>
            <Text>
              <Trans>Examples:</Trans>
            </Text>
            <Column expand>
              <Text>
                Coins in platformer
                <br />
                Export on Android
                <br />
                Add a score
                <br />
                Move enemies
                <br />
                ...
                <br />
              </Text>
            </Column>
          </React.Fragment>
        )}
        <Text align="right">
          This search is powered by{' '}
          <FlatButton
            onClick={() => Window.openExternalURL('http://algolia.com/')}
            label={'Algolia'}
          />
        </Text>
      </div>
    );
  }
}
