import React, { Component } from 'react';
import ObjectSelector from '../../../ObjectsList/ObjectSelector';

export default class ObjectField extends Component {
  constructor(props) {
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

  _getError = () => {
    if (this._field && !this._field.hasAValidObject())
      return "The object does not exist or can't be used here";

    return null;
  };

  _doValidation = () => {
    this.setState({ errorText: this._getError() });
  };

  render() {
    return (
      <ObjectSelector
        value={this.props.value}
        onChange={value => {
          this.setState({ errorText: null });
          this.props.onChange(value);
        }}
        onChoose={objectName => this.props.onChange(objectName)}
        allowedObjectType={this._allowedObjectType}
        project={this.props.project}
        layout={this.props.layout}
        floatingLabelText={this._description}
        fullWidth
        errorText={this.state.errorText}
        onBlur={this._doValidation}
        openOnFocus={!this.props.isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
