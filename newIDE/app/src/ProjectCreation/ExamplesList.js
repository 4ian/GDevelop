// @flow
import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Column, Line } from '../UI/Grid';
import { List, ListItem } from 'material-ui/List';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import ExamplesSearchbar from './ExamplesSearchbar';
import ExamplesExtensionsUsage from './ExamplesExtensionsUsage';
import Window from '../Utils/Window';
import { fuzzyOrEmptyFilter } from '../Utils/FuzzyOrEmptyFilter';

type ExtensionUsage = Array<{
  fullName: string,
  name: string,
}>;

type Props = {|
  exampleNames: Array<string>,
  onCreateFromExample: string => void,
|};

type State = {|
  searchText: string,
  chosenExtensionName: string,
|};

const formatExampleName = (name: string) => {
  if (!name.length) return '';

  return name[0].toUpperCase() + name.substr(1).replace(/-/g, ' ');
};

const isUsingExtension = (
  extensionUsage: ?ExtensionUsage,
  extensionName: string
) => {
  return (
    !extensionName ||
    (extensionUsage &&
      !!extensionUsage.find(usage => usage.name === extensionName))
  );
};

export default class LocalExamples extends React.Component<Props, State> {
  state = {
    searchText: '',
    chosenExtensionName: '',
  };

  changeSearchText = (searchText: string) => {
    this.setState({
      searchText,
      chosenExtensionName: '',
    });
  };

  chooseExtensionName = (chosenExtensionName: string) => {
    this.setState({
      searchText: '',
      chosenExtensionName,
    });
  };

  _submitExample() {
    const body = `Hi!
  
  I'd like to submit a new example to be added to GDevelop.
  Here is the link to download it: **INSERT the link to your game here, or add it as an attachment**.
  
  I confirm that any assets can be used freely by anybody, including for commercial usage.
  `;
    Window.openExternalURL(
      `https://github.com/4ian/GD/issues/new?body=${encodeURIComponent(
        body
      )}&title=New%20example`
    );
  }

  render() {
    const { searchText, chosenExtensionName } = this.state;
    return (
      <Column noMargin>
        <Line noMargin>
          <Column expand>
            <ExamplesSearchbar
              value={searchText}
              onChange={this.changeSearchText}
              chosenExtensionName={chosenExtensionName}
              onExtensionNameChosen={this.chooseExtensionName}
            />
          </Column>
        </Line>
        <Line noMargin>
          <Column expand noMargin>
            <List>
              {this.props.exampleNames &&
                this.props.exampleNames.map(exampleName => {
                  const exampleFullName = formatExampleName(exampleName);
                  const extensionsUsage = ExamplesExtensionsUsage[exampleName];
                  if (
                    (searchText &&
                      !fuzzyOrEmptyFilter(searchText, exampleFullName)) ||
                    !isUsingExtension(extensionsUsage, chosenExtensionName)
                  ) {
                    return null;
                  }

                  return (
                    <ListItem
                      key={exampleName}
                      primaryText={exampleFullName}
                      onClick={() =>
                        this.props.onCreateFromExample(exampleName)}
                    />
                  );
                })}
              {!this.props.exampleNames && <PlaceholderLoader />}
            </List>
            <Column expand>
              <p>Want to contribute to the examples?</p>
              <Line alignItems="center" justifyContent="center">
                <RaisedButton
                  label="Submit your example"
                  onClick={this._submitExample}
                />
              </Line>
            </Column>
          </Column>
        </Line>
      </Column>
    );
  }
}
