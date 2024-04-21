// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import { Column, Line, Spacer } from '../UI/Grid';
import { LineStackLayout } from '../UI/Layout';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { mapFor } from '../Utils/MapFor';
import RaisedButton from '../UI/RaisedButton';
import IconButton from '../UI/IconButton';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import newNameGenerator from '../Utils/NewNameGenerator';
import PropertiesEditor from '../PropertiesEditor';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import AlertMessage from '../UI/AlertMessage';
import BackgroundText from '../UI/BackgroundText';
import { MarkdownText } from '../UI/MarkdownText';
import useForceUpdate from '../Utils/UseForceUpdate';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import {
  enumerateEffectsMetadata,
  type EnumeratedEffectMetadata,
  setEffectDefaultParameters,
} from './EnumerateEffects';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_EFFECT,
} from '../Utils/GDevelopServices/Badge';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import { DragHandleIcon } from '../UI/DragHandle';
import DropIndicator from '../UI/SortableVirtualizedItemList/DropIndicator';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import Add from '../UI/CustomSvgIcons/Add';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import PasteIcon from '../UI/CustomSvgIcons/Clipboard';
import CopyIcon from '../UI/CustomSvgIcons/Copy';
import { type ConnectDragSource } from 'react-dnd';
import ResponsiveFlatButton from '../UI/ResponsiveFlatButton';

const gd: libGDevelop = global.gd;

const EFFECTS_CLIPBOARD_KIND = 'Effects';

const DragSourceAndDropTarget2D = makeDragSourceAndDropTarget(
  '2d-effects-list'
);
const DragSourceAndDropTarget3D = makeDragSourceAndDropTarget(
  '3d-effects-list'
);

const styles = {
  rowContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 5,
  },
  rowContent: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
};

export const useEffectOverridingAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  return async (existingEffectNames: Array<string>): Promise<boolean> => {
    return await showConfirmation({
      title: t`Existing effects`,
      message: t`These effects already exist:${'\n\n - ' +
        existingEffectNames.join('\n\n - ') +
        '\n\n'}Do you want to replace them?`,
      confirmButtonLabel: t`Replace`,
      dismissButtonLabel: t`Omit`,
    });
  };
};

