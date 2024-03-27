// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../PaperDecorator';
import SearchBar from '../../UI/SearchBar';
import { useFilters } from '../../UI/Search/FiltersChooser';
import { ColumnStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';

export default {
  title: 'UI Building Blocks/SearchBar',
  component: SearchBar,
  decorators: [paperDecorator],
};

const Vanilla = () => {
  const [value, setValue] = React.useState<string>('');
  return (
    <>
      <Text>Value in state is: "{value}".</Text>
      <SearchBar
        value={value}
        onChange={setValue}
        onRequestSearch={action('request search')}
      />
    </>
  );
};

const WithPlaceholder = () => {
  const [value, setValue] = React.useState<string>('');
  return (
    <>
      <Text>Value in state is: "{value}".</Text>
      <SearchBar
        value={value}
        onChange={setValue}
        onRequestSearch={action('request search')}
        placeholder="Search with placeholder"
      />
    </>
  );
};

const Disabled = () => {
  const [value, setValue] = React.useState<string>(
    'something typed in disabled field'
  );
  return (
    <>
      <Text>Value in state is: "{value}".</Text>
      <SearchBar
        value={value}
        onChange={setValue}
        onRequestSearch={action('request search')}
        disabled
      />
    </>
  );
};

const Integrated = () => {
  const [value, setValue] = React.useState<string>('');
  return (
    <>
      <Text>Value in state is: "{value}".</Text>
      <SearchBar
        value={value}
        onChange={setValue}
        onRequestSearch={action('request search')}
        aspect="integrated-search-bar"
        placeholder="Search integrated"
      />
    </>
  );
};

const WithHelpIcon = () => {
  const [value, setValue] = React.useState<string>('');
  return (
    <>
      <Text>Value in state is: "{value}".</Text>
      <SearchBar
        value={value}
        onChange={setValue}
        onRequestSearch={action('request search')}
        helpPagePath="https://gdevelop.io"
        placeholder="Search with help icon"
      />
    </>
  );
};

const WithMenu = () => {
  const [value, setValue] = React.useState<string>('');
  return (
    <>
      <Text>Value in state is: "{value}".</Text>
      <SearchBar
        value={value}
        onChange={setValue}
        onRequestSearch={action('request search')}
        placeholder="Search with menu"
        buildMenuTemplate={() => [
          {
            type: 'checkbox',
            label: 'Tag 1',
            checked: false,
            click: action('Clicked Tag 1'),
          },
          {
            type: 'checkbox',
            label: 'Tag 2 (checked)',
            checked: true,
            click: action('Clicked Tag 2 (checked)'),
          },
          {
            type: 'checkbox',
            label: 'Tag 3',
            checked: false,
            click: action('Clicked Tag 3'),
          },
        ]}
      />
    </>
  );
};

const WithTags = () => {
  const [value, setValue] = React.useState<string>('');
  const filtersState = useFilters();
  return (
    <>
      <Text>Value in state is: "{value}".</Text>
      <SearchBar
        value={value}
        onChange={setValue}
        onRequestSearch={action('request search')}
        placeholder="Search with tags"
        tagsHandler={{
          add: filtersState.addFilter,
          remove: filtersState.removeFilter,
          chosenTags: filtersState.chosenFilters,
        }}
        tags={['Platformer', 'RPG', 'Beat them all', 'Top down']}
      />
    </>
  );
};

const WithTagsAndHelp = () => {
  const [value, setValue] = React.useState<string>('');
  const filtersState = useFilters();
  return (
    <>
      <Text>Value in state is: "{value}".</Text>
      <SearchBar
        value={value}
        onChange={setValue}
        onRequestSearch={action('request search')}
        placeholder="Search with tags and help"
        tagsHandler={{
          add: filtersState.addFilter,
          remove: filtersState.removeFilter,
          chosenTags: filtersState.chosenFilters,
        }}
        tags={['Platformer', 'RPG', 'Beat them all', 'Top down']}
        helpPagePath="https://gdevelop.io"
      />
    </>
  );
};

export const AllOptions = () => (
  <ColumnStackLayout>
    <Vanilla />
    <WithPlaceholder />
    <Disabled />
    <Integrated />
    <WithHelpIcon />
    <WithMenu />
    <WithTags />
    <WithTagsAndHelp />
  </ColumnStackLayout>
);
