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
  mapProjectData?: {
    [key: string]: 'lastProjectObjectName',
  },
|};

export type OnboardingState = {|
  flow: string | null,
  currentStep: OnboardingFlowStep | null,
  setProject: (?gdProject) => void,
|};

export const initialOnboardingState: OnboardingState = {
  flow: null,
  currentStep: null,
  setProject: () => {},
};

const OnboardingContext = React.createContext<OnboardingState>(
  initialOnboardingState
);

export default OnboardingContext;
