// @flow
import * as React from 'react';
import TextField from 'material-ui/TextField';
import Window from '../Utils/Window';
import './DocSearchOverrides.css';
import { Column } from '../UI/Grid';

const styles = {
  dropdownMenuContainer: {
    maxHeight: 300,
    overflowY: 'scroll',
  },
};

export default class DocSearchArea extends React.Component<*, *> {
  componentDidMount() {
    if (!global.docsearch) {
      console.warn("docsearch not found - DocSearchArea won't work");
      return;
    }

    try {
      global.docsearch({
        apiKey: '69c73fc1a710bb79543d4b91f6b81c08',
        indexName: 'gdevelop',
        inputSelector: '#help-finder-search-bar',
        debug: true, // Set debug to true if you want to inspect the dropdown
        handleSelected: (input, event, suggestion) => {
          Window.openExternalURL(suggestion.url);
          this.props.onChange('');
        },
        autocompleteOptions: {
          appendTo: true,
          hint: false,
          dropdownMenuContainer: '#help-finder-dropdown-menu-container',
        },
      });
    } catch (e) {
      console.error('Error while loading docsearch:', e);
    }
  }

  render() {
    return (
      <div>
        <TextField
          id={'help-finder-search-bar'}
          fullWidth
          hintText={'Enter what you want to build.'}
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
        {!this.props.value && (
          <React.Fragment>
            <p>Examples:</p>
            <Column expand>
              <p>Coins in platformer</p>
              <p>Export on Android</p>
              <p>Add a score</p>
              <p>Move enemies</p>
            </Column>
          </React.Fragment>
        )}
      </div>
    );
  }
}
