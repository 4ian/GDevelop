// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import {
  getLastObjectParameterValue,
  getPreviousParameterValue,
  tryExtractStringLiteralContent,
} from './ParameterMetadataTools';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { TextFieldWithButtonLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import Functions from '@material-ui/icons/Functions';
import TypeCursorSelect from '../../UI/CustomSvgIcons/TypeCursorSelect';
import getObjectByName from '../../Utils/GetObjectByName';
import ResourcesLoader from '../../ResourcesLoader';

const gd: libGDevelop = global.gd;

type Spine43ObjectContent = {
  binaryData?: boolean,
  skeletonResource?: ?string,
  ...
};

export const SPINE43_NAME_KINDS = {
  animation: 'spine43AnimationName',
  skin: 'spine43SkinName',
  slot: 'spine43SlotName',
  attachment: 'spine43AttachmentName',
};

export const isSpine43NameKind = (extraInfo: ?string): boolean =>
  extraInfo === SPINE43_NAME_KINDS.animation ||
  extraInfo === SPINE43_NAME_KINDS.skin ||
  extraInfo === SPINE43_NAME_KINDS.slot ||
  extraInfo === SPINE43_NAME_KINDS.attachment;

const skeletonPromises: { [string]: Promise<?any>, ... } = {};

const getNodeRequire = (): any => {
  if (typeof global !== 'undefined' && typeof global.require === 'function') {
    return global.require;
  }
  if (typeof window !== 'undefined' && typeof window.require === 'function') {
    return window.require;
  }
  return null;
};

const toFileUrl = (absolutePath: string): string => {
  const nodeRequire = getNodeRequire();
  if (nodeRequire) {
    try {
      const nodeUrl = nodeRequire('url');
      if (nodeUrl && nodeUrl.pathToFileURL) {
        return nodeUrl.pathToFileURL(absolutePath).toString();
      }
    } catch (error) {
      // Fall back to a manually-built file URL below.
    }
  }
  return 'file:///' + String(absolutePath || '').replace(/\\/g, '/');
};

const fileUrlToPath = (fileUrl: string): string => {
  const nodeRequire = getNodeRequire();
  if (nodeRequire) {
    try {
      const nodeUrl = nodeRequire('url');
      if (nodeUrl && nodeUrl.fileURLToPath) {
        return nodeUrl.fileURLToPath(fileUrl);
      }
    } catch (error) {
      // Fall back to a manually-decoded path below.
    }
  }
  return decodeURIComponent(String(fileUrl).replace(/^file:\/\/\/?/i, ''));
};

const getObjectContent = (object: any): ?Spine43ObjectContent => {
  if (!object || object.getType() !== 'Spine43Object::Spine43Object') {
    return null;
  }

  try {
    const jsImplementation = (gd.asObjectJsImplementation(
      object.getConfiguration()
    ): any);
    return jsImplementation.content || {};
  } catch (error) {
    return null;
  }
};

const resolveSkeletonUrl = (
  project: ?gdProject,
  skeletonResource: ?string
): string => {
  const value = String(skeletonResource || '').trim();
  if (!project || !value) return '';

  let file = value;
  let isProjectResource = false;
  const resourcesManager = project.getResourcesManager();
  if (resourcesManager && resourcesManager.hasResource(value)) {
    isProjectResource = true;
    const resource = resourcesManager.getResource(value);
    if (resource && resource.getFile) {
      file = resource.getFile() || value;
    }
  }

  if (/^(?:https?:|file:|data:|blob:)/i.test(file)) return file;

  const nodeRequire = getNodeRequire();
  if (nodeRequire && project.getProjectFile && project.getProjectFile()) {
    try {
      const nodePath = nodeRequire('path');
      return toFileUrl(
        nodePath.resolve(nodePath.dirname(project.getProjectFile()), file)
      );
    } catch (error) {
      return file;
    }
  }

  if (/^[a-zA-Z]:[\\/]/.test(file)) {
    return toFileUrl(file);
  }

  if (isProjectResource) {
    return ResourcesLoader.getResourceFullUrl(project, value, {
      isResourceForPixi: false,
    });
  }

  return file;
};

const readText = async (url: string): Promise<string> => {
  if (/^file:/i.test(url)) {
    const nodeRequire = getNodeRequire();
    if (nodeRequire) {
      const nodeFs = nodeRequire('fs');
      return nodeFs.readFileSync(fileUrlToPath(url), 'utf8');
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to read Spine 4.3 skeleton: ${url}`);
  }
  return response.text();
};

const loadSkeletonJson = async (
  project: ?gdProject,
  skeletonResource: ?string
): Promise<?any> => {
  if (!project) return null;
  const url = resolveSkeletonUrl(project, skeletonResource);
  if (!url) return null;

  const cacheKey = `${
    project.getProjectFile ? project.getProjectFile() : ''
  }|${url}`;
  if (!skeletonPromises[cacheKey]) {
    skeletonPromises[cacheKey] = readText(url).then(text => JSON.parse(text));
  }
  return skeletonPromises[cacheKey];
};

const getAnimationNames = (skeletonJson: any): Array<string> => {
  const animations = skeletonJson && skeletonJson.animations;
  if (Array.isArray(animations)) {
    return animations
      .map(animation => String((animation && animation.name) || ''))
      .filter(Boolean);
  }
  if (animations && typeof animations === 'object') {
    return Object.keys(animations).map(name => String(name));
  }
  return [];
};

const getSkinNames = (skeletonJson: any): Array<string> => {
  const skins = skeletonJson && skeletonJson.skins;
  if (Array.isArray(skins)) {
    return skins.map(skin => String((skin && skin.name) || '')).filter(Boolean);
  }
  if (skins && typeof skins === 'object') {
    return Object.keys(skins).map(name => String(name));
  }
  return [];
};

const getSlotNames = (skeletonJson: any): Array<string> => {
  const slots = skeletonJson && skeletonJson.slots;
  if (!Array.isArray(slots)) return [];
  return slots.map(slot => String((slot && slot.name) || '')).filter(Boolean);
};

const getSkinAttachments = (skin: any): any => {
  if (!skin) return null;
  if (skin.attachments) return skin.attachments;
  return skin;
};

const getAttachmentNames = (
  skeletonJson: any,
  slotName: ?string
): Array<string> => {
  const targetSlotName = String(slotName || '').trim();
  if (!targetSlotName) return [];

  const skins = skeletonJson && skeletonJson.skins;
  const names: Set<string> = new Set();
  const collectFromSkin = (skin: any) => {
    const attachments = getSkinAttachments(skin);
    if (!attachments || !attachments[targetSlotName]) return;
    Object.keys(attachments[targetSlotName]).forEach(name => names.add(name));
  };

  if (Array.isArray(skins)) {
    skins.forEach(collectFromSkin);
  } else if (skins && typeof skins === 'object') {
    Object.keys(skins).forEach(skinName => collectFromSkin(skins[skinName]));
  }

  return Array.from(names);
};

const getNamesForKind = (
  skeletonJson: any,
  kind: ?string,
  slotName: ?string
): Array<string> => {
  if (kind === SPINE43_NAME_KINDS.animation)
    return getAnimationNames(skeletonJson);
  if (kind === SPINE43_NAME_KINDS.skin) return getSkinNames(skeletonJson);
  if (kind === SPINE43_NAME_KINDS.slot) return getSlotNames(skeletonJson);
  if (kind === SPINE43_NAME_KINDS.attachment) {
    return getAttachmentNames(skeletonJson, slotName);
  }
  return [];
};

const getHintText = (kind: ?string): string => {
  if (kind === SPINE43_NAME_KINDS.animation) return t`Choose an animation`;
  if (kind === SPINE43_NAME_KINDS.skin) return t`Choose a skin`;
  if (kind === SPINE43_NAME_KINDS.slot) return t`Choose a slot`;
  if (kind === SPINE43_NAME_KINDS.attachment) return t`Choose an attachment`;
  return t`Choose a value`;
};

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function Spine43NameField(props: ParameterFieldProps, ref) {
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
      parameterMetadata,
      value,
      onChange,
      isInline,
    } = props;

    const kind = parameterMetadata ? parameterMetadata.getExtraInfo() : '';
    const previousParameterValue = getPreviousParameterValue({
      instruction,
      expression,
      parameterIndex,
    });
    const [names, setNames] = React.useState<Array<string>>([]);

    React.useEffect(
      () => {
        let cancelled = false;
        (async () => {
          const objectName = getLastObjectParameterValue({
            instructionMetadata,
            instruction,
            expressionMetadata,
            expression,
            parameterIndex,
          });
          if (!project || !objectName || !isSpine43NameKind(kind)) {
            if (!cancelled) setNames([]);
            return;
          }

          const object = getObjectByName(
            globalObjectsContainer,
            objectsContainer,
            objectName
          );
          const content = getObjectContent(object);
          if (!content || content.binaryData) {
            if (!cancelled) setNames([]);
            return;
          }

          try {
            const skeletonJson = await loadSkeletonJson(
              project,
              content.skeletonResource
            );
            if (cancelled) return;

            const slotName = tryExtractStringLiteralContent(
              previousParameterValue
            );
            setNames(getNamesForKind(skeletonJson, kind, slotName));
          } catch (error) {
            if (!cancelled) setNames([]);
          }
        })();

        return () => {
          cancelled = true;
        };
      },
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        instructionMetadata,
        instruction,
        expressionMetadata,
        expression,
        parameterIndex,
        kind,
        previousParameterValue,
      ]
    );

    const isCurrentValueInNames = names.some(name => `"${name}"` === value);
    const [isExpressionField, setIsExpressionField] = React.useState(
      (!!value && !isCurrentValueInNames) || names.length === 0
    );
    const [wasManuallySwitched, setWasManuallySwitched] = React.useState(false);

    React.useEffect(
      () => {
        if (!value && names.length > 0 && !isExpressionField) {
          onChange(`"${names[0]}"`);
        }
      },
      [isExpressionField, names, onChange, value]
    );

    React.useEffect(
      () => {
        if (
          !wasManuallySwitched &&
          names.length > 0 &&
          isExpressionField &&
          (!value || isCurrentValueInNames)
        ) {
          setIsExpressionField(false);
        }
      },
      [
        isExpressionField,
        isCurrentValueInNames,
        names.length,
        value,
        wasManuallySwitched,
      ]
    );

    React.useEffect(
      () => {
        if (!wasManuallySwitched && names.length === 0 && !isExpressionField) {
          setIsExpressionField(true);
        }
      },
      [isExpressionField, names.length, wasManuallySwitched]
    );

    const switchFieldType = () => {
      setWasManuallySwitched(true);
      setIsExpressionField(!isExpressionField);
    };

    // $FlowFixMe[missing-local-annot]
    const onChangeSelectValue = (event, value) => {
      onChange(event.target.value);
    };

    const fieldLabel = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const selectOptions = names.map(name => (
      <SelectOption
        key={name}
        value={`"${name}"`}
        label={name}
        shouldNotTranslate
      />
    ));

    return (
      <TextFieldWithButtonLayout
        renderTextField={() =>
          !isExpressionField ? (
            <SelectField
              ref={field}
              id={
                parameterIndex !== undefined
                  ? `parameter-${parameterIndex}-spine43-name-field`
                  : undefined
              }
              value={value}
              onChange={onChangeSelectValue}
              margin={isInline ? 'none' : 'dense'}
              fullWidth
              floatingLabelText={fieldLabel}
              translatableHintText={getHintText(kind)}
              helperMarkdownText={
                (parameterMetadata && parameterMetadata.getLongDescription()) ||
                null
              }
            >
              {selectOptions}
            </SelectField>
          ) : (
            <GenericExpressionField
              ref={field}
              id={
                parameterIndex !== undefined
                  ? `parameter-${parameterIndex}-spine43-name-field`
                  : undefined
              }
              expressionType="string"
              {...props}
            />
          )
        }
        renderButton={style =>
          names.length > 0 ? (
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
          ) : null
        }
      />
    );
  }
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);
