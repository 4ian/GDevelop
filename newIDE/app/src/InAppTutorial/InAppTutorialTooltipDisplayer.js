// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';

import { Column, Spacer } from '../UI/Grid';
import { getDisplayZIndexForHighlighter } from './HTMLUtils';
import { type InAppTutorialFormattedTooltip } from './InAppTutorialContext';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import useIsElementVisibleInScroll from '../Utils/UseIsElementVisibleInScroll';
import { MarkdownText } from '../UI/MarkdownText';
import RaisedButton from '../UI/RaisedButton';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
import Cross from '../UI/CustomSvgIcons/Cross';
import { LineStackLayout } from '../UI/Layout';
import ChevronArrowTop from '../UI/CustomSvgIcons/ChevronArrowTop';
import { textEllipsisStyle } from '../UI/TextEllipsis';

const themeColors = {
  grey10: '#EBEBED',
  grey20: '#D9D9DE',
  grey30: '#C5C5C9',
  grey40: '#A6A6AB',
  grey50: '#7F7F85',
  grey70: '#494952',
  grey100: '#1D1D26',
};

const styles = {
  paper: {
    padding: '10px 12px', // vertical padding is added by markdown text paragraphs
    minWidth: 180,
  },
  title: {
    color: themeColors.grey100,
  },
  description: {
    color: themeColors.grey70,
  },
  divider: {
    backgroundColor: themeColors.grey20,
    height: 1,
  },
  descriptionImage: {
    margin: 'auto',
  },
  iconButtonContainer: {
    cursor: 'pointer',
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
  },
  iconButtonContainerWithPadding: { paddingRight: 5 },
  headerText: { fontSize: 12 },
  headerContentPreview: { color: themeColors.grey100 },
};

