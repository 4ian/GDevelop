// @flow
import * as React from 'react';
import classNames from 'classnames';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import ObjectSelector from '../../ObjectsList/ObjectSelector';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import { Trans } from '@lingui/macro';
import { nameAndIconContainer } from '../EventsTree/ClassNames';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?ObjectSelector>(null);
    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: {| selectAll?: boolean |}) => {
        // Prevent focus of field if an in-app tutorial is running because
        // the popper of the tooltip and the popper of the semi controlled
        // autocomplete's dropdown are conflicting.
        if (field.current && !currentlyRunningInAppTutorial)
          field.current.focus({ selectAll });
      },
    }));

    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );

    const { parameterMetadata } = props;

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const longDescription = parameterMetadata
      ? parameterMetadata.getLongDescription()
      : undefined;

    const allowedObjectType = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : undefined;

    return (
      <ObjectSelector
        margin={props.isInline ? 'none' : 'dense'}
        project={props.project}
        value={props.value}
        onChange={props.onChange}
        onRequestClose={props.onRequestClose}
        onApply={props.onApply}
        allowedObjectType={allowedObjectType}
        requiredObjectCapability={
          // Some instructions apply to all objects BUT not some objects
          // lacking a specific capability usually offered by all objects.
          props.instructionMetadata
            ? props.instructionMetadata.getRequiredBaseObjectCapability()
            : props.expressionMetadata
            ? props.expressionMetadata.getRequiredBaseObjectCapability()
            : undefined
        }
        globalObjectsContainer={props.globalObjectsContainer}
        objectsContainer={props.objectsContainer}
        floatingLabelText={description}
        helperMarkdownText={longDescription}
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-object-selector`
            : undefined
        }
        fullWidth
        errorTextIfInvalid={
          allowedObjectType ? (
            <Trans>The object does not exist or can't be used here.</Trans>
          ) : (
            <Trans>Enter the name of an object.</Trans>
          )
        }
        openOnFocus={
          !props.value /* Only force showing the list if no object is entered, see https://github.com/4ian/GDevelop/issues/859 */
        }
        ref={field}
      />
    );
  }
);

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
