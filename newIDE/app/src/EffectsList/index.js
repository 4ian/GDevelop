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
import FlatButton from '../UI/FlatButton';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';

const gd: libGDevelop = global.gd;

const EFFECTS_CLIPBOARD_KIND = 'Effects';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget('effects-list');

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

  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const preferences = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const showEffectParameterNames = preferences.values.showEffectParameterNames;
  const setShowEffectParameterNames = preferences.setShowEffectParameterNames;
  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );

  const allEffectMetadata = React.useMemo(
    () => enumerateEffectsMetadata(props.project),
    [props.project]
  );

  const showEffectOverridingConfirmation = useEffectOverridingAlertDialog();

  const forceUpdate = useForceUpdate();

  const _addEffect = React.useCallback(
    () => {
      const newName = newNameGenerator('Effect', name =>
        effectsContainer.hasEffectNamed(name)
      );
      effectsContainer.insertNewEffect(
        newName,
        effectsContainer.getEffectsCount()
      );

      forceUpdate();
      onEffectsUpdated();
      setJustAddedEffectName(newName);
    },
    [effectsContainer, forceUpdate, onEffectsUpdated]
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
    ]
  );

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

  const isClipboardContainingEffects = Clipboard.has(EFFECTS_CLIPBOARD_KIND);

  const windowWidth = useResponsiveWindowWidth();
  const isSmall = windowWidth === 'small';

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
        if (effectMetadata.isMarkedAsOnlyWorkingFor3D) {
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

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin expand useFullHeight>
          {effectsContainer.getEffectsCount() !== 0 ? (
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

                        return (
                          <DragSourceAndDropTarget
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
                                  <div
                                    ref={effectRef}
                                    style={{
                                      ...styles.rowContent,
                                      backgroundColor:
                                        gdevelopTheme.list.itemsBackgroundColor,
                                    }}
                                  >
                                    {connectDragSource(
                                      <span>
                                        <Spacer />
                                        <DragHandleIcon />
                                        <Spacer />
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
                                          onChange={(
                                            e,
                                            i,
                                            newEffectType: string
                                          ) =>
                                            chooseEffectType(
                                              effect,
                                              newEffectType
                                            )
                                          }
                                          fullWidth
                                          translatableHintText={t`Choose the effect to apply`}
                                        >
                                          {allEffectMetadata.map(
                                            effectMetadata => (
                                              <SelectOption
                                                key={effectMetadata.type}
                                                value={effectMetadata.type}
                                                label={effectMetadata.fullName}
                                                disabled={
                                                  (props.target === 'object' &&
                                                    effectMetadata.isMarkedAsNotWorkingForObjects) ||
                                                  (props.layerRenderingType ===
                                                    '3d' &&
                                                    effectMetadata.isMarkedAsOnlyWorkingFor2D) ||
                                                  (props.layerRenderingType ===
                                                    '2d' &&
                                                    effectMetadata.isMarkedAsOnlyWorkingFor3D)
                                                }
                                              />
                                            )
                                          )}
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
                                          click: () =>
                                            pasteEffectsBefore(effect),
                                          enabled: isClipboardContainingEffects,
                                        },
                                        { type: 'separator' },
                                        {
                                          type: 'checkbox',
                                          label: i18n._(
                                            t`Show Parameter Names`
                                          ),
                                          checked: showEffectParameterNames,
                                          click: () =>
                                            setShowEffectParameterNames(
                                              !showEffectParameterNames
                                            ),
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
                                                <MarkdownText
                                                  source={
                                                    effectMetadata.description
                                                  }
                                                />
                                              </BackgroundText>
                                            </Line>
                                            <PropertiesEditor
                                              instances={[effect]}
                                              schema={
                                                effectMetadata.parametersSchema
                                              }
                                              project={props.project}
                                              resourceManagementProps={
                                                props.resourceManagementProps
                                              }
                                              renderExtraDescriptionText={
                                                showEffectParameterNames
                                                  ? parameterName =>
                                                      i18n._(
                                                        t`Parameter name in events: \`${parameterName}\` `
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
                                </div>
                              )
                            }
                          </DragSourceAndDropTarget>
                        );
                      }
                    )}
                  </Column>
                </Line>
              </ScrollView>
              <Column>
                <Line noMargin>
                  <LineStackLayout expand>
                    <FlatButton
                      key={'copy-all-effects'}
                      leftIcon={<CopyIcon />}
                      label={isSmall ? '' : <Trans>Copy all effects</Trans>}
                      onClick={() => {
                        copyAllEffects();
                      }}
                    />
                    <FlatButton
                      key={'paste-effects'}
                      leftIcon={<PasteIcon />}
                      label={isSmall ? '' : <Trans>Paste</Trans>}
                      onClick={() => {
                        pasteEffectsAtTheEnd();
                      }}
                      disabled={!isClipboardContainingEffects}
                    />
                  </LineStackLayout>
                  <LineStackLayout justifyContent="flex-end" expand>
                    <RaisedButton
                      primary
                      label={<Trans>Add an effect</Trans>}
                      onClick={addEffect}
                      icon={<Add />}
                    />
                  </LineStackLayout>
                </Line>
              </Column>
            </React.Fragment>
          ) : (
            <Column noMargin expand justifyContent="center">
              <EmptyPlaceholder
                title={<Trans>Add your first effect</Trans>}
                description={
                  <Trans>Effects create visual changes to the object.</Trans>
                }
                actionLabel={<Trans>Add an effect</Trans>}
                helpPagePath={
                  props.target === 'object'
                    ? '/objects/effects'
                    : '/interface/scene-editor/layer-effects'
                }
                onAction={addEffect}
                secondaryActionIcon={<PasteIcon />}
                secondaryActionLabel={
                  isClipboardContainingEffects ? <Trans>Paste</Trans> : null
                }
                onSecondaryAction={() => {
                  pasteEffectsAtTheEnd();
                }}
              />
            </Column>
          )}
        </Column>
      )}
    </I18n>
  );
}
