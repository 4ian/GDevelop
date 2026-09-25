// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Functions from '@material-ui/icons/Functions';
import ResourceSelector, {
  type ResourceSelectorInterface,
} from '../../ResourcesList/ResourceSelector';
import ResourcesLoader from '../../ResourcesLoader';
import GenericExpressionField from './GenericExpressionField';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import { Column } from '../../UI/Grid';
import Text from '../../UI/Text';
import { isResourceExpression } from './ResourceExpression';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function AudioResourceField(props, ref) {
    const field = React.useRef<?(
      | ResourceSelectorInterface
      | GenericExpressionField
    )>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    // A file name built by the events rather than chosen in the editor: the
    // field opens on the expression, as `SceneNameField` does.
    const [isExpressionField, setIsExpressionField] = React.useState(() =>
      isResourceExpression(props.value || '')
    );

    const switchFieldType = () => {
      setIsExpressionField(!isExpressionField);
    };

    if (!props.resourceManagementProps || !props.project) {
      console.error(
        'Missing project or resourceManagementProps for AudioResourceField'
      );
      return null;
    }
    const { project, resourceManagementProps } = props;

    const fieldId =
      props.parameterIndex !== undefined
        ? `parameter-${props.parameterIndex}-audio-field`
        : undefined;

    const fieldWithButton = (
      <TextFieldWithButtonLayout
        renderTextField={() =>
          !isExpressionField ? (
            <ResourceSelector
              margin={props.isInline ? 'none' : 'dense'}
              project={project}
              projectScopedContainersAccessor={
                props.projectScopedContainersAccessor
              }
              resourceManagementProps={resourceManagementProps}
              resourcesLoader={ResourcesLoader}
              resourceKind="audio"
              fullWidth
              initialResourceName={props.value}
              onChange={props.onChange}
              floatingLabelText={<Trans>Choose the audio file to use</Trans>}
              onRequestClose={props.onRequestClose}
              onApply={props.onApply}
              ref={field}
              id={fieldId}
            />
          ) : (
            <GenericExpressionField
              ref={field}
              id={fieldId}
              expressionType="string"
              {...props}
              onChange={props.onChange}
            />
          )
        }
        renderButton={style =>
          isExpressionField ? (
            <FlatButton
              id="switch-expression-select"
              leftIcon={<TypeCursorSelect />}
              style={style}
              primary
              label={<Trans>Select</Trans>}
              onClick={switchFieldType}
            />
          ) : (
            <RaisedButton
              id="switch-expression-select"
              icon={<Functions />}
              style={style}
              primary
              label={<Trans>Use an expression</Trans>}
              onClick={switchFieldType}
            />
          )
        }
      />
    );

    if (!isExpressionField || props.isInline) return fieldWithButton;

    // What the editor cannot know about a name computed while the game runs.
    return (
      <Column noMargin>
        {fieldWithButton}
        <Text size="body-small" color="secondary">
          <Trans>
            The expression must give the exact name of an audio resource. The
            editor cannot know which one it is: the sound is not preloaded with
            the scene (use a preload action if needed), and it is not seen when
            removing unused resources or renaming resources.
          </Trans>
        </Text>
      </Column>
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);
