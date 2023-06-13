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
import SemiControlledTextField from '../UI/SemiControlledTextField';

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

const maxCustomSize = 9999;
const minCustomSize = 1;
export const defaultCustomWidth = 800;
export const defaultCustomHeight = 600;

const ResolutionDimensionTextField = ({
  value,
  onChange,
  defaultValue,
  disabled,
}: {
  value: ?number,
  onChange: (value: ?number) => void,
  defaultValue: number,
  disabled?: boolean,
}) => (
  <SemiControlledTextField
    margin="none"
    style={styles.customSizeField}
    inputStyle={{ padding: 0 }}
    type="number"
    value={value ? value.toString(10) : ''}
    onChange={newValueString => {
      // Allow any value, we will clean the value on blur.
      const newValueInt = parseInt(newValueString, 10);
      // Important to allow null when the user is clearing the field.
      const newValue = isNaN(newValueInt) ? null : newValueInt;
      onChange(newValue);
    }}
    onBlur={() => {
      const newValueInt = parseInt(
        value || defaultValue, // Default if empty.
        10
      );
      const newValueWithinLimits = Math.min(
        Math.max(newValueInt, minCustomSize),
        maxCustomSize
      );
      onChange(newValueWithinLimits);
    }}
    min={0} // This value is not valid, but it's required to start at 0 for the step to go from 10 to 10.
    max={maxCustomSize}
    step={10}
  />
);

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
                      <ResolutionDimensionTextField
                        value={customWidth}
                        onChange={onCustomWidthChange}
                        defaultValue={defaultCustomWidth}
                        disabled={disabled}
                      />
                      <Text size="body-small" noMargin color="secondary">
                        H
                      </Text>
                      <ResolutionDimensionTextField
                        value={customHeight}
                        onChange={onCustomHeightChange}
                        defaultValue={defaultCustomHeight}
                        disabled={disabled}
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
