// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line } from '../UI/Grid';
import { List, ListItem } from '../UI/List';
import Text from '../UI/Text';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import ExamplesSearchbar from './ExamplesSearchbar';
import ExamplesInformation from './ExamplesInformation';
import Window from '../Utils/Window';
import { fuzzyOrEmptyFilter } from '../Utils/FuzzyOrEmptyFilter';
import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');

type ExtensionUsage = Array<{
  fullName: string,
  name: string,
}>;

type ExampleInformation = {|
  description: string,
  usedExtensions: ExtensionUsage,
|};

type SearchEnhancedExampleInformation = {|
  ...ExampleInformation,
  searchableDescription: string,
|};

type Props = {|
  exampleNames: ?Array<string>,
  onCreateFromExample: string => void,
|};

type State = {|
  searchText: string,
  chosenExtensionName: string,
|};

const searchableExamplesInformation: {
  [string]: SearchEnhancedExampleInformation,
} = {};
Object.keys(ExamplesInformation).forEach(exampleName => {
  const exampleInformation = ExamplesInformation[exampleName];
  searchableExamplesInformation[exampleName] = {
    ...exampleInformation,
    searchableDescription: exampleInformation.description
      .replace(/ /g, '')
      .toLowerCase(),
  };
});

const formatExampleName = (name: string) => {
  if (!name.length) return '';

  return name[0].toUpperCase() + name.substr(1).replace(/-/g, ' ');
};

const getExampleInformation = (
  name: string
): SearchEnhancedExampleInformation => {
  return (
    searchableExamplesInformation[name] || {
      description: '',
      searchableDescription: '',
      usedExtensions: [],
    }
  );
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
      `https://github.com/4ian/GDevelop/issues/new?body=${encodeURIComponent(
        body
      )}&title=New%20example`
    );
  }

  render() {
    const { searchText, chosenExtensionName } = this.state;
    const lowercaseSearchText = searchText.toLowerCase();

    return (
      <Column noMargin>
        <Line noMargin>
          <ExamplesSearchbar
            value={searchText}
            onChange={this.changeSearchText}
            chosenExtensionName={chosenExtensionName}
            onExtensionNameChosen={this.chooseExtensionName}
          />
        </Line>
        <Line noMargin>
          <Column expand noMargin>
            <List>
              {this.props.exampleNames &&
                this.props.exampleNames.map(exampleName => {
                  const exampleFullName = formatExampleName(exampleName);
                  const exampleInformation = getExampleInformation(exampleName);
                  if (
                    (searchText &&
                      (!fuzzyOrEmptyFilter(searchText, exampleFullName) &&
                        exampleInformation.searchableDescription.indexOf(
                          lowercaseSearchText
                        ) === -1)) ||
                    !isUsingExtension(
                      exampleInformation.usedExtensions,
                      chosenExtensionName
                    )
                  ) {
                    return null;
                  }

                  return (
                    <ListItem
                      key={exampleName}
                      primaryText={exampleFullName}
                      secondaryText={exampleInformation.description}
                      secondaryTextLines={2}
                      onClick={() =>
                        this.props.onCreateFromExample(exampleName)
                      }
                    />
                  );
                })}
              {!this.props.exampleNames && <PlaceholderLoader />}
            </List>
            {!!electron && (
              <Column expand>
                <Text>
                  <Trans>Want to contribute to the examples?</Trans>
                </Text>
                <Line alignItems="center" justifyContent="center">
                  <RaisedButton
                    label={<Trans>Submit your example</Trans>}
                    onClick={this._submitExample}
                  />
                </Line>
              </Column>
            )}
          </Column>
        </Line>
      </Column>
    );
  }
}
