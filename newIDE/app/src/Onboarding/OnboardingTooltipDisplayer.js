// @flow
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import { ColumnStackLayout } from '../UI/Layout';
import { getDisplayZIndexForHighlighter } from './HTMLUtils';
import { type OnboardingTooltip } from './OnboardingContext';
import useIsElementVisibleInScroll from '../Utils/UseIsElementVisibleInScroll';
import { makeStyles, Typography } from '@material-ui/core';

type Props = {|
  anchorElement: HTMLElement,
  tooltip: OnboardingTooltip,
|};

const styles = {
  paper: {
    backgroundColor: 'white',
    color: 'black',
    padding: '8px 16px',
  },
};

const useClasses = makeStyles({
  popper: {
    position: 'relative',
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
      '&::before': {
        transformOrigin: '0 100%',
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
      '&::before': {
        transformOrigin: '100% 0',
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.71em',
      height: '1em',
      width: '0.71em',
      marginTop: 4,
      marginBottom: 4,
      '&::before': {
        transformOrigin: '100% 100%',
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.71em',
      height: '1em',
      width: '0.71em',
      marginTop: 4,
      marginBottom: 4,
      '&::before': {
        transformOrigin: '0 0',
      },
    },
  },
  arrow: {
    overflow: 'hidden',
    position: 'absolute',
    width: '1em',
    height: '0.71em',
    /* = width / sqrt(2) = (length of the hypotenuse) */
    boxSizing: 'border-box',
    color: 'white',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: '100%',
      height: '100%',
      backgroundColor: 'currentColor',
      transform: 'rotate(45deg)',
    },
  },
});

function OnboardingTooltipDisplayer({ anchorElement, tooltip }: Props) {
  const [show, setShow] = React.useState<boolean>(false);

  const updateVisibility = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      setShow(entries[0].isIntersecting);
    },
    []
  );

  useIsElementVisibleInScroll(anchorElement, updateVisibility);

  const arrowRef = React.useRef<?HTMLSpanElement>(null);
  const classes = useClasses();
  return (
    <>
      <Popper
        id="onboarding-tooltip-displayer"
        open={show}
        className={classes.popper}
        anchorEl={anchorElement}
        transition
        placement={tooltip.placement}
        popperOptions={{
          modifiers: {
            name: 'arrow',
            enabled: true,
            options: { element: arrowRef },
          },
        }}
        style={{
          zIndex: getDisplayZIndexForHighlighter(anchorElement),
        }}
      >
        {({ TransitionProps }) => (
          <>
            <Fade {...TransitionProps} timeout={350}>
              <Paper style={styles.paper} elevation={4}>
                <ColumnStackLayout noMargin>
                  <Typography>{tooltip.content}</Typography>
                </ColumnStackLayout>
              </Paper>
            </Fade>
            <span id="arrow-popper" className={classes.arrow} ref={arrowRef} />
          </>
        )}
      </Popper>
    </>
  );
}

export default OnboardingTooltipDisplayer;
