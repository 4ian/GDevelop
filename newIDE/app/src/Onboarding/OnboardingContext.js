// @flow
import * as React from 'react';

export type OnboardingTooltip = {|
  placement?: 'bottom' | 'left' | 'right' | 'top',
  title?: string,
  description?: string,
|};

export type OnboardingFlowStep = {|
  elementToHighlightId?: string,
  id?: string,
  isTriggerFlickering?: true,
  nextStepTrigger?:
    | {| presenceOfElement: string |}
    | {| absenceOfElement: string |}
    | {| elementIsFilled: true |}
    | {| instanceDraggedOnScene: string |}
    | {| clickOnButton: string |},
  mapProjectData?: {
    [key: string]: 'lastProjectObjectName',
  },
  tooltip?: OnboardingTooltip,
  skippable?: true,
|};

export type OnboardingState = {|
  flow: string | null,
  currentStep: OnboardingFlowStep | null,
  setProject: (?gdProject) => void,
  goToNextStep: () => void,
|};

export const initialOnboardingState: OnboardingState = {
  flow: null,
  currentStep: null,
  setProject: () => {},
  goToNextStep: () => {},
};

const OnboardingContext = React.createContext<OnboardingState>(
  initialOnboardingState
);

export default OnboardingContext;
