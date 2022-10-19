// @flow
import * as React from 'react';
import classNames from 'classnames';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import ObjectSelector from '../../ObjectsList/ObjectSelector';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { Trans } from '@lingui/macro';
import { nameAndIconContainer } from '../EventsTree/ClassNames';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';

export default class ObjectField extends React.Component<
  ParameterFieldProps,
  {||}
> {
  static contextType = InAppTutorialContext;

  _description: ?string;
  _longDescription: ?string;
  _allowedObjectType: ?string;
  _field: ?ObjectSelector;

  constructor(props: ParameterFieldProps) {
    super(props);

    const { parameterMetadata } = this.props;

    this._description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    this._longDescription = parameterMetadata
      ? parameterMetadata.getLongDescription()
      : undefined;

    this._allowedObjectType = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : undefined;
  }

  focus(selectAll: boolean = false) {
    const { isInAppTutorialRunning } = this.context;
    // Prevent focus of field if an in-app tutorial is running because
    // the popper of the tooltip and the popper of the semi controlled
    // autocomplete's dropdown are conflicting.
    if (this._field && !isInAppTutorialRunning) this._field.focus(selectAll);
  }

  render() {
    return (
      <ObjectSelector
        margin={this.props.isInline ? 'none' : 'dense'}
        project={this.props.project}
        value={this.props.value}
        onChange={this.props.onChange}
        onRequestClose={this.props.onRequestClose}
        onApply={this.props.onApply}
        allowedObjectType={this._allowedObjectType}
        requiredObjectCapability={
          // Some instructions apply to all objects BUT not some objects
          // lacking a specific capability usually offered by all objects.
          this.props.instructionMetadata
            ? this.props.instructionMetadata.getRequiredBaseObjectCapability()
            : this.props.expressionMetadata
            ? this.props.expressionMetadata.getRequiredBaseObjectCapability()
            : undefined
        }
        globalObjectsContainer={this.props.globalObjectsContainer}
        objectsContainer={this.props.objectsContainer}
        floatingLabelText={this._description}
        helperMarkdownText={this._longDescription}
        id={
          this.props.parameterIndex !== undefined
            ? `parameter-${this.props.parameterIndex}-object-selector`
            : undefined
        }
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
  parameterMetadata,
  renderObjectThumbnail,
  expressionIsValid,
  InvalidParameterValue,
  MissingParameterValue,
}: ParameterInlineRendererProps) => {
  if (!value && !parameterMetadata.isOptional()) {
    return <MissingParameterValue />;
  }

  return (
    <span
      title={value}
      className={classNames({
        [nameAndIconContainer]: true,
      })}
    >
      {renderObjectThumbnail(value)}
      {expressionIsValid ? (
        value
      ) : (
        <InvalidParameterValue>{value}</InvalidParameterValue>
      )}
    </span>
  );
};
