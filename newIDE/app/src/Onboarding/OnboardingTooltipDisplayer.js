// @flow
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import { Line } from '../UI/Grid';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { getDisplayZIndexForHighlighter } from './HTMLUtils';
import { type OnboardingTooltip } from './OnboardingContext';
import useIsElementVisibleInScroll from '../Utils/UseIsElementVisibleInScroll';

type Props = {|
  anchorElement: HTMLElement,
  tooltip: OnboardingTooltip,
|};

function OnboardingTooltipDisplayer({ anchorElement, tooltip }: Props) {
  const [show, setShow] = React.useState<boolean>(false);

  const updateVisibility = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      setShow(entries[0].isIntersecting);
    },
    []
  );

  useIsElementVisibleInScroll(anchorElement, updateVisibility);

  return (
    <Popper
      id="onboarding-tooltip-displayer"
      open={show}
      anchorEl={anchorElement}
      transition
      placement={tooltip.placement}
      style={{
        zIndex: getDisplayZIndexForHighlighter(anchorElement),
      }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper variant="outlined">
            <Line>
              <ColumnStackLayout>
                <Text noMargin>{tooltip.content}</Text>
              </ColumnStackLayout>
            </Line>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
}

export default OnboardingTooltipDisplayer;
