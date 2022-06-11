// @flow
import * as React from 'react';
import { Spacer, Line, Column } from './Grid';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';

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
    marginTop: 15, // Properly align with the text field (only dense "filled" text fields supported)
    marginLeft: 8,
  },
  filledTextFieldWithoutLabelRightButtonMargins: {
    ...buttonCommonStyles,
    marginTop: 6, // Properly align with the text field (only dense "filled" text fields supported)
    marginLeft: 8,
  },
  standardTextFieldWithLabelRightButtonMargins: {
    ...buttonCommonStyles,
    marginTop: 17, // Properly align with the text field (only "standard" text fields with margin "none" supported)
    marginLeft: 8,
  },
  standardTextFieldWithoutLabelRightButtonMargins: {
    ...buttonCommonStyles,
    marginTop: 0, // Properly align with the text field (only "standard" text fields with margin "none" supported)
    marginLeft: 8,
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

type LineStackLayoutProps = {|
  alignItems?: string,
  justifyContent?: string,
  expand?: boolean,
  noMargin?: boolean,
  children: React.Node,
|};

export const LineStackLayout = ({
  alignItems,
  justifyContent,
  expand,
  noMargin,
  children,
}: LineStackLayoutProps) => {
  let isFirstChild = true;
  return (
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
            {child}
          </React.Fragment>
        );
      })}
    </Line>
  );
};

type ResponsiveLineStackLayoutProps = {|
  alignItems?: string,
  justifyContent?: string,
  expand?: boolean,
  /** Prefer `noColumnMargin` if needed. */
  noMargin?: boolean,
  /** Remove the margin on the left and right of the column, when the layout is shown as a single column. */
  noColumnMargin?: boolean,
  /** Do not measure window width in case parent component is in smaller component */
  width?: 'small',
  children: React.Node,
|};

export const ResponsiveLineStackLayout = ({
  alignItems,
  justifyContent,
  expand,
  noMargin,
  noColumnMargin,
  width,
  children,
}: ResponsiveLineStackLayoutProps) => {
  const windowWidth = useResponsiveWindowWidth();

  return (width || windowWidth) === 'small' ? (
    <ColumnStackLayout noMargin={noMargin || noColumnMargin} expand>
      {children}
    </ColumnStackLayout>
  ) : (
    <LineStackLayout
      alignItems={alignItems}
      justifyContent={justifyContent}
      expand={expand}
      noMargin={noMargin}
    >
      {children}
    </LineStackLayout>
  );
};

type ColumnStackLayoutProps = {|
  alignItems?: string,
  justifyContent?: string,
  expand?: boolean,
  noMargin?: boolean,
  children: React.Node,
  noOverflowParent?: boolean,
|};

export const ColumnStackLayout = ({
  alignItems,
  justifyContent,
  expand,
  noMargin,
  children,
  noOverflowParent,
}: ColumnStackLayoutProps) => {
  let isFirstChild = true;
  return (
    <Column
      alignItems={alignItems}
      justifyContent={justifyContent}
      expand={expand}
      noMargin={noMargin}
      noOverflowParent={noOverflowParent}
    >
      {React.Children.map(children, (child, index) => {
        if (!child) return null;

        const addSpacers = !isFirstChild;
        isFirstChild = false;

        return (
          <React.Fragment>
            {addSpacers && <Spacer />}
            {child}
          </React.Fragment>
        );
      })}
    </Column>
  );
};
