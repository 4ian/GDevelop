// @flow
import * as React from 'react';
import ButtonBase from '@material-ui/core/ButtonBase';
import { makeStyles, createStyles } from '@material-ui/styles';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';
import Text from '../UI/Text';
import { Column, Line, Spacer } from '../UI/Grid';
import { Trans } from '@lingui/macro';
import DesktopHD from './Icons/DesktopHD';
import DesktopMobileLandscape from './Icons/DesktopMobileLandscape';
import MobilePortrait from './Icons/MobilePortrait';
import CustomSize from './Icons/CustomSize';
import TextField from '../UI/TextField';

const styles = {
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(8rem, 1fr))',
    gridGap: '0.5rem',
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
  largeIcon: {
    transform: 'scale(1.5)',
  },
  customSizeField: {
    fontSize: 12,
    padding: 2,
  },
};

export type ResolutionOption =
  | 'mobilePortrait'
  | 'desktopMobileLandscape'
  | 'desktopHD'
  | 'custom';

export const resolutionOptions: {
  [key: ResolutionOption]: {|
    label: React.Node,
    height?: number,
    width?: number,
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
    icon: <DesktopMobileLandscape fontSize="large" />,
  },
  desktopHD: {
    label: <Trans>Desktop Full HD</Trans>,
    width: 1920,
    height: 1080,
    orientation: 'default',
    icon: <DesktopHD fontSize="large" style={styles.largeIcon} />,
  },
  custom: {
    label: <Trans>Custom size</Trans>,
    orientation: 'default',
    icon: <CustomSize fontSize="large" style={styles.largeIcon} />,
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
      elevation={2}
      style={{
        ...styles.buttonBase,
      }}
      classes={classes}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event) && !selected) {
          onClick();
        }
      }}
      disableTouchRipple={selected} // Avoid ripple effect even if already selected.
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
  customWidth,
  customHeight,
  onCustomWidthChange,
  onCustomHeightChange,
}: {|
  selectedOption: string,
  onClick: ResolutionOption => void,
  disabled?: boolean,
  customWidth: ?number,
  customHeight: ?number,
  onCustomWidthChange: (?number) => void,
  onCustomHeightChange: (?number) => void,
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
                  {width && height ? (
                    <Text size="body-small" noMargin color="secondary">
                      {width}x{height}
                    </Text>
                  ) : (
                    <Line noMargin alignItems="center" justifyContent="center">
                      <Text size="body-small" noMargin color="secondary">
                        W
                      </Text>
                      <TextField
                        margin="none"
                        style={styles.customSizeField}
                        inputStyle={{ padding: 0 }}
                        type="number"
                        value={customWidth || ''}
                        onChange={(e, newValue: string) => {
                          // Allow any value, we will clean the value on blur.
                          const newWidth = parseInt(newValue, 10);
                          onCustomWidthChange(
                            isNaN(newWidth) ? null : newWidth
                          );
                        }}
                        onBlur={() => {
                          const newWidth = parseInt(
                            customWidth || 800, // Default to 600 if empty.
                            10
                          );
                          const newWidthWithinLimits = Math.min(
                            Math.max(newWidth, 1),
                            10000
                          );
                          onCustomWidthChange(newWidthWithinLimits);
                        }}
                        min={1}
                        max={10000}
                        step={1}
                      />
                      <Text size="body-small" noMargin color="secondary">
                        H
                      </Text>
                      <TextField
                        margin="none"
                        style={styles.customSizeField}
                        inputStyle={{ padding: 0 }}
                        type="number"
                        value={customHeight || ''}
                        onChange={(e, newValue: string) => {
                          // Allow any value, we will clean the value on blur.
                          const newHeight = parseInt(newValue, 10);
                          onCustomHeightChange(
                            isNaN(newHeight) ? null : newHeight
                          );
                        }}
                        onBlur={() => {
                          const newHeight = parseInt(
                            customHeight || 600, // Default to 600 if empty.
                            10
                          );
                          const newHeightWithinLimits = Math.min(
                            Math.max(newHeight, 1),
                            10000
                          );
                          onCustomHeightChange(newHeightWithinLimits);
                        }}
                        min={1}
                        max={10000}
                        step={1}
                      />
                    </Line>
                  )}
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
