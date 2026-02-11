// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import getObjectByName from '../../Utils/GetObjectByName';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectSkinNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?(
      | GenericExpressionField
      | SelectFieldInterface
    )>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    const {
      project,
      globalObjectsContainer,
      objectsContainer,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = props;

    const [skinNames, setSkinNames] = React.useState<Array<string>>([]);

    const objectName = getLastObjectParameterValue({
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    });

    React.useEffect(
      () => {
        if (!project || !objectName) {
          setSkinNames([]);
          return;
        }

        const object = getObjectByName(
          globalObjectsContainer,
          objectsContainer,
          objectName
        );
        if (!object || object.getType() !== 'SpineObject::SpineObject') {
          setSkinNames([]);
          return;
        }

        const spineConfiguration = gd.asSpineConfiguration(
          object.getConfiguration()
        );
        const spineResourceName = spineConfiguration.getSpineResourceName();
        if (!spineResourceName) {
          setSkinNames([]);
          return;
        }

        let cancelled = false;
        (async () => {
          const spineData = await PixiResourcesLoader.getSpineData(
            project,
            spineResourceName
          );
          if (cancelled) return;

          if (spineData.skeleton && spineData.skeleton.skins) {
            setSkinNames(spineData.skeleton.skins.map(skin => skin.name));
          } else {
            setSkinNames([]);
          }
        })();

        return () => {
          cancelled = true;
        };
      },
      [project, objectName, globalObjectsContainer, objectsContainer]
    );

    const onChangeSelectValue = (event, value) => {
      props.onChange(event.target.value);
    };

    const fieldLabel = props.parameterMetadata
      ? props.parameterMetadata.getDescription()
      : undefined;

    const selectOptions = skinNames.map(skinName => {
      return (
        <SelectOption
          key={skinName}
          value={`"${skinName}"`}
          label={skinName}
          shouldNotTranslate
        />
      );
    });

    return (
      <SelectField
        ref={field}
        id={
          props.parameterIndex !== undefined
            ? `parameter-${props.parameterIndex}-skin-name-field`
            : undefined
        }
        value={props.value}
        onChange={onChangeSelectValue}
        margin={props.isInline ? 'none' : 'dense'}
        fullWidth
        floatingLabelText={fieldLabel}
        translatableHintText={t`Choose a skin`}
        helperMarkdownText={
          (props.parameterMetadata &&
            props.parameterMetadata.getLongDescription()) ||
          null
        }
      >
        {selectOptions}
      </SelectField>
    );
  }
);
