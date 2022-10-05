// @flow
import * as React from 'react';

export type OnboardingFlowStep = {|
  elementToHighlightId: string,
|};

export type OnboardingState = {|
  flow: string | null,
  currentStep: OnboardingFlowStep | null,
|};

export const initialOnboardingState: OnboardingState = {
  flow: null,
  currentStep: null,
};

const OnboardingContext = React.createContext<OnboardingState>(
  initialOnboardingState
);

export default OnboardingContext;
