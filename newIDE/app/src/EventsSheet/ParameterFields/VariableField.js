// @flow
import OpenInNew from '@material-ui/icons/OpenInNew';
import React, { Component } from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { enumerateVariables } from './EnumerateVariables';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import classNames from 'classnames';
import { icon } from '../EventsTree/ClassNames';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';
import {
  textFieldRightButtonMargins,
  textFieldWithLabelRightButtonMargins,
} from './GenericExpressionField';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
  },
};

type Props = {
  ...ParameterFieldProps,
  variablesContainer: ?gdVariablesContainer,
  onOpenDialog: ?() => void,
};

export default class VariableField extends Component<Props, {||}> {
  _field: ?SemiControlledAutoComplete;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const {
      value,
      onChange,
      isInline,
      onOpenDialog,
      parameterMetadata,
      variablesContainer,
    } = this.props;

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <div style={styles.container}>
        <SemiControlledAutoComplete
          floatingLabelText={description}
          fullWidth
          value={value}
          onChange={onChange}
          dataSource={enumerateVariables(variablesContainer).map(
            variableName => ({
              text: variableName,
              value: variableName,
            })
          )}
          openOnFocus={!isInline}
          ref={field => (this._field = field)}
        />
        {onOpenDialog && !isInline && (
          <RaisedButton
            icon={<OpenInNew />}
            disabled={!this.props.variablesContainer}
            primary
            style={
              description
                ? textFieldWithLabelRightButtonMargins
                : textFieldRightButtonMargins
            }
            onClick={onOpenDialog}
          />
        )}
      </div>
    );
  }
}

export const renderVariableWithIcon = (
  value: string,
  iconPath: string,
  tooltip: string = ''
) => {
  return (
    <span title={tooltip}>
      <img
        className={classNames({
          [icon]: true,
        })}
        src={iconPath}
        alt=""
      />
      {value}
    </span>
  );
};
