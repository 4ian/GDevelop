// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import paperDecorator from '../PaperDecorator';
import PropertiesEditor from '../../PropertiesEditor';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'PropertiesEditor',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <PropertiesEditor
    schema={[
      {
        name: 'Object name',
        valueType: 'string',
        disabled: () => 'always',
        getValue: instance => 'Disabled field',
        setValue: (instance, newValue) => {},
      },
      {
        name: 'Some field with edit buttons',
        valueType: 'string',
        getValue: instance => 'Click to test',
        setValue: (instance, newValue) => {},
        onEditButtonBuildMenuTemplate: () => [
          {
            label: 'Option 1',
            click: action('Option 1'),
          },
          {
            label: 'Option 2',
            click: action('Option 2'),
          },
        ],
      },
      {
        name: 'Position',
        type: 'row',
        children: [
          {
            name: 'X',
            valueType: 'number',
            getValue: instance => 10,
            setValue: (instance, newValue) => {},
          },
          {
            name: 'Y',
            valueType: 'number',
            getValue: instance => 20.1234,
            setValue: (instance, newValue) => {},
          },
        ],
      },
      {
        name: 'Angle',
        valueType: 'number',
        getValue: instance => 90.123456,
        setValue: (instance, newValue) => {},
      },
      {
        name: 'Checked checkbox',
        valueType: 'boolean',
        getValue: instance => true,
        setValue: (instance, newValue) => {},
      },
      {
        name: 'Unchecked checkbox',
        valueType: 'boolean',
        getValue: instance => false,
        setValue: (instance, newValue) => {},
      },
    ]}
    instances={[
      {
        name: 'instance1',
      },
      {
        name: 'instance2',
      },
    ]}
  />
);

export { Default as ______________Default };
Default.storyName = 'default';

export const WithDescriptionsAndExtraDescriptions = (): React.Node => (
  <PropertiesEditor
    schema={[
      {
        name: 'Object name',
        valueType: 'string',
        disabled: () => 'always',
        getValue: instance => 'Disabled field',
        setValue: (instance, newValue) => {},
        getDescription: () =>
          'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
      },
      {
        name: 'Some field with edit buttons',
        valueType: 'string',
        getValue: instance => 'Click to test',
        setValue: (instance, newValue) => {},
        onEditButtonBuildMenuTemplate: () => [
          {
            label: 'Option 1',
            click: action('Option 1'),
          },
          {
            label: 'Option 2',
            click: action('Option 2'),
          },
        ],
      },
      {
        name: 'Position',
        type: 'row',
        children: [
          {
            name: 'X',
            valueType: 'number',
            getValue: instance => 10,
            setValue: (instance, newValue) => {},
            getDescription: () =>
              'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
          },
          {
            name: 'Y',
            valueType: 'number',
            getValue: instance => 20.1234,
            setValue: (instance, newValue) => {},
            getDescription: () =>
              'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
          },
        ],
      },
      {
        name: 'Angle',
        valueType: 'number',
        getValue: instance => 90.123456,
        setValue: (instance, newValue) => {},
        getDescription: () =>
          'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
      },
      {
        name: 'Checked checkbox',
        valueType: 'boolean',
        getValue: instance => true,
        setValue: (instance, newValue) => {},
        getDescription: () =>
          'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
      },
      {
        name: 'Unchecked checkbox',
        valueType: 'boolean',
        getValue: instance => false,
        setValue: (instance, newValue) => {},
        getDescription: () =>
          'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
      },
    ]}
    instances={[
      {
        name: 'instance1',
      },
      {
        name: 'instance2',
      },
    ]}
  />
);
WithDescriptionsAndExtraDescriptions.storyName =
  'with descriptions and extra descriptions';
