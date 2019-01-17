// @flow
import * as React from 'react';
import ObjectSelector from '../../ObjectsList/ObjectSelector';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';

type State = {|
  errorText: ?string,
|};

export default class ObjectField extends React.Component<
  ParameterFieldProps,
  State
> {
  _description: ?string;
  _allowedObjectType: ?string;
  _field: ?ObjectSelector;

  constructor(props: ParameterFieldProps) {
    super(props);
    this.state = { errorText: null };

    const { parameterMetadata } = this.props;

    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._allowedObjectType = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : undefined;
  }

  focus() {
    if (this._field) this._field.focus();
  }

  componentDidMount() {
    if (this.props.value) this._doValidation();
  }

  _getError = () => {
    if (this._field && !this._field.hasAValidObject())
      return "The object does not exist or can't be used here";

    return null;
  };

  _doValidation = () => {
    this.setState({ errorText: this._getError() });
  };

  _onChange = (value: string) => {
    this.setState({ errorText: null });
    this.props.onChange(value);
  };

  render() {
    return (
      <ObjectSelector
        value={this.props.value}
        onChange={this._onChange}
        onChoose={this._onChange}
        allowedObjectType={this._allowedObjectType}
        globalObjectsContainer={this.props.globalObjectsContainer}
        objectsContainer={this.props.objectsContainer}
        floatingLabelText={this._description}
        fullWidth
        errorText={this.state.errorText}
        onBlur={this._doValidation}
        openOnFocus={
          !this.props
            .value /* Only force showing the list if no object is entered, see https://github.com/4ian/GDevelop/issues/859 */
        }
        ref={field => (this._field = field)}
      />
    );
  }
}
