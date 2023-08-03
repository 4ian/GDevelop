// @flow
import * as React from 'react';
import classNames from 'classnames';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import ObjectSelector, {
  type ObjectSelectorInterface,
} from '../../ObjectsList/ObjectSelector';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { Trans } from '@lingui/macro';
import { nameAndIconContainer } from '../EventsTree/ClassNames';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectField(props: ParameterFieldProps, ref) {
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const field = React.useRef<?ObjectSelectorInterface>(null);
    const focus: FieldFocusFunction = options => {
      // Prevent focus of field if an in-app tutorial is running because
      // the popper of the tooltip and the popper of the semi controlled
      // autocomplete's dropdown are conflicting.
      if (field.current && !currentlyRunningInAppTutorial)
        field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const {
      project,
      parameterMetadata,
      parameterIndex,
      instructionMetadata,
      expressionMetadata,
    } = props;

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const longDescription = parameterMetadata
      ? parameterMetadata.getLongDescription()
      : undefined;

    const allowedObjectType = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : undefined;

    const behaviorConstraints = React.useMemo(
      () => {
        const functionMetadata = instructionMetadata || expressionMetadata;
        if (!project || !functionMetadata || parameterIndex === undefined) {
          return [];
        }
        const behaviorConstraints: Array<{
          behaviorName: string,
          behaviorType: string,
        }> = [];
        for (
          let index = parameterIndex + 1;
          index < functionMetadata.getParametersCount();
          index++
        ) {
          const behaviorParameter = functionMetadata.getParameter(index);
          if (behaviorParameter.getType() !== 'behavior') {
            break;
          }
          const behaviorType = behaviorParameter.getExtraInfo();
          const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
            project.getCurrentPlatform(),
            behaviorType
          );
          if (behaviorMetadata.isHidden()) {
            behaviorConstraints.push({
              behaviorName: behaviorMetadata.getDefaultName(),
              behaviorType,
            });
          }
        }
        return behaviorConstraints;
      },
      [expressionMetadata, instructionMetadata, parameterIndex, project]
    );

    return (
      <ObjectSelector
        margin={props.isInline ? 'none' : 'dense'}
        project={project}
        value={props.value}
        onChange={props.onChange}
        onRequestClose={props.onRequestClose}
        onApply={props.onApply}
        // Some instructions apply to all objects BUT not some objects
        // lacking a specific capability usually offered by all objects.
        allowedObjectType={allowedObjectType}
        behaviorConstraints={behaviorConstraints}
        globalObjectsContainer={props.globalObjectsContainer}
        objectsContainer={props.objectsContainer}
        floatingLabelText={description}
        helperMarkdownText={longDescription}
        id={
          parameterIndex !== undefined
            ? `parameter-${parameterIndex}-object-selector`
            : undefined
        }
        fullWidth
        errorTextIfInvalid={
          allowedObjectType || behaviorConstraints.length > 0 ? (
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
