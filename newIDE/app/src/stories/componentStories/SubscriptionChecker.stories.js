// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';
import SubscriptionChecker, {
  type SubscriptionCheckerInterface,
} from '../../Profile/Subscription/SubscriptionChecker';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { fakeNotAuthenticatedAuthenticatedUser } from '../../fixtures/GDevelopServicesTestData';
import RaisedButton from '../../UI/RaisedButton';
import subscriptionSuggestionDecorator from '../SubscriptionSuggestionDecorator';

export default {
  title: 'Subscription/SubscriptionChecker',
  component: SubscriptionChecker,
  decorators: [subscriptionSuggestionDecorator, paperDecorator, muiDecorator],
};

export const TryMode = () => {
  const checkerRef = React.useRef<?SubscriptionCheckerInterface>(null);

  const onClick = () => {
    if (checkerRef.current) {
      checkerRef.current.checkUserHasSubscription();
    }
  };
  return (
    <AuthenticatedUserContext.Provider
      value={fakeNotAuthenticatedAuthenticatedUser}
    >
      <RaisedButton label="Click here" onClick={onClick} primary />
      <SubscriptionChecker
        ref={checkerRef}
        title="Preview over wifi"
        id="Preview over wifi"
        onChangeSubscription={action('change subscription')}
        mode="try"
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const MandatoryMode = () => {
  const checkerRef = React.useRef(null);

  const onClick = () => {
    if (checkerRef.current) {
      checkerRef.current.checkUserHasSubscription();
    }
  };
  return (
    <AuthenticatedUserContext.Provider
      value={fakeNotAuthenticatedAuthenticatedUser}
    >
      <RaisedButton label="Click here" onClick={onClick} primary />
      <SubscriptionChecker
        ref={checkerRef}
        title="Preview over wifi"
        id="Preview over wifi"
        onChangeSubscription={action('change subscription')}
        mode="mandatory"
      />
    </AuthenticatedUserContext.Provider>
  );
};
