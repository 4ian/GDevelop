// @flow
import * as React from 'react';
import OnboardingContext from './OnboardingContext';
type Props = {| children: React.Node |};

const OnboardingProvider = (props: Props) => {
  return (
    <OnboardingContext.Provider
      value={{
        flow: null,
        currentStep: null,
      }}
    >
      {props.children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
