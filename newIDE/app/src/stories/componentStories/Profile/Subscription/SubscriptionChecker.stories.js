// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import SubscriptionChecker, {
  type SubscriptionCheckerInterface,
} from '../../../../Profile/Subscription/SubscriptionChecker';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
  fakeGoldAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import RaisedButton from '../../../../UI/RaisedButton';

export default {
  title: 'Subscription/SubscriptionChecker',
  component: SubscriptionChecker,
  decorators: [paperDecorator],
};

export const NotAuthenticatedTryMode = (): React.Node => {
  const checkerRef = React.useRef<?SubscriptionCheckerInterface>(null);

  const onClick = () => {
    if (checkerRef.current) {
      checkerRef.current.checkUserHasSubscription();
    }
  };
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <RaisedButton label="Click here" onClick={onClick} primary />
      <SubscriptionChecker
        ref={checkerRef}
        title="Preview over wifi"
        id="Preview over wifi"
        onChangeSubscription={action('change subscription')}
        mode="try"
        placementId="gdevelop-branding"
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const NotAuthenticatedMandatoryMode = (): React.Node => {
  const checkerRef = React.useRef(null);

  const onClick = () => {
    if (checkerRef.current) {
      checkerRef.current.checkUserHasSubscription();
    }
  };
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <RaisedButton label="Click here" onClick={onClick} primary />
      <SubscriptionChecker
        // $FlowFixMe[incompatible-type]
        ref={checkerRef}
        title="Preview over wifi"
        id="Preview over wifi"
        onChangeSubscription={action('change subscription')}
        mode="mandatory"
        placementId="gdevelop-branding"
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const UserWithNoSubscription = (): React.Node => {
  const checkerRef = React.useRef(null);

  const onClick = () => {
    if (checkerRef.current) {
      checkerRef.current.checkUserHasSubscription();
    }
  };
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscription}
    >
      <RaisedButton label="Click here" onClick={onClick} primary />
      <SubscriptionChecker
        // $FlowFixMe[incompatible-type]
        ref={checkerRef}
        title="Preview over wifi"
        id="Preview over wifi"
        onChangeSubscription={action('change subscription')}
        mode="mandatory"
        placementId="gdevelop-branding"
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const UserWithGoldSubscription = (): React.Node => {
  const checkerRef = React.useRef(null);

  const onClick = () => {
    if (checkerRef.current) {
      checkerRef.current.checkUserHasSubscription();
    }
  };
  return (
    <AuthenticatedUserContext.Provider value={fakeGoldAuthenticatedUser}>
      <RaisedButton label="Click here" onClick={onClick} primary />
      <SubscriptionChecker
        // $FlowFixMe[incompatible-type]
        ref={checkerRef}
        title="Preview over wifi"
        id="Preview over wifi"
        onChangeSubscription={action('change subscription')}
        mode="mandatory"
        placementId="gdevelop-branding"
      />
    </AuthenticatedUserContext.Provider>
  );
};