const Effect = React.forwardRef(
  (
    {
      layerRenderingType,
      target,
      project,
      resourceManagementProps,
      effectsContainer,
      effect,
      removeEffect,
      copyEffect,
      pasteEffectsBefore,
      chooseEffectType,
      allEffectMetadata,
      onEffectsUpdated,
      onEffectsRenamed,
      nameErrors,
      setNameErrors,
      connectDragSource,
    }: {|
      layerRenderingType: '2d' | '3d',
      target: 'object' | 'layer',
      project: gdProject,
      resourceManagementProps: ResourceManagementProps,
      effectsContainer: gdEffectsContainer,
      effect: gdEffect,
      onEffectsUpdated: () => void,
      onEffectsRenamed: (oldName: string, newName: string) => void,
      removeEffect: (effect: gdEffect) => void,
      copyEffect: (effect: gdEffect) => void,
      pasteEffectsBefore: (effect: gdEffect) => Promise<void>,
      chooseEffectType: (effect: gdEffect, newEffectType: string) => void,
      allEffectMetadata: Array<EnumeratedEffectMetadata>,
      nameErrors: { [number]: React.Node },
      setNameErrors: (nameErrors: { [number]: React.Node }) => void,
      connectDragSource: ConnectDragSource,
    |},
    ref
  ) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);

    const preferences = React.useContext(PreferencesContext);
    const showEffectParameterNames =
      preferences.values.showEffectParameterNames;
    const setShowEffectParameterNames = preferences.setShowEffectParameterNames;

    const forceUpdate = useForceUpdate();

    const isClipboardContainingEffects = Clipboard.has(EFFECTS_CLIPBOARD_KIND);

    const renameEffect = React.useCallback(
      (effect: gdEffect, newName: string) => {
        if (newName === effect.getName()) return;
        if (nameErrors[effect.ptr]) {
          const newNameErrors = { ...nameErrors };
          delete newNameErrors[effect.ptr];
          setNameErrors(newNameErrors);
        }

        if (!newName) {
          setNameErrors({
            ...nameErrors,
            [effect.ptr]: <Trans>Effects cannot have empty names</Trans>,
          });
          return;
        }

        if (effectsContainer.hasEffectNamed(newName)) {
          setNameErrors({
            ...nameErrors,
            [effect.ptr]: (
              <Trans>The effect name {newName} is already taken</Trans>
            ),
          });
          return;
        }
        const oldName = effect.getName();
        effect.setName(newName);
        forceUpdate();
        onEffectsRenamed(oldName, newName);
        onEffectsUpdated();
      },
      [
        effectsContainer,
        forceUpdate,
        nameErrors,
        onEffectsRenamed,
        onEffectsUpdated,
        setNameErrors,
      ]
    );

    const effectType = effect.getEffectType();
    const effectMetadata = getEnumeratedEffectMetadata(
      allEffectMetadata,
      effectType
    );

    return (
      <I18n>
        {({ i18n }) => (
          <React.Fragment>
            <div
              ref={ref}
              style={{
                ...styles.rowContent,
                backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
              }}
            >
              {connectDragSource(
                <span>
                  <Column>
                    <DragHandleIcon />
                  </Column>
                </span>
              )}
              <ResponsiveLineStackLayout expand>
                <Line noMargin expand alignItems="center">
                  <Text noMargin noShrink>
                    <Trans>Effect name:</Trans>
                  </Text>
                  <Spacer />
                  <SemiControlledTextField
                    margin="none"
                    commitOnBlur
                    errorText={nameErrors[effect.ptr]}
                    translatableHintText={t`Enter the effect name`}
                    value={effect.getName()}
                    onChange={newName => {
                      renameEffect(effect, newName);
                    }}
                    fullWidth
                  />
                </Line>
                <Line noMargin expand alignItems="center">
                  <Text noMargin noShrink>
                    <Trans>Type:</Trans>
                  </Text>
                  <Spacer />
                  <SelectField
                    margin="none"
                    value={effectType}
                    onChange={(e, i, newEffectType: string) =>
                      chooseEffectType(effect, newEffectType)
                    }
                    fullWidth
                    translatableHintText={t`Choose the effect to apply`}
                  >
                    {allEffectMetadata.map(effectMetadata => (
                      <SelectOption
                        key={effectMetadata.type}
                        value={effectMetadata.type}
                        label={effectMetadata.fullName}
                        disabled={
                          target === 'object' &&
                          effectMetadata.isMarkedAsNotWorkingForObjects
                        }
                      />
                    ))}
                  </SelectField>
                </Line>
              </ResponsiveLineStackLayout>
              <ElementWithMenu
                element={
                  <IconButton size="small">
                    <ThreeDotsMenu />
                  </IconButton>
                }
                buildMenuTemplate={(i18n: I18nType) => [
                  {
                    label: i18n._(t`Delete`),
                    click: () => removeEffect(effect),
                  },
                  {
                    label: i18n._(t`Copy`),
                    click: () => copyEffect(effect),
                  },
                  {
                    label: i18n._(t`Paste`),
                    click: () => pasteEffectsBefore(effect),
                    enabled: isClipboardContainingEffects,
                  },
                  { type: 'separator' },
                  {
                    type: 'checkbox',
                    label: i18n._(t`Show Properties Names`),
                    checked: showEffectParameterNames,
                    click: () =>
                      setShowEffectParameterNames(!showEffectParameterNames),
                  },
                ]}
              />
              <Spacer />
            </div>
            {effectType && (
              <Line expand noMargin>
                <Column expand>
                  {effectMetadata ? (
                    <React.Fragment>
                      <Line>
                        <BackgroundText>
                          <MarkdownText source={effectMetadata.description} />
                        </BackgroundText>
                      </Line>
                      <PropertiesEditor
                        instances={[effect]}
                        schema={effectMetadata.parametersSchema}
                        project={project}
                        resourceManagementProps={resourceManagementProps}
                        renderExtraDescriptionText={
                          showEffectParameterNames
                            ? parameterName =>
                                i18n._(
                                  t`Property name in events: \`${parameterName}\` `
                                )
                            : undefined
                        }
                      />
                    </React.Fragment>
                  ) : null}
                  <Spacer />
                </Column>
              </Line>
            )}
          </React.Fragment>
        )}
      </I18n>
    );
  }
);

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  effectsContainer: gdEffectsContainer,
  onEffectsUpdated: () => void,
  onEffectsRenamed: (oldName: string, newName: string) => void,
  target: 'object' | 'layer',
  layerRenderingType: string,
