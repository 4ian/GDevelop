// @flow

import * as React from 'react';
import Text from './Text';
import { Line } from './Grid';
import { getDisplayZIndexForHighlighter } from '../InAppTutorial/HTMLUtils';
import { Fade, Paper, Popper, makeStyles } from '@material-ui/core';
import { CorsAwareImage } from './CorsAwareImage';
import IconButton from './IconButton';
import Cross from './CustomSvgIcons/Cross';
import { ColumnStackLayout } from './Layout';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

const styles = {
  paper: {
    padding: '8px 10px',
    minWidth: 180,
  },
};

const useClasses = makeStyles({
  popper: {
    '&[x-placement*="bottom"] #new-feature-popper-arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
      '&::before': {
        transformOrigin: '0 100%',
      },
    },
    '&[x-placement*="top"] #new-feature-popper-arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
      '&::before': {
        transformOrigin: '100% 0',
      },
    },
    '&[x-placement*="right"] #new-feature-popper-arrow': {
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
    '&[x-placement*="left"] #new-feature-popper-arrow': {
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
    /* = width / sqrt(2) = (length of the hypotenuse) */
    height: '0.71em',
    boxSizing: 'border-box',
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

type Props = {|
  title: React.Node,
  thumbnailSource?: string,
  content: React.Node,
  anchorElement: HTMLElement,
  onClose: () => void,
  placement: 'left' | 'top' | 'bottom' | 'right',
|};

const HighlightingTooltip = ({
  title,
  thumbnailSource,
  content,
  anchorElement,
  onClose,
  placement,
}: Props) => {
  const classes = useClasses();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <Popper
      id="in-app-tutorial-tooltip-displayer"
      open={true}
      className={classes.popper}
      anchorEl={anchorElement}
      transition
      placement={placement}
      popperOptions={{
        modifiers: {
          arrow: { enabled: true, element: '#new-feature-popper-arrow' },
          offset: {
            enabled: true,
            offset: '0,10',
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: document.querySelector('.main-frame'),
          },
        },
      }}
      style={{
        zIndex: getDisplayZIndexForHighlighter(anchorElement),
        maxWidth: 'min(90%, 300px)',
      }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={{ enter: 350, exit: 0 }}>
          <Paper
            style={{
              ...styles.paper,
              backgroundColor: gdevelopTheme.paper.backgroundColor.light,
            }}
            elevation={4}
          >
            <ColumnStackLayout noMargin>
              <Line noMargin justifyContent="space-between" alignItems="center">
                <Text noMargin size="sub-title">
                  {title}
                </Text>
                <IconButton size="small" onClick={onClose}>
                  <Cross fontSize="small" />
                </IconButton>
              </Line>
              {thumbnailSource && (
                <CorsAwareImage
                  src={thumbnailSource}
                  alt="hello"
                  style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
                />
              )}
              {content}
            </ColumnStackLayout>
            <span
              id="new-feature-popper-arrow"
              className={classes.arrow}
              style={{ color: gdevelopTheme.paper.backgroundColor.light }}
            />
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default HighlightingTooltip;
