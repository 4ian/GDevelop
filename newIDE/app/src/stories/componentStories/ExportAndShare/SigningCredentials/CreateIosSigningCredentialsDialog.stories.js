// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import paperDecorator from '../../../PaperDecorator';

import { fakeSilverAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { CreateIosSigningCredentialsDialog } from '../../../../ExportAndShare/SigningCredentials/CreateIosSigningCredentialsDialog';
import { GDevelopBuildApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import alertDecorator from '../../../AlertDecorator';

export default {
  title: 'ExportAndShare/SigningCredentials/CreateIosSigningCredentialsDialog',
  component: CreateIosSigningCredentialsDialog,
  decorators: [alertDecorator, paperDecorator],
};

export const AlwaysError = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock.onAny().reply(500);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <CreateIosSigningCredentialsDialog
        initialTab={'apple-certificate'}
        authenticatedUser={fakeSilverAuthenticatedUser}
        signingCredentials={null}
        error={null}
        onRefreshSigningCredentials={action('refresh')}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const WorkingCertificateRequestButCertificateError = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock
    .onPost(`${GDevelopBuildApi.baseUrl}/signing-credential/action/create-csr`)
    .reply(200, {
      certificateRequestUuid: 'fake-certificate-request-uuid',
      csrPem: 'This is the content of the certificate request.',
    })
    .onAny()
    .reply(500);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <CreateIosSigningCredentialsDialog
        initialTab={'apple-certificate'}
        authenticatedUser={fakeSilverAuthenticatedUser}
        signingCredentials={null}
        error={null}
        onRefreshSigningCredentials={action('refresh')}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const WorkingCertificateRequestButCertificateUnknownKind = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock
    .onPost(`${GDevelopBuildApi.baseUrl}/signing-credential/action/create-csr`)
    .reply(200, {
      certificateRequestUuid: 'fake-certificate-request-uuid',
      csrPem: 'This is the content of the certificate request.',
    })
    .onPost(
      `${GDevelopBuildApi.baseUrl}/signing-credential/action/upload-certificate`
    )
    .reply(200, {
      certificateSerial: 'fake-certificate-serial',
      certificateKind: 'unknown',
    })
    .onAny()
    .reply(500);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <CreateIosSigningCredentialsDialog
        initialTab={'apple-certificate'}
        authenticatedUser={fakeSilverAuthenticatedUser}
        signingCredentials={null}
        error={null}
        onRefreshSigningCredentials={action('refresh')}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const AllWorking = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock
    .onPost(`${GDevelopBuildApi.baseUrl}/signing-credential/action/create-csr`)
    .reply(200, {
      certificateRequestUuid: 'fake-certificate-request-uuid',
      csrPem: 'This is the content of the certificate request.',
    })
    .onPost(
      `${GDevelopBuildApi.baseUrl}/signing-credential/action/upload-certificate`
    )
    .reply(200, {
      certificateSerial: 'fake-certificate-serial',
      certificateKind: 'distribution',
    })
    .onPost(
      `${
        GDevelopBuildApi.baseUrl
      }/signing-credential/action/create-certificate-p12`
    )
    .reply(200, 'Ok')
    .onPost(
      `${
        GDevelopBuildApi.baseUrl
      }/signing-credential/action/upload-mobile-provision`
    )
    .reply(200, {
      uuid: 'fake-mobile-provision-uuid',
      name: 'Fake provisioning profile',
      certificatesCount: 1,
    })
    .onAny()
    .reply(500);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <CreateIosSigningCredentialsDialog
        initialTab={'apple-certificate'}
        authenticatedUser={fakeSilverAuthenticatedUser}
        signingCredentials={null}
        error={null}
        onRefreshSigningCredentials={action('refresh')}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  );
};
