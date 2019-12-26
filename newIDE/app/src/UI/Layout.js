// @flow
import * as React from 'react';
import { Spacer, Line } from './Grid';
import { ResponsiveWindowMeasurer } from './Reponsive/ResponsiveWindowMeasurer';

type TextFieldWithButtonLayoutProps = {|
  renderTextField: () => React.Node,
  renderButton: (style: {|
    marginTop?: number,
    marginBottom?: number,
    marginLeft?: number,
    marginRight?: number,
    margin?: number,
    flexShrink?: 0,
  |}) => React.Node,
  margin?: 'none' | 'dense',
  noFloatingLabelText?: boolean,
|};

const buttonCommonStyles = {
  // Ensure the button is not shrinked, even if the text field
  // (in particular with a long helper text) is large.
  flexShrink: 0,
};

const textFieldWithButtonLayoutStyles = {
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start', // Align from the top to stay at the same position when error/multiline
  },
  filledTextFieldWithLabelRightButtonMargins: {
    ...buttonCommonStyles,
    marginTop: 24, // Properly align with the text field (only dense "filled" text fields supported)
    marginLeft: 10,
  },
  filledTextFieldWithoutLabelRightButtonMargins: {
    ...buttonCommonStyles,
    marginTop: 15, // Properly align with the text field (only dense "filled" text fields supported)
    marginLeft: 10,
  },
  standardTextFieldWithLabelRightButtonMargins: {
    ...buttonCommonStyles,
    marginTop: 17, // Properly align with the text field (only "standard" text fields with margin "none" supported)
    marginLeft: 10,
  },
  standardTextFieldWithoutLabelRightButtonMargins: {
    ...buttonCommonStyles,
    marginTop: 0, // Properly align with the text field (only "standard" text fields with margin "none" supported)
    marginLeft: 10,
  },
};

/**
 * Position a button on the right of a TextField.
 */
export const TextFieldWithButtonLayout = ({
  margin,
  noFloatingLabelText,
  renderTextField,
  renderButton,
}: TextFieldWithButtonLayoutProps) => {
  return (
    <div style={textFieldWithButtonLayoutStyles.container}>
      {renderTextField()}
      {renderButton(
        margin === 'none'
          ? noFloatingLabelText
            ? textFieldWithButtonLayoutStyles.standardTextFieldWithoutLabelRightButtonMargins
            : textFieldWithButtonLayoutStyles.standardTextFieldWithLabelRightButtonMargins
          : noFloatingLabelText
          ? textFieldWithButtonLayoutStyles.filledTextFieldWithoutLabelRightButtonMargins
          : textFieldWithButtonLayoutStyles.filledTextFieldWithLabelRightButtonMargins
      )}
    </div>
  );
};

type ResponsiveLineStackLayoutProps = {|
  alignItems?: string,
  justifyContent?: string,
  expand?: boolean,
  noMargin?: boolean,
  children: React.Node,
|};

export const ResponsiveLineStackLayout = ({
  alignItems,
  justifyContent,
  expand,
  noMargin,
  children,
}: ResponsiveLineStackLayoutProps) => {
  let isFirstChild = true;
  return (
    <ResponsiveWindowMeasurer>
      {windowWidth =>
        windowWidth === 'small' ? (
          React.Children.map(children, (child, index) => {
            return <Line expand>{child}</Line>;
          })
        ) : (
          <Line
            alignItems={alignItems}
            justifyContent={justifyContent}
            expand={expand}
            noMargin={noMargin}
          >
            {React.Children.map(children, (child, index) => {
              if (!child) return null;

              const addSpacers = !isFirstChild;
              isFirstChild = false;

              return (
                <React.Fragment>
                  {addSpacers && <Spacer />}
                  {addSpacers && <Spacer />}
                  {child}
                </React.Fragment>
              );
            })}
          </Line>
        )
      }
    </ResponsiveWindowMeasurer>
  );
};
