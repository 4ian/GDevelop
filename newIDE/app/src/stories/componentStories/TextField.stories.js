// @flow
import * as React from 'react';

import muiDecorator from '../ThemeDecorator';

import TextField from '../../UI/TextField';
import IconButton from '../../UI/IconButton';
import Copy from '../../UI/CustomSvgIcons/Copy';
import { ColumnStackLayout } from '../../UI/Layout';
import paperDecorator from '../PaperDecorator';

export default {
  title: 'UI Building Blocks/TextField',
  component: TextField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => {
  const [value, setValue] = React.useState('Hello World');

  return (
    <ColumnStackLayout>
      <TextField
        value={value}
        onChange={(_, text) => setValue(text)}
        floatingLabelText="Text field label"
      />
      <TextField
        margin="none"
        value={value}
        onChange={(_, text) => setValue(text)}
        floatingLabelText="Text field label"
      />
      <p>State value is {value}</p>
    </ColumnStackLayout>
  );
};

export const EndAdornment = () => {
  const [value, setValue] = React.useState('Hello World');

  return (
    <ColumnStackLayout>
      <TextField
        value={value}
        onChange={(_, text) => setValue(text)}
        floatingLabelText="Text field label"
        endAdornment={
          <IconButton edge="end">
            <Copy />
          </IconButton>
        }
      />
      <TextField
        margin="none"
        value={value}
        onChange={(_, text) => setValue(text)}
        floatingLabelText="Text field label (with no margin)"
        endAdornment={
          <IconButton edge="end">
            <Copy />
          </IconButton>
        }
      />
      <p>State value is {value}</p>
    </ColumnStackLayout>
  );
};

export const WithoutFloatingTextAndEndAdornment = () => {
  const [value, setValue] = React.useState('Hello World');

  return (
    <ColumnStackLayout>
      <TextField
        value={value}
        onChange={(_, text) => setValue(text)}
        endAdornment={
          <IconButton edge="end" size="small">
            <Copy />
          </IconButton>
        }
      />
      <TextField
        margin="none"
        value={value}
        onChange={(_, text) => setValue(text)}
        endAdornment={
          <IconButton edge="end" size="small">
            <Copy />
          </IconButton>
        }
      />
      <p>State value is {value}</p>
    </ColumnStackLayout>
  );
};

export const Required = () => {
  const [value, setValue] = React.useState('Hello World');

  return (
    <ColumnStackLayout>
      <TextField
        value={value}
        onChange={(_, text) => setValue(text)}
        required
        floatingLabelText="Text field label"
      />
      <TextField
        margin="none"
        value={value}
        onChange={(_, text) => setValue(text)}
        required
        floatingLabelText="Text field label"
      />
      <p>State value is {value}</p>
    </ColumnStackLayout>
  );
};

export const WithMarkdownText = () => {
  const [value, setValue] = React.useState('Hello World');

  return (
    <ColumnStackLayout>
      <TextField
        value={value}
        onChange={(_, text) => setValue(text)}
        helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
        floatingLabelText="Text field label"
      />
      <TextField
        margin="none"
        value={value}
        onChange={(_, text) => setValue(text)}
        helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
        floatingLabelText="Text field label"
      />
      <p>State value is {value}</p>
    </ColumnStackLayout>
  );
};
