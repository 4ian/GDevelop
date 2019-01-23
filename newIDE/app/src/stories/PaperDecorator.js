// @flow
import React from 'react';
import Paper from 'material-ui/Paper';
import { type StoryDecorator } from '@storybook/react';

const style = {
  padding: 10,
};

const paperDecorator: StoryDecorator = (story, context) => (
  <Paper style={style}>{story(context)}</Paper>
);

export default paperDecorator;
