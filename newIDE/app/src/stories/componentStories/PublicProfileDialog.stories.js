// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../PaperDecorator';
import PublicProfileDialog from '../../Profile/PublicProfileDialog';

export default {
  title: 'Profile/PublicProfileDialog',
  component: PublicProfileDialog,
  decorators: [paperDecorator],
};

export const WithGameTemplates = () => (
  <PublicProfileDialog
    userId={'IRIhkkTTl2UHhfjrLTTH5GYwkYu1'}
    onClose={action('onClose')}
    onAssetPackOpen={action('onAssetPackOpen')}
    onGameTemplateOpen={action('onGameTemplateOpen')}
  />
);

export const WithAssetPacks = () => (
  <PublicProfileDialog
    userId={'30NWiFZ3GWNGb1Rs0PzBTHx7jsT2'}
    onClose={action('onClose')}
    onAssetPackOpen={action('onAssetPackOpen')}
    onGameTemplateOpen={action('onGameTemplateOpen')}
  />
);

export const WithGames = () => (
  <PublicProfileDialog
    userId={'9MGDlUQAh8QUilno4JPycekjRCJ3'}
    onClose={action('onClose')}
    onAssetPackOpen={action('onAssetPackOpen')}
    onGameTemplateOpen={action('onGameTemplateOpen')}
  />
);