|};

const getEnumeratedEffectMetadata = (
  allEffectDescriptions: Array<EnumeratedEffectMetadata>,
  effectType: string
): ?EnumeratedEffectMetadata => {
  return allEffectDescriptions.find(
    effectMetadata => effectMetadata.type === effectType
  );
};

export const getEffects2DCount = (
  platform: gdPlatform,
  effectsContainer: gdEffectsContainer
) => {
  const effectCount = effectsContainer.getEffectsCount();
  let effect2DCount = 0;
  for (let i = 0; i < effectCount; i++) {
    const effect: gdEffect = effectsContainer.getEffectAt(i);
    const effectMetadata = gd.MetadataProvider.getEffectMetadata(
      platform,
      effect.getEffectType()
    );
    if (!effectMetadata || !effectMetadata.isMarkedAsOnlyWorkingFor3D()) {
      effect2DCount++;
    }
  }
  return effect2DCount;
};

export const getEffects3DCount = (
  platform: gdPlatform,
  effectsContainer: gdEffectsContainer
) => {
  const effectCount = effectsContainer.getEffectsCount();
  let effect3DCount = 0;
  for (let i = 0; i < effectCount; i++) {
    const effect: gdEffect = effectsContainer.getEffectAt(i);
    const effectMetadata = gd.MetadataProvider.getEffectMetadata(
      platform,
      effect.getEffectType()
    );
    if (!effectMetadata || !effectMetadata.isMarkedAsOnlyWorkingFor2D()) {
      effect3DCount++;
    }
  }
  return effect3DCount;
};

/**
 * Display a list of effects and allow to add/remove/edit them.
 *
 * All available effects are fetched from the project's platform.
 */
