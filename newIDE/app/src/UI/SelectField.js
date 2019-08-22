// @flow
import * as React from 'react';
import MUISelectField from 'material-ui/SelectField';

type ValueProps =
  | {|
      value: string,
      onChange?: (
        event: {| target: {| value: string |} |},
        index: number,
        text: string
      ) => void,
    |}
  | {|
      value: number,
      onChange?: (event: {||}, index: number, value: number) => void,
    |}
  | {|
      value: boolean,
      onChange?: (event: {||}, index: number, value: boolean) => void,
    |};

// We support a subset of the props supported by Material-UI v0.x SelectField
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  ...ValueProps,
  fullWidth?: boolean,
  children: React.Node,
  disabled?: boolean,

  style?: {
    flex?: 1,
    width?: 'auto',
  },

  floatingLabelText?: React.Node,
  floatingLabelFixed?: boolean,
  hintText?: React.Node,
|};

/**
 * A select field based on Material-UI select field.
 * To be used with `MenuItem`.
 */
export default class SelectField extends React.Component<Props, {||}> {
  render() {
    return <MUISelectField {...this.props} />;
  }
}
