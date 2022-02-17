// @flow
import OpenInNew from '@material-ui/icons/OpenInNew';
import React, { Component } from 'react';
import RaisedButton from '../../UI/RaisedButton';
import { enumerateVariables } from './EnumerateVariables';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import classNames from 'classnames';
import { icon, nameAndIconContainer } from '../EventsTree/ClassNames';
import SemiControlledAutoComplete, {
  type SemiControlledAutoCompleteInterface,
  type DataSource,
} from '../../UI/SemiControlledAutoComplete';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import uniq from 'lodash/uniq';

type Props = {
  ...ParameterFieldProps,
  variablesContainer: ?gdVariablesContainer,
  onComputeAllVariableNames: () => Array<string>,
  onOpenDialog: ?() => void,
};

type State = {|
  autocompletionVariableNames: DataSource,
|};

export default class VariableField extends Component<Props, State> {
  _field: ?SemiControlledAutoCompleteInterface;

  static contextType = PreferencesContext;

  constructor(props: Props) {
    super(props);
    this.state = {
      autocompletionVariableNames: [],
    };
  }

  componentDidMount() {
    this.updateAutocompletions();
  }

  /**
   * Can be called to set up or force updating the variables list.
   */
  updateAutocompletions() {
    const definedVariableNames = enumerateVariables(
      this.props.variablesContainer
    )
      .map(({ name, isValidName }) =>
        isValidName
          ? name
          : // Hide invalid variable names - they would not
            // be parsed correctly anyway.
            null
      )
      .filter(Boolean);
    const preferences = this.context;
    const autocompletionVariableNames = preferences.values
      .useUndefinedVariablesInAutocompletion
      ? uniq([
          ...definedVariableNames,
          ...this.props.onComputeAllVariableNames(),
        ])
      : definedVariableNames;
    this.setState({
      autocompletionVariableNames: autocompletionVariableNames.map(name => ({
        text: name,
        value: name,
      })),
    });
  }

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    const {
      value,
      onChange,
      isInline,
      onOpenDialog,
      parameterMetadata,
      onRequestClose,
      onApply,
    } = this.props;

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <TextFieldWithButtonLayout
        renderTextField={() => (
          <SemiControlledAutoComplete
            margin={this.props.isInline ? 'none' : 'dense'}
            floatingLabelText={description}
            helperMarkdownText={
              parameterMetadata
                ? parameterMetadata.getLongDescription()
                : undefined
            }
            fullWidth
            value={value}
            onChange={onChange}
            onRequestClose={onRequestClose}
            onApply={onApply}
            dataSource={this.state.autocompletionVariableNames}
            openOnFocus={!isInline}
            ref={field => (this._field = field)}
          />
        )}
        renderButton={style =>
          onOpenDialog && !isInline ? (
            <RaisedButton
              icon={<OpenInNew />}
              disabled={!this.props.variablesContainer}
              primary
              style={style}
              onClick={onOpenDialog}
            />
          ) : null
        }
      />
    );
  }
}

export const renderVariableWithIcon = (
  {
    value,
    parameterMetadata,
    MissingParameterValue,
  }: ParameterInlineRendererProps,
  iconPath: string,
  tooltip: string
) => {
  if (!value && !parameterMetadata.isOptional()) {
    return <MissingParameterValue />;
  }

  return (
    <span
      title={tooltip}
      className={classNames({
        [nameAndIconContainer]: true,
      })}
    >
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
