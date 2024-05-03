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
const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function BehaviorField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?SemiControlledAutoCompleteInterface>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const { parameterMetadata } = props;

    const [errorText, setErrorText] = React.useState<?string>(null);
    const [behaviorNames, setBehaviorNames] = React.useState<Array<string>>([]);

    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const longDescription = parameterMetadata
      ? parameterMetadata.getLongDescription()
      : undefined;

    const allowedBehaviorType = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : undefined;

    const updateBehaviorsList = React.useCallback(
      () => {
        const {
          instructionMetadata,
          instruction,
          expressionMetadata,
          expression,
          parameterIndex,
          globalObjectsContainer,
          objectsContainer,
        } = props;
        const objectName = getLastObjectParameterValue({
          instructionMetadata,
          instruction,
          expressionMetadata,
          expression,
          parameterIndex,
        });
        if (!objectName) return;

        const newBehaviorNames = gd
          .getBehaviorsOfObject(
            globalObjectsContainer,
            objectsContainer,
            objectName,
            true
          )
          .toJSArray()
          .filter(behaviorName => {
            return (
              (!allowedBehaviorType ||
                gd.getTypeOfBehavior(
                  globalObjectsContainer,
                  objectsContainer,
                  behaviorName,
                  false
                ) === allowedBehaviorType) &&
              (allowedBehaviorType ||
                !gd.isDefaultBehavior(
                  globalObjectsContainer,
                  objectsContainer,
                  objectName,
                  behaviorName,
                  true
                ))
            );
          });

        setBehaviorNames(newBehaviorNames);
        if (!!props.value && newBehaviorNames.length === 0) {
          // Force emptying the current value if there is no behavior.
          // Useful when the object is changed to one without behaviors.
          props.onChange('');
        }
      },
      [props, allowedBehaviorType]
    );

    const getError = (value?: string) => {
      if (!value && !props.value) return null;

      const isValidChoice =
        behaviorNames.filter(choice => props.value === choice).length !== 0;

      if (!isValidChoice) return 'This behavior is not attached to the object';

      return null;
    };

    const doValidation = (value?: string) => {
      setErrorText(getError(value));
    };

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

    React.useEffect(
      () => {
        updateBehaviorsList();
      },
      [updateBehaviorsList]
    );

    const noBehaviorErrorText =
      allowedBehaviorType !== '' ? (
        <Trans>
          The behavior is not attached to this object. Please select another
          object or add this behavior.
        </Trans>
      ) : (
        <Trans>
          This object has no behaviors: please add this behavior to the object
          first.
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
        onBlur={event => {
          doValidation(event.currentTarget.value);
        }}
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
);
