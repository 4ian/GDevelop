// @flow
import OpenInNew from 'material-ui/svg-icons/action/open-in-new';
import React, { Component } from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { enumerateVariables } from './EnumerateVariables';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import classNames from 'classnames';
import { icon } from '../EventsTree/ClassNames';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';

const styles = {
  container: {
    display: 'flex',
    alignItems: 'baseline',
  },
  moreButton: {
    marginLeft: 10,
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

    return (
      <div style={styles.container}>
        <SemiControlledAutoComplete
          floatingLabelText={
            parameterMetadata ? parameterMetadata.getDescription() : undefined
          }
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
            style={styles.moreButton}
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
