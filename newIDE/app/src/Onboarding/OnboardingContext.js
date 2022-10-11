// @flow
import * as React from 'react';

export type OnboardingFlowStep = {|
  elementToHighlightId?: string,
  id?: string,
  isTriggerFlickering?: true,
  nextStepTrigger?:
    | {| presenceOfElement: string |}
    | {| absenceOfElement: string |}
    | {| elementIsFilled: true |},
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
