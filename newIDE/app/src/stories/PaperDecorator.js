// @flow
import React from 'react';
import Paper from '@material-ui/core/Paper';
import { type StoryDecorator } from '@storybook/react';

const style = {
  padding: 10,
};

const paperDecorator: StoryDecorator = (Story, context) => (
  <Paper style={style}><Story /></Paper>
);

export default paperDecorator;
