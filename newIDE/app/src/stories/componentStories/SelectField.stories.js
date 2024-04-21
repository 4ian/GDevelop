// @flow
import * as React from 'react';

import SelectField from '../../UI/SelectField';
import { ColumnStackLayout } from '../../UI/Layout';
import paperDecorator from '../PaperDecorator';
import ValueStateHolder from '../ValueStateHolder';
import SelectOption from '../../UI/SelectOption';
import Text from '../../UI/Text';

export default {
  title: 'UI Building Blocks/SelectField',
  component: SelectField,
  decorators: [paperDecorator],
};

export const Default = () => (
  <ColumnStackLayout>
    <Text>Default</Text>
    <ValueStateHolder
      initialValue={'1'}
      render={(value, onChange) => (
        <SelectField
          value={value}
          onChange={(e, i, newValue: string) => onChange(newValue)}
          fullWidth
        >
          <SelectOption value="1" label="Choice 1" />
          <SelectOption value="2" label="Choice 2" />
          <SelectOption value="3" label="Choice 3" />
          <SelectOption value="4" label="Choice 4" />
        </SelectField>
      )}
    />
    <Text>Default, with (markdown) helper text and floating label</Text>
    <ValueStateHolder
      initialValue={'1'}
      render={(value, onChange) => (
        <SelectField
          value={value}
          onChange={(e, i, newValue: string) => onChange(newValue)}
          fullWidth
          helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
          floatingLabelText="This is a floating label"
        >
          <SelectOption value="1" label="Choice 1" />
          <SelectOption value="2" label="Choice 2" />
          <SelectOption value="3" label="Choice 3" />
          <SelectOption value="4" label="Choice 4" />
        </SelectField>
      )}
    />
    <Text>Default with an error text</Text>
    <ValueStateHolder
      initialValue={'1'}
      render={(value, onChange) => (
        <SelectField
          value={value}
          onChange={(e, i, newValue: string) => onChange(newValue)}
          fullWidth
          errorText="The chosen value is not compatible"
          floatingLabelText="This is a floating label"
        >
          <SelectOption value="1" label="Choice 1" />
          <SelectOption value="2" label="Choice 2" />
          <SelectOption value="3" label="Choice 3" />
          <SelectOption value="4" label="Choice 4" />
        </SelectField>
      )}
    />
    <Text>Without margin</Text>
    <ValueStateHolder
      initialValue={'1'}
      render={(value, onChange) => (
        <SelectField
          margin="none"
          value={value}
          onChange={(e, i, newValue: string) => onChange(newValue)}
          fullWidth
        >
          <SelectOption value="1" label="Choice 1" />
          <SelectOption value="2" label="Choice 2" />
          <SelectOption value="3" label="Choice 3" />
          <SelectOption value="4" label="Choice 4" />
        </SelectField>
      )}
    />
  </ColumnStackLayout>
);