export default function EffectsList(props: Props) {
  const {
    effectsContainer,
    onEffectsUpdated,
    onEffectsRenamed,
    project,
    target,
  } = props;
  const scrollView = React.useRef<?ScrollViewInterface>(null);
  const [justAddedEffectName, setJustAddedEffectName] = React.useState<?string>(
    null
  );
  const justAddedEffectElement = React.useRef<?any>(null);

  React.useEffect(
    () => {
      if (
        scrollView.current &&
        justAddedEffectElement.current &&
        justAddedEffectName
      ) {
        scrollView.current.scrollTo(justAddedEffectElement.current);
        setJustAddedEffectName(null);
        justAddedEffectElement.current = null;
      }
    },
    [justAddedEffectName]
  );

  const draggedEffect = React.useRef<?gdEffect>(null);

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );

  const allEffectMetadata = React.useMemo(
    () => enumerateEffectsMetadata(props.project),
    [props.project]
  );

  const all3DEffectMetadata = React.useMemo(
    () => {
      const lightEffectMetadata = [];
      const fogEffectMetadata = [];
      const otherEffectMetadata = [];
      for (const effect of allEffectMetadata) {
        if (!effect.isMarkedAsOnlyWorkingFor3D) {
          continue;
        }
        if (effect.type.endsWith('Light')) {
          lightEffectMetadata.push(effect);
        } else if (effect.type.endsWith('Fog')) {
          fogEffectMetadata.push(effect);
        } else {
          otherEffectMetadata.push(effect);
        }
      }
      return [
        ...lightEffectMetadata,
        ...fogEffectMetadata,
        ...otherEffectMetadata,
      ];
    },
    [allEffectMetadata]
  );

  const all2DEffectMetadata = React.useMemo(
    () => allEffectMetadata.filter(effect => effect.isMarkedAsOnlyWorkingFor2D),
    [allEffectMetadata]
  );

  const showEffectOverridingConfirmation = useEffectOverridingAlertDialog();

  const forceUpdate = useForceUpdate();

  const chooseEffectType = React.useCallback(
    (effect: gdEffect, newEffectType: string) => {
      effect.setEffectType(newEffectType);
      const effectMetadata = getEnumeratedEffectMetadata(
        allEffectMetadata,
        newEffectType
      );

      if (effectMetadata) {
        setEffectDefaultParameters(effect, effectMetadata.effectMetadata);
      }

      forceUpdate();
      onEffectsUpdated();
    },
    [allEffectMetadata, forceUpdate, onEffectsUpdated]
  );

  const _addEffect = React.useCallback(
    (is3D: boolean) => {
      const newName = newNameGenerator('Effect', name =>
        effectsContainer.hasEffectNamed(name)
      );
      const effect = effectsContainer.insertNewEffect(
        newName,
        effectsContainer.getEffectsCount()
      );

      if (is3D) {
        chooseEffectType(effect, 'Scene3D::DirectionalLight');
      } else {
        chooseEffectType(effect, 'Outline');
      }

      forceUpdate();
      onEffectsUpdated();
      setJustAddedEffectName(newName);
    },
    [chooseEffectType, effectsContainer, forceUpdate, onEffectsUpdated]
  );

  const addEffect = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_EFFECT,
    _addEffect
  );

  const removeEffect = React.useCallback(
    (effect: gdEffect) => {
      effectsContainer.removeEffect(effect.getName());
      forceUpdate();
      onEffectsUpdated();
    },
    [effectsContainer, forceUpdate, onEffectsUpdated]
  );

  const copyEffect = React.useCallback(
    (effect: gdEffect) => {
      Clipboard.set(EFFECTS_CLIPBOARD_KIND, [
        {
          name: effect.getName(),
          type: effect.getEffectType(),
          serializedEffect: serializeToJSObject(effect),
        },
      ]);
      forceUpdate();
    },
    [forceUpdate]
  );

  const copyAllEffects = React.useCallback(
    () => {
      Clipboard.set(
        EFFECTS_CLIPBOARD_KIND,
        mapFor(0, effectsContainer.getEffectsCount(), (index: number) => {
          const effect: gdEffect = effectsContainer.getEffectAt(index);
          return {
            name: effect.getName(),
            type: effect.getEffectType(),
            serializedEffect: serializeToJSObject(effect),
          };
        })
      );
      forceUpdate();
    },
    [forceUpdate, effectsContainer]
  );

  const pasteEffects = React.useCallback(
    async effectInsertionIndex => {
      const clipboardContent = Clipboard.get(EFFECTS_CLIPBOARD_KIND);
      const effectContents = SafeExtractor.extractArray(clipboardContent);
      if (!effectContents) return;

      const newNamedEffects: Array<{
        name: string,
        serializedEffect: string,
      }> = [];
      const existingNamedEffects: Array<{
        name: string,
        serializedEffect: string,
      }> = [];
      effectContents.forEach(effectContent => {
        const name = SafeExtractor.extractStringProperty(effectContent, 'name');
        const type = SafeExtractor.extractStringProperty(effectContent, 'type');
        const serializedEffect = SafeExtractor.extractObjectProperty(
          effectContent,
          'serializedEffect'
        );
        if (!name || !serializedEffect) {
          return;
        }

        if (type) {
          const effectMetadata = gd.MetadataProvider.getEffectMetadata(
            project.getCurrentPlatform(),
            type
          );
          if (!effectMetadata) {
            return;
          }
          if (
            target === 'object' &&
            effectMetadata.isMarkedAsNotWorkingForObjects()
          ) {
            return;
          }
        }

        if (effectsContainer.hasEffectNamed(name)) {
          existingNamedEffects.push({ name, serializedEffect });
        } else {
          newNamedEffects.push({ name, serializedEffect });
        }
      });

      let firstAddedEffectName: string | null = null;
      let index = effectInsertionIndex;
      newNamedEffects.forEach(({ name, serializedEffect }) => {
        const effect = effectsContainer.insertNewEffect(name, index);
        index++;
        unserializeFromJSObject(effect, serializedEffect);
        if (!firstAddedEffectName) {
          firstAddedEffectName = name;
        }
      });

      let shouldOverrideEffects = false;
      if (existingNamedEffects.length > 0) {
        shouldOverrideEffects = await showEffectOverridingConfirmation(
          existingNamedEffects.map(namedEffect => namedEffect.name)
        );

        if (shouldOverrideEffects) {
          existingNamedEffects.forEach(({ name, serializedEffect }) => {
            if (effectsContainer.hasEffectNamed(name)) {
              const effect = effectsContainer.getEffect(name);
              unserializeFromJSObject(effect, serializedEffect);
            }
          });
        }
      }

      forceUpdate();
      if (firstAddedEffectName) {
        setJustAddedEffectName(firstAddedEffectName);
      } else if (existingNamedEffects.length === 1) {
        setJustAddedEffectName(existingNamedEffects[0].name);
      }
      if (firstAddedEffectName || shouldOverrideEffects) {
        if (onEffectsUpdated) onEffectsUpdated();
      }
    },
    [
      forceUpdate,
      project,
      target,
      effectsContainer,
      showEffectOverridingConfirmation,
      onEffectsUpdated,
    ]
  );

  const pasteEffectsAtTheEnd = React.useCallback(
    async () => {
      await pasteEffects(effectsContainer.getEffectsCount());
    },
    [effectsContainer, pasteEffects]
  );

  const pasteEffectsBefore = React.useCallback(
    async (effect: gdEffect) => {
      await pasteEffects(effectsContainer.getEffectPosition(effect.getName()));
    },
    [effectsContainer, pasteEffects]
  );

  const moveEffect = React.useCallback(
    (targetEffect: gdEffect) => {
      const { current } = draggedEffect;
      if (!current) return;

      const draggedIndex = effectsContainer.getEffectPosition(
        current.getName()
      );
      const targetIndex = effectsContainer.getEffectPosition(
        targetEffect.getName()
      );

      effectsContainer.moveEffect(
        draggedIndex,
        targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
      );
      forceUpdate();
      onEffectsUpdated();
    },
    [effectsContainer, forceUpdate, onEffectsUpdated]
  );

  const isClipboardContainingEffects = Clipboard.has(EFFECTS_CLIPBOARD_KIND);

  const getDuplicatedUniqueEffectMetadata = React.useCallback(
    () => {
      if (effectsContainer.getEffectsCount() < 2) {
        return null;
      }
      const uniqueEffectTypes = [];
      for (let i = 0; i < effectsContainer.getEffectsCount(); i++) {
        const effect: gdEffect = effectsContainer.getEffectAt(i);
        const effectType = effect.getEffectType();
        const effectMetadata = getEnumeratedEffectMetadata(
          allEffectMetadata,
          effectType
        );
        if (!effectMetadata) {
          continue;
        }
        // TODO Add an `isUnique` attribute in effect metadata if more effect are unique.
        if (
          effectType === 'Scene3D::LinearFog' ||
          effectType === 'Scene3D::ExponentialFog'
        ) {
          if (uniqueEffectTypes.includes(effectType)) {
            return effectMetadata;
          }
          uniqueEffectTypes.push(effectType);
        }
      }
      return null;
    },
    [allEffectMetadata, effectsContainer]
  );

  const duplicatedUniqueEffectMetadata = getDuplicatedUniqueEffectMetadata();

  // Count the number of effects to hide titles of empty sections.
  const platform = project.getCurrentPlatform();
  const effects2DCount = getEffects2DCount(platform, effectsContainer);
  const effects3DCount = getEffects3DCount(platform, effectsContainer);
  const visibleEffectsCount =
    props.layerRenderingType === '2d'
      ? effects2DCount
      : props.layerRenderingType === '3d'
      ? effects3DCount
      : effectsContainer.getEffectsCount();

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin expand useFullHeight>
          {visibleEffectsCount !== 0 ? (
            <React.Fragment>
              <ScrollView ref={scrollView}>
                {duplicatedUniqueEffectMetadata && (
                  <Line>
                    <Column expand>
                      <AlertMessage kind="error">
                        <Trans>
                          The "{duplicatedUniqueEffectMetadata.fullName}" effect
                          can only be applied once.
                        </Trans>
                      </AlertMessage>
                    </Column>
                  </Line>
                )}
                {effectsContainer.getEffectsCount() > 3 && (
                  <Line>
                    <Column expand>
                      <DismissableAlertMessage
                        identifier="too-much-effects"
                        kind="warning"
                      >
                        <Trans>
                          Using a lot of effects can have a severe negative
                          impact on the rendering performance, especially on
                          low-end or mobile devices. Consider using less effects
                          if possible. You can also disable and re-enable
                          effects as needed using events.
                        </Trans>
                      </DismissableAlertMessage>
                    </Column>
                  </Line>
                )}
                {props.layerRenderingType !== '2d' && effects3DCount > 0 && (
                  <Column noMargin expand>
                    {props.layerRenderingType !== '3d' && (
                      <Column noMargin>
                        <Line>
                          <Text size="block-title">
                            <Trans>3D effects</Trans>
                          </Text>
                        </Line>
                      </Column>
                    )}
                    <Line>
                      <Column noMargin expand>
                        {mapFor(
                          0,
                          effectsContainer.getEffectsCount(),
                          (i: number) => {
                            const effect: gdEffect = effectsContainer.getEffectAt(
                              i
                            );
                            const effectType = effect.getEffectType();
                            const effectMetadata = getEnumeratedEffectMetadata(
                              allEffectMetadata,
                              effectType
                            );

                            const effectRef =
                              justAddedEffectName === effect.getName()
                                ? justAddedEffectElement
                                : null;

                            return !effectMetadata ||
                              !effectMetadata.isMarkedAsOnlyWorkingFor2D ? (
                              <DragSourceAndDropTarget3D
                                key={effect.ptr}
                                beginDrag={() => {
                                  draggedEffect.current = effect;
                                  return {};
                                }}
                                canDrag={() => true}
                                canDrop={() => true}
                                drop={() => {
                                  moveEffect(effect);
                                }}
                              >
                                {({
                                  connectDragSource,
                                  connectDropTarget,
                                  isOver,
                                  canDrop,
                                }) =>
                                  connectDropTarget(
                                    <div
                                      key={effect.ptr}
                                      style={styles.rowContainer}
                                    >
                                      {isOver && (
                                        <DropIndicator canDrop={canDrop} />
                                      )}
                                      <Effect
                                        ref={effectRef}
                                        layerRenderingType={'3d'}
                                        target={target}
                                        project={project}
                                        resourceManagementProps={
                                          props.resourceManagementProps
                                        }
                                        effectsContainer={effectsContainer}
                                        effect={effect}
                                        removeEffect={removeEffect}
                                        copyEffect={copyEffect}
                                        pasteEffectsBefore={pasteEffectsBefore}
                                        chooseEffectType={chooseEffectType}
                                        allEffectMetadata={all3DEffectMetadata}
                                        onEffectsUpdated={onEffectsUpdated}
                                        onEffectsRenamed={onEffectsRenamed}
                                        nameErrors={nameErrors}
                                        setNameErrors={setNameErrors}
                                        connectDragSource={connectDragSource}
                                      />
                                    </div>
                                  )
                                }
                              </DragSourceAndDropTarget3D>
                            ) : null;
                          }
                        )}
                      </Column>
                    </Line>
                  </Column>
                )}
                {props.layerRenderingType !== '3d' && effects2DCount > 0 && (
                  <Column noMargin expand>
                    {props.layerRenderingType !== '2d' && (
                      <Column noMargin>
                        <Line>
                          <Text size="block-title">
                            <Trans>2D effects</Trans>
                          </Text>
                        </Line>
                      </Column>
                    )}
                    <Line>
                      <Column noMargin expand>
                        {mapFor(
                          0,
                          effectsContainer.getEffectsCount(),
                          (i: number) => {
                            const effect: gdEffect = effectsContainer.getEffectAt(
                              i
                            );
                            const effectType = effect.getEffectType();
                            const effectMetadata = getEnumeratedEffectMetadata(
                              allEffectMetadata,
                              effectType
                            );

                            const effectRef =
                              justAddedEffectName === effect.getName()
                                ? justAddedEffectElement
                                : null;

                            return !effectMetadata ||
                              !effectMetadata.isMarkedAsOnlyWorkingFor3D ? (
                              <DragSourceAndDropTarget2D
                                key={effect.ptr}
                                beginDrag={() => {
                                  draggedEffect.current = effect;
                                  return {};
                                }}
                                canDrag={() => true}
                                canDrop={() => true}
                                drop={() => {
                                  moveEffect(effect);
                                }}
                              >
                                {({
                                  connectDragSource,
                                  connectDropTarget,
                                  isOver,
                                  canDrop,
                                }) =>
                                  connectDropTarget(
                                    <div
                                      key={effect.ptr}
                                      style={styles.rowContainer}
                                    >
                                      {isOver && (
                                        <DropIndicator canDrop={canDrop} />
                                      )}
                                      <Effect
                                        ref={effectRef}
                                        layerRenderingType={'2d'}
                                        target={target}
                                        project={project}
                                        resourceManagementProps={
                                          props.resourceManagementProps
                                        }
                                        effectsContainer={effectsContainer}
                                        effect={effect}
                                        removeEffect={removeEffect}
                                        copyEffect={copyEffect}
                                        pasteEffectsBefore={pasteEffectsBefore}
                                        chooseEffectType={chooseEffectType}
                                        allEffectMetadata={all2DEffectMetadata}
                                        onEffectsUpdated={onEffectsUpdated}
                                        onEffectsRenamed={onEffectsRenamed}
                                        nameErrors={nameErrors}
                                        setNameErrors={setNameErrors}
                                        connectDragSource={connectDragSource}
                                      />
                                    </div>
                                  )
                                }
                              </DragSourceAndDropTarget2D>
                            ) : null;
                          }
                        )}
                      </Column>
                    </Line>
                  </Column>
                )}
              </ScrollView>
              <Column>
                <Line noMargin>
                  <LineStackLayout expand>
                    <ResponsiveFlatButton
                      key={'copy-all-effects'}
                      leftIcon={<CopyIcon />}
                      label={<Trans>Copy all effects</Trans>}
                      onClick={() => {
                        copyAllEffects();
                      }}
                    />
                    <ResponsiveFlatButton
                      key={'paste-effects'}
                      leftIcon={<PasteIcon />}
                      label={<Trans>Paste</Trans>}
                      onClick={() => {
                        pasteEffectsAtTheEnd();
                      }}
                      disabled={!isClipboardContainingEffects}
                    />
                  </LineStackLayout>
                  <LineStackLayout justifyContent="flex-end" expand>
                    {props.layerRenderingType !== '2d' && (
                      <RaisedButton
                        primary
                        label={<Trans>Add a 3D effect</Trans>}
                        onClick={() => addEffect(true)}
                        icon={<Add />}
                      />
                    )}
                    {props.layerRenderingType !== '3d' && (
                      <RaisedButton
                        primary
                        label={<Trans>Add a 2D effect</Trans>}
                        onClick={() => addEffect(false)}
                        icon={<Add />}
                      />
                    )}
                  </LineStackLayout>
                </Line>
              </Column>
            </React.Fragment>
          ) : (
            <Column noMargin expand justifyContent="center">
              {props.layerRenderingType === '' ||
              props.layerRenderingType === '2d+3d' ? (
                <EmptyPlaceholder
                  title={<Trans>Add your first effect</Trans>}
                  description={
                    <Trans>Effects create visual changes to the object.</Trans>
                  }
                  actionLabel={<Trans>Add a 2D effect</Trans>}
                  helpPagePath={
                    props.target === 'object'
                      ? '/objects/effects'
                      : '/interface/scene-editor/layer-effects'
                  }
                  onAction={() => addEffect(false)}
                  secondaryActionIcon={<Add />}
                  secondaryActionLabel={<Trans>Add a 3D effect</Trans>}
                  onSecondaryAction={() => addEffect(true)}
                />
              ) : (
                <EmptyPlaceholder
                  title={<Trans>Add your first effect</Trans>}
                  description={
                    <Trans>Effects create visual changes to the object.</Trans>
                  }
                  actionLabel={
                    props.layerRenderingType === '3d' ? (
                      <Trans>Add a 3D effect</Trans>
                    ) : (
                      <Trans>Add a 2D effect</Trans>
                    )
                  }
                  helpPagePath={
                    props.target === 'object'
                      ? '/objects/effects'
                      : '/interface/scene-editor/layer-effects'
                  }
                  onAction={() => addEffect(props.layerRenderingType === '3d')}
                  secondaryActionIcon={<PasteIcon />}
                  secondaryActionLabel={
                    isClipboardContainingEffects ? <Trans>Paste</Trans> : null
                  }
                  onSecondaryAction={() => {
                    pasteEffectsAtTheEnd();
                  }}
                />
              )}
            </Column>
          )}
        </Column>
      )}
    </I18n>
  );
}
