// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import {
  type ParameterFieldProps,
  type FieldFocusFunction,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import SemiControlledAutoComplete, {
  type SemiControlledAutoCompleteInterface,
} from '../../UI/SemiControlledAutoComplete';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

export const getSelectableBehavior = (
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectOrGroupName: string,
  allowedBehaviorType: string
): Array<string> => {
  const projectScopedContainers = projectScopedContainersAccessor.get();
  const objectsContainersList = projectScopedContainers.getObjectsContainersList();
  return allowedBehaviorType
    ? objectsContainersList
        .getBehaviorNamesInObjectOrGroup(
          objectOrGroupName,
          allowedBehaviorType,
          true
        )
        .toJSArray()
    : objectsContainersList
        .getBehaviorsOfObject(objectOrGroupName, true)
        .toJSArray()
        .filter(
          behaviorName =>
            !objectsContainersList.hasDefaultBehavior(
              objectOrGroupName,
              behaviorName,
              true
            )
        );
};

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function BehaviorField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?SemiControlledAutoCompleteInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { parameterMetadata } = props;

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const longDescription = parameterMetadata
      ? parameterMetadata.getLongDescription()
      : undefined;

    const allowedBehaviorType = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : '';

    // Computed synchronously (and not in an effect) so that the first render
    // already knows the behaviors of the object: otherwise the field would
    // briefly display an error before the list is filled.
    const objectName = getLastObjectParameterValue({
      instructionMetadata: props.instructionMetadata,
      instruction: props.instruction,
      expressionMetadata: props.expressionMetadata,
      expression: props.expression,
      parameterIndex: props.parameterIndex,
    });
    const behaviorNames = React.useMemo(
      () =>
        objectName
          ? getSelectableBehavior(
              props.projectScopedContainersAccessor,
              objectName,
              allowedBehaviorType
            )
          : [],
      // Recompute on each props change: the object (not in the props) may
      // have been changed in the instruction, or a behavior may have been
      // added to it (from the instruction editor dialog).
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [props, objectName, allowedBehaviorType]
    );

    React.useEffect(
      () => {
        if (
          objectName &&
          !allowedBehaviorType &&
          !!props.value &&
          behaviorNames.length === 0
        ) {
          // Force emptying the current value if there is no behavior.
          // Useful when the object is changed to one without behaviors.
          props.onChange('');
        }
      },
      [props, objectName, allowedBehaviorType, behaviorNames]
    );

    // Derived from the current value so that the error is visible as soon as
    // the field is displayed (and not only after it lost focus).
    const errorText =
      !!props.value && !behaviorNames.includes(props.value)
        ? 'This behavior is not attached to the object'
        : null;

    const forceChooseBehavior = React.useCallback(
      () => {
        // This is a bit hacky:
        // force the behavior selection if there is only one selectable behavior
        if (behaviorNames.length === 1) {
          if (props.value !== behaviorNames[0]) {
            props.onChange(behaviorNames[0]);
          }
        }
      },
      // Ensure that we re-run this function everytime the props change.
      // This allows to recalculate the behaviorNames based on the new object selected
      // (which is not in the props)
      [behaviorNames, props]
    );

    React.useEffect(
      () => {
        forceChooseBehavior();
      },
      [forceChooseBehavior]
    );

    const noBehaviorErrorText = allowedBehaviorType ? (
      <Trans>
        The behavior is not attached to this object. Please select another
        object or add this behavior:{' '}
        {gd.MetadataProvider.getBehaviorMetadata(
          gd.JsPlatform.get(),
          allowedBehaviorType
        ).getFullName() || allowedBehaviorType}
      </Trans>
    ) : (
      <Trans>
        This object has no behaviors: please add a behavior to the object first.
      </Trans>
    );

    return (
      <SemiControlledAutoComplete
        margin={props.isInline ? 'none' : 'dense'}
        floatingLabelText={description}
        helperMarkdownText={longDescription}
        fullWidth
        errorText={!behaviorNames.length ? noBehaviorErrorText : errorText}
        value={props.value}
        onChange={props.onChange}
        onRequestClose={props.onRequestClose}
        onApply={props.onApply}
        dataSource={behaviorNames.map(behaviorName => ({
          text: behaviorName,
          value: behaviorName,
        }))}
        openOnFocus={!props.isInline}
        disabled={behaviorNames.length <= 1}
        ref={field}
      />
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);
