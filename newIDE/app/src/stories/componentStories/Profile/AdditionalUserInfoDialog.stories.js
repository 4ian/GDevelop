// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import AdditionalUserInfoDialog from '../../../Profile/AdditionalUserInfoDialog';

export default {
  title: 'Profile/AdditionalUserInfoDialog',
  component: AdditionalUserInfoDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AdditionalUserInfoDialog
    onClose={() => {}}
    onSaveAdditionalUserInfo={async () => {}}
    updateInProgress={false}
  />
);

export const Loading = () => (
  <AdditionalUserInfoDialog
    onClose={() => {}}
    onSaveAdditionalUserInfo={async () => {}}
    updateInProgress
  />
);
