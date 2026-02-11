// @flow
import * as React from 'react';

import TextField from '../../UI/TextField';
import IconButton from '../../UI/IconButton';
import Copy from '../../UI/CustomSvgIcons/Copy';
import { ColumnStackLayout } from '../../UI/Layout';
import paperDecorator from '../PaperDecorator';
import CircularProgress from '../../UI/CircularProgress';

export default {
  title: 'UI Building Blocks/TextField',
  component: TextField,
  decorators: [paperDecorator],
};

const TextFieldStoryTemplate = (args: {|
  floatingLabelText?: ?string,
  endAdornment?: React.Node,
  helperMarkdownText?: string,
  required?: boolean,
|}) => {
  const [value, setValue] = React.useState('Hello world');

  return (
    <ColumnStackLayout>
      <TextField
        value={value}
        onChange={(_, text) => setValue(text)}
        floatingLabelText="Text field label"
        {...args}
      />
      <TextField
        margin="none"
        value={value}
        onChange={(_, text) => setValue(text)}
        floatingLabelText="Text field label (no margin)"
        {...args}
      />
      <p>State value is {value}</p>
    </ColumnStackLayout>
  );
};

export const Default = () => <TextFieldStoryTemplate />;

export const EndAdornment = () => (
  <TextFieldStoryTemplate
    endAdornment={
      <IconButton>
        <Copy />
      </IconButton>
    }
  />
);

export const WithLoader = () => (
  <TextFieldStoryTemplate
    endAdornment={
      <IconButton>
        <CircularProgress style={{ height: 20, width: 20 }} />
      </IconButton>
    }
  />
);

export const WithoutFloatingTextAndEndAdornment = () => (
  <TextFieldStoryTemplate
    endAdornment={
      <IconButton edge="end" size="small">
        <Copy />
      </IconButton>
    }
    floatingLabelText={null}
  />
);

export const Required = () => <TextFieldStoryTemplate required />;

export const WithMarkdownText = () => (
  <TextFieldStoryTemplate helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)." />
);
