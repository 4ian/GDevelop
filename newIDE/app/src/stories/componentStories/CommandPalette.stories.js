// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

import CommandPalette from '../../CommandPalette/CommandPalette';
import AutocompletePicker from '../../CommandPalette/CommandPalette/AutocompletePicker';
import {
  type NamedCommand,
  type GoToWikiCommand,
  type CommandOption,
} from '../../CommandPalette/CommandManager';
import paperDecorator from '../PaperDecorator';

export default {
  title: 'CommandPalette',
  component: CommandPalette,
  decorators: [paperDecorator],
};

export const Default = () => (
  <I18n>
    {({ i18n }) => (
      <AutocompletePicker
        i18n={i18n}
        items={
          ([
            {
              name: 'OPEN_PROJECT',
              handler: () => {},
            },
            {
              name: 'OPEN_PROJECT_PROPERTIES',
              handler: () => {},
            },
            {
              name: 'EDIT_OBJECT',
              handler: () => {},
            },
            {
              hit: {
                content: 'Everything is an object in GDevelop',
                hierarchy: { lvl0: 'Scene editor', lvl1: 'Objects' },
                objectID: 'everyting-is-an-object',
                url: 'https://wiki.gdevelop.io/gdevelop5/objects',
              },
              handler: action('Open wiki command'),
            },
          ]: Array<NamedCommand | GoToWikiCommand>)
        }
        onClose={() => {}}
        onSelect={action('Open command')}
        placeholder="Start typing a command..."
      />
    )}
  </I18n>
);

export const SelectingOption = () => (
  <I18n>
    {({ i18n }) => (
      <AutocompletePicker
        i18n={i18n}
        items={
          ([
            {
              text: 'Player',
              handler: () => {},
              iconSrc: 'res/unknown32.png',
            },
            {
              text: 'Platform',
              handler: () => {},
              iconSrc: 'res/unknown32.png',
            },
            {
              text: 'Enemy',
              handler: () => {},
              iconSrc: 'res/unknown32.png',
            },
          ]: Array<CommandOption>)
        }
        onClose={() => {}}
        onSelect={action('Select command option')}
        placeholder="Edit object..."
      />
    )}
  </I18n>
);
