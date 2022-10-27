// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import GDevelopThemeContext from './Theme/ThemeContext';

// We support a subset of the props supported by Material-UI v0.x MenuItem
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  value: string | number | boolean,
  primaryText: MessageDescriptor,
  disabled?: boolean,
  primaryTextIsUserDefined?: boolean,
|};

/**
 * A native select option to be used with `SelectField`.
 */
const SelectOption = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <I18n>
      {({ i18n }) => (
        <option
          value={props.value}
          disabled={props.disabled}
          style={{
            color: gdevelopTheme.text.color.primary,
            backgroundColor: gdevelopTheme.palette.canvasColor,
          }}
        >
          {props.primaryTextIsUserDefined
            ? props.primaryText
            : i18n._(props.primaryText)}
        </option>
      )}
    </I18n>
  );
};

export default SelectOption;
