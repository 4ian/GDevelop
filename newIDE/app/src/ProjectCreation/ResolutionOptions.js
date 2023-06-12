// @flow
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import { makeStyles, createStyles } from '@material-ui/styles';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import Text from '../UI/Text';
import { Column, Spacer } from '../UI/Grid';
import { Trans } from '@lingui/macro';
import DesktopHD from './Icons/DesktopHD';
import DesktopMobileLandscape from './Icons/DesktopMobileLandscape';
import MobilePortrait from './Icons/MobilePortrait';

const styles = {
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))',
    gridGap: '1rem',
    margin: 2,
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginLeft: 4,
    marginRight: 4,
  },
  buttonBase: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
    padding: 8,
    cursor: 'default',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  contentWrapper: {
    height: '100%',
    width: '100%',
    display: 'flex',
  },
};

export type ResolutionOption =
  | 'mobilePortrait'
  | 'desktopMobileLandscape'
  | 'desktopHD';

export const resolutionOptions: {
  [key: ResolutionOption]: {|
    label: React.Node,
    height: number,
    width: number,
    orientation: 'landscape' | 'portrait' | 'default',
    icon: React.Node,
  |},
} = {
  mobilePortrait: {
    label: <Trans>Mobile portrait</Trans>,
    width: 720,
    height: 1280,
    orientation: 'portrait',
    icon: <MobilePortrait fontSize="large" />,
  },
  desktopMobileLandscape: {
    label: <Trans>Desktop & Mobile landscape</Trans>,
    width: 1280,
    height: 720,
    orientation: 'landscape',
    icon: <DesktopMobileLandscape />,
  },
  desktopHD: {
    label: <Trans>Desktop Full HD</Trans>,
    width: 1920,
    height: 1080,
    orientation: 'default',
    icon: <DesktopHD fontSize="large" />,
  },
};

// Styles to give the impression of pressing an element.
const useStylesForButtonBase = (selected: boolean) =>
  makeStyles(theme =>
    createStyles({
      root: {
        outline: selected
          ? `2px solid ${theme.palette.secondary.dark}`
          : `1px solid ${theme.palette.text.disabled}`,
        '&:focus': {
          backgroundColor: theme.palette.action.hover,
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      },
    })
  )();

type Props = {|
  children: React.Node,
  onClick: () => void,
  selected: boolean,
  disabled?: boolean,
|};

const ResolutionOptionButton = ({
  children,
  onClick,
  selected,
  disabled,
}: Props) => {
  const classes = useStylesForButtonBase(selected);

  return (
    <ButtonBase
      onClick={onClick}
      focusRipple
      elevation={2}
      style={{
        ...styles.buttonBase,
      }}
      classes={classes}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onClick();
        }
      }}
      disabled={disabled}
    >
      <div style={styles.contentWrapper}>{children}</div>
    </ButtonBase>
  );
};

const ResolutionOptions = ({
  selectedOption,
  onClick,
  disabled,
}: {|
  selectedOption: string,
  onClick: ResolutionOption => void,
  disabled?: boolean,
|}) => {
  return (
    <div style={styles.optionsContainer}>
      {Object.keys(resolutionOptions).map((key, index) => {
        const { width, height, label, icon } = resolutionOptions[key];
        return (
          <Column expand noMargin key={key}>
            <ResolutionOptionButton
              onClick={() => onClick(key)}
              selected={selectedOption === key}
              disabled={disabled}
            >
              <Column
                expand
                alignItems="center"
                justifyContent="center"
                noMargin
              >
                {icon}
                <Spacer />
                <Column noMargin>
                  <Text size="body2" noMargin>
                    {label}
                  </Text>
                  <Text size="body-small" noMargin color="secondary">
                    {width}x{height}
                  </Text>
                </Column>
              </Column>
            </ResolutionOptionButton>
          </Column>
        );
      })}
    </div>
  );
};

export default ResolutionOptions;
