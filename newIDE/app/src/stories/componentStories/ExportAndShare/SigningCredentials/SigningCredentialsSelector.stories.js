// @flow

import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import paperDecorator from '../../../PaperDecorator';

import {
  fakeSilverAuthenticatedUser,
  mockSigningCredentials,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { IosSigningCredentialsSelector } from '../../../../ExportAndShare/SigningCredentials/IosSigningCredentialsSelector';
import { type TargetName } from '../../../../Utils/GDevelopServices/Build';
import { GDevelopBuildApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import alertDecorator from '../../../AlertDecorator';
import Toggle from '../../../../UI/Toggle';

export default {
  title: 'ExportAndShare/SigningCredentials/IosSigningCredentialsSelector',
  component: IosSigningCredentialsSelector,
  decorators: [alertDecorator, paperDecorator],
};

export const Errored = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock.onAny().reply(500);

  const [buildSigningOptions, setBuildSigningOptions] = React.useState(null);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <IosSigningCredentialsSelector
        targets={['iosAppStore']}
        authenticatedUser={fakeSilverAuthenticatedUser}
        buildSigningOptions={buildSigningOptions}
        onSelectBuildSigningOptions={setBuildSigningOptions}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithSigningCredentialsButNonePreSelected = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock
    .onGet(`${GDevelopBuildApi.baseUrl}/signing-credential`)
    .reply(200, mockSigningCredentials)
    .onAny()
    .reply(500);

  const [buildSigningOptions, setBuildSigningOptions] = React.useState(null);
  const [targets, setTargets] = React.useState<Array<TargetName>>([
    'iosAppStore',
  ]);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <Toggle
        label="Distribution?"
        onToggle={() => {
          setTargets(
            targets.includes('iosAppStore')
              ? ['iosDevelopment']
              : ['iosAppStore']
          );
        }}
        toggled={targets.includes('iosAppStore')}
        labelPosition="right"
      />
      <IosSigningCredentialsSelector
        targets={targets}
        authenticatedUser={fakeSilverAuthenticatedUser}
        buildSigningOptions={buildSigningOptions}
        onSelectBuildSigningOptions={setBuildSigningOptions}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithSigningCredentialsAndOnePreSelected = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 500 });
  axiosMock
    .onGet(`${GDevelopBuildApi.baseUrl}/signing-credential`)
    .reply(200, mockSigningCredentials)
    .onAny()
    .reply(500);

  const [buildSigningOptions, setBuildSigningOptions] = React.useState({
    certificateSerial: '12345',
    mobileProvisionUuid: '12345679',
  });
  const [targets, setTargets] = React.useState<Array<TargetName>>([
    'iosAppStore',
  ]);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <Toggle
        label="Distribution?"
        onToggle={() => {
          setTargets(
            targets.includes('iosAppStore')
              ? ['iosDevelopment']
              : ['iosAppStore']
          );
        }}
        toggled={targets.includes('iosAppStore')}
        labelPosition="right"
      />
      <IosSigningCredentialsSelector
        targets={targets}
        authenticatedUser={fakeSilverAuthenticatedUser}
        buildSigningOptions={buildSigningOptions}
        onSelectBuildSigningOptions={setBuildSigningOptions}
      />
    </AuthenticatedUserContext.Provider>
  );
};
