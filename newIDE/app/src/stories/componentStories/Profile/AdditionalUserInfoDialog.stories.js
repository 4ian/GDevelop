// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import AdditionalUserInfoDialog from '../../../Profile/AdditionalUserInfoDialog';
import { indieUserProfile } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Profile/AdditionalUserInfoDialog',
  component: AdditionalUserInfoDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AdditionalUserInfoDialog
    profile={indieUserProfile}
    onClose={() => {}}
    onSaveAdditionalUserInfo={async () => {}}
    updateInProgress={false}
  />
);

export const WithSomeInformation = () => (
  <AdditionalUserInfoDialog
    profile={{
      ...indieUserProfile,
      gdevelopUsage: 'work-marketing',
      teamOrCompanySize: '10-19',
      companyName: 'My Super Company Inc',
    }}
    onClose={() => {}}
    onSaveAdditionalUserInfo={async () => {}}
    updateInProgress={false}
  />
);

export const Loading = () => (
  <AdditionalUserInfoDialog
    profile={indieUserProfile}
    onClose={() => {}}
    onSaveAdditionalUserInfo={async () => {}}
    updateInProgress
  />
);