const useClasses = makeStyles({
  popper: {
    '&[x-placement*="bottom"] #arrow-popper': {
      top: 0,
      left: 0,
      marginTop: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
      '&::before': {
        transformOrigin: '0 100%',
      },
    },
    '&[x-placement*="top"] #arrow-popper': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
      '&::before': {
        transformOrigin: '100% 0',
      },
    },
    '&[x-placement*="right"] #arrow-popper': {
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
    '&[x-placement*="left"] #arrow-popper': {
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

type TooltipBodyProps = {|
  tooltip: InAppTutorialFormattedTooltip,
  buttonLabel?: string,
  goToNextStep: () => void,
|};

const TooltipBody = ({
  tooltip,
  buttonLabel,
  goToNextStep,
}: TooltipBodyProps) => {
  return (
    <>
      {tooltip.title && (
        <Typography style={styles.title} variant="subtitle" noMargin>
          <MarkdownText source={tooltip.title} allowParagraphs />
        </Typography>
      )}
      {tooltip.title && tooltip.description && <span style={styles.divider} />}
      {tooltip.description && (
        <Typography style={styles.description} noMargin>
          <MarkdownText source={tooltip.description} allowParagraphs />
        </Typography>
      )}
      {tooltip.image && (
        <img
          src={tooltip.image.dataUrl}
          alt="Tutorial helper"
          style={{
            ...styles.descriptionImage,
            width: tooltip.image.width || '100%',
          }}
        />
      )}
      {buttonLabel && (
        <>
          {tooltip.image ? <Spacer /> : null}
          <RaisedButton primary label={buttonLabel} onClick={goToNextStep} />
        </>
      )}
    </>
  );
};

type TooltipHeaderProps = {|
  paletteType: 'dark' | 'light',
  progress: number,
  showFoldButton: boolean,
  showQuitButton: boolean,
  onClickFoldButton: () => void,
  tooltipContent?: string,
  endTutorial: () => void,
|};

const TooltipHeader = ({
  paletteType,
  progress,
  showFoldButton,
  showQuitButton,
  onClickFoldButton,
  tooltipContent,
  endTutorial,
}: TooltipHeaderProps) => {
  const progressColor =
    paletteType === 'light' ? themeColors.grey40 : themeColors.grey30;
  const iconButtonContainerColors =
    paletteType === 'light'
      ? {
          color: themeColors.grey50,
          backgroundColor: themeColors.grey20,
        }
      : {
          color: themeColors.grey40,
          backgroundColor: themeColors.grey10,
        };
  return (
    <LineStackLayout
      alignItems="center"
      noMargin
      justifyContent={tooltipContent ? undefined : 'space-between'}
    >
      <Typography style={{ ...styles.headerText, color: progressColor }}>
        {progress}%
      </Typography>
      <LineStackLayout noMargin alignItems="center" overflow="hidden">
        {tooltipContent || !showQuitButton ? null : (
          // We hide the quit button:
          // - When the tooltip is folded, the tooltip content should not be null;
          // - When requested.
          <ButtonBase disableRipple onClick={endTutorial}>
            <div
              style={{
                ...styles.iconButtonContainer,
                ...styles.iconButtonContainerWithPadding,
                ...iconButtonContainerColors,
              }}
            >
              <Cross />
              <Typography style={styles.headerText}>
                <Trans>Quit tutorial</Trans>
              </Typography>
            </div>
          </ButtonBase>
        )}
        {tooltipContent && (
          <Typography
            variant="body2"
            style={{ ...styles.headerContentPreview, ...textEllipsisStyle }}
          >
            {tooltipContent}
          </Typography>
        )}
        {showFoldButton ? (
          <ButtonBase disableRipple onClick={onClickFoldButton}>
            <span
              style={{
                ...styles.iconButtonContainer,
                ...iconButtonContainerColors,
              }}
            >
              {tooltipContent ? <ChevronArrowTop /> : <ChevronArrowBottom />}
            </span>
          </ButtonBase>
        ) : null}
      </LineStackLayout>
    </LineStackLayout>
  );
};

type Props = {|
  anchorElement: HTMLElement,
  tooltip: InAppTutorialFormattedTooltip,
  showQuitButton: boolean,
  buttonLabel?: string,
  progress: number,
  endTutorial: () => void,
  goToNextStep: () => void,
|};

const InAppTutorialTooltipDisplayer = ({
  anchorElement,
  tooltip,
  showQuitButton,
  buttonLabel,
  progress,
  endTutorial,
  goToNextStep,
}: Props) => {
  const {
    palette: { type: paletteType },
  } = React.useContext(GDevelopThemeContext);
  const [show, setShow] = React.useState<boolean>(false);
  const [folded, setFolded] = React.useState<boolean>(false);
  const updateVisibility = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      setShow(entries[0].isIntersecting);
    },
    []
  );
  const tooltipConcatenated = (
    (tooltip.title || '') + (tooltip.description || '')
  ).replace(/\(.+\)/g, ''); // Remove content between parenthesis as they should contain dynamic content (to prevent unfolding the tooltip for nothing).

  // If tooltip changes, we unfold the tooltip.
  React.useEffect(
    () => {
      setFolded(false);
    },
    [tooltipConcatenated]
  );

  useIsElementVisibleInScroll(anchorElement, updateVisibility);

  const arrowRef = React.useRef<?HTMLSpanElement>(null);
  const classes = useClasses();
  const placement = tooltip.placement || 'bottom';
  const backgroundColor =
    paletteType === 'light'
      ? '#EBEBED' // Grey10
      : '#FAFAFA'; // Grey00

  return (
    <>
      <Popper
        id="in-app-tutorial-tooltip-displayer"
        open={show}
        className={classes.popper}
        anchorEl={anchorElement}
        transition
        placement={placement}
        popperOptions={{
          modifiers: {
            arrow: { enabled: true, element: '#arrow-popper' },
            offset: {
              enabled: true,
              offset: '0,10',
            },
          },
        }}
        style={{
          zIndex: getDisplayZIndexForHighlighter(anchorElement),
          maxWidth: 300,
        }}
      >
        {({ TransitionProps }) => (
          <>
            <Fade {...TransitionProps} timeout={{ enter: 350, exit: 0 }}>
              <Paper style={{ ...styles.paper, backgroundColor }} elevation={4}>
                <Column noMargin>
                  <TooltipHeader
                    paletteType={paletteType}
                    // Display the hide button when standalone only
                    showFoldButton={!!tooltip.standalone}
                    showQuitButton={showQuitButton}
                    progress={progress}
                    tooltipContent={
                      folded ? tooltip.title || tooltip.description : undefined
                    }
                    onClickFoldButton={() => setFolded(!folded)}
                    endTutorial={endTutorial}
                  />
                  {!folded && (
                    <TooltipBody
                      tooltip={tooltip}
                      buttonLabel={buttonLabel}
                      goToNextStep={goToNextStep}
                    />
                  )}
                </Column>
                <span
                  id="arrow-popper"
                  className={classes.arrow}
                  ref={arrowRef}
                  style={{ color: backgroundColor }}
                />
              </Paper>
            </Fade>
          </>
        )}
      </Popper>
    </>
  );
};

export default InAppTutorialTooltipDisplayer;
