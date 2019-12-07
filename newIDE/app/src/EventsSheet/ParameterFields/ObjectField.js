// @flow
import * as React from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import ObjectSelector from '../../ObjectsList/ObjectSelector';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { Trans } from '@lingui/macro';

export default class ObjectField extends React.Component<
  ParameterFieldProps,
  {||}
> {
  _description: ?string;
  _allowedObjectType: ?string;
  _field: ?ObjectSelector;

  constructor(props: ParameterFieldProps) {
    super(props);

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

  render() {
    return (
      <ObjectSelector
        margin={this.props.isInline ? 'none' : 'dense'}
        project={this.props.project}
        value={this.props.value}
        onChange={this.props.onChange}
        allowedObjectType={this._allowedObjectType}
        globalObjectsContainer={this.props.globalObjectsContainer}
        objectsContainer={this.props.objectsContainer}
        floatingLabelText={this._description}
        fullWidth
        errorTextIfInvalid={
          this._allowedObjectType ? (
            <Trans>The object does not exist or can't be used here.</Trans>
          ) : (
            <Trans>Enter the name of an object.</Trans>
          )
        }
        openOnFocus={
          !this.props
            .value /* Only force showing the list if no object is entered, see https://github.com/4ian/GDevelop/issues/859 */
        }
        ref={field => (this._field = field)}
      />
    );
  }
}

export const renderInlineObjectWithThumbnail = ({
  value,
  renderObjectThumbnail,
}: ParameterInlineRendererProps) => {
  return (
    <span title={value}>
      {renderObjectThumbnail(value)}
      {value}
    </span>
  );
};
