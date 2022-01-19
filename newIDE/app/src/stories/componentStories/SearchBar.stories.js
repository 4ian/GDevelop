// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';
import SearchBar from '../../UI/SearchBar';
import { useFilters } from '../../UI/Search/FiltersChooser';

export default {
  title: 'UI Building Blocks/SearchBar',
  component: SearchBar,
  decorators: [muiDecorator],
};

export const Vanilla = () => {
  const [value, setValue] = React.useState<string>('');
  return (
    <SearchBar
      value={value}
      onChange={action('change')}
      onRequestSearch={action('request search')}
    />
  );
};
export const WithMenu = () => {
  const [value, setValue] = React.useState<string>('');
  return (
    <SearchBar
      value={value}
      onChange={action('change')}
      onRequestSearch={action('request search')}
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
  );
};

export const WithTags = () => {
  const [value, setValue] = React.useState<string>('');
  const [chosenTags, setChosenTags] = React.useState<Set<string>>(new Set());
  const filtersState = useFilters();
  return (
    <SearchBar
      value={value}
      onChange={action('change')}
      onRequestSearch={action('request search')}
      tagsHandler={{
        add: filtersState.addFilter,
        remove: filtersState.removeFilter,
        chosenTags: filtersState.chosenFilters,
      }}
      tags={['Platformer', 'RPG', 'Beat them all', 'Top down']}
    />
  );
};
