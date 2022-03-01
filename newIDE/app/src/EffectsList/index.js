// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { mapFor } from '../Utils/MapFor';
import RaisedButton from '../UI/RaisedButton';
import IconButton from '../UI/IconButton';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import MoreVert from '@material-ui/icons/MoreVert';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import newNameGenerator from '../Utils/NewNameGenerator';
import Add from '@material-ui/icons/Add';
import PropertiesEditor from '../PropertiesEditor';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import BackgroundText from '../UI/BackgroundText';
import { MarkdownText } from '../UI/MarkdownText';
import useForceUpdate from '../Utils/UseForceUpdate';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import {
  enumerateEffectsMetadata,
  type EnumeratedEffectMetadata,
  setEffectDefaultParameters,
} from './EnumerateEffects';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import ScrollView from '../UI/ScrollView';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_EFFECT,
} from '../Utils/GDevelopServices/Badge';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {|
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  effectsContainer: gdEffectsContainer,
  onEffectsUpdated: () => void,
  target: 'object' | 'layer',
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
  const { effectsContainer, onEffectsUpdated } = props;

  const preferences = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const showEffectParameterNames = preferences.values.showEffectParameterNames;
  const setShowEffectParameterNames = preferences.setShowEffectParameterNames;

  const allEffectMetadata = React.useMemo(
    () => enumerateEffectsMetadata(props.project),
    [props.project]
  );

  const forceUpdate = useForceUpdate();

  const _addEffect = () => {
    const newName = newNameGenerator('Effect', name =>
      effectsContainer.hasEffectNamed(name)
    );
    effectsContainer.insertNewEffect(
      newName,
      effectsContainer.getEffectsCount()
    );

    forceUpdate();
    onEffectsUpdated();
  };

  const addEffect = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_EFFECT,
    _addEffect
  );

  const removeEffect = (name: string) => {
    effectsContainer.removeEffect(name);
    forceUpdate();
    onEffectsUpdated();
  };

  const chooseEffectType = (effect: gdEffect, newEffectType: string) => {
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
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin expand useFullHeight>
          {effectsContainer.getEffectsCount() !== 0 ? (
            <React.Fragment>
              <ScrollView>
                {effectsContainer.getEffectsCount() > 3 && (
                  <Line>
                    <Column>
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
                {mapFor(0, effectsContainer.getEffectsCount(), (i: number) => {
                  const effect: gdEffect = effectsContainer.getEffectAt(i);
                  const effectType = effect.getEffectType();
                  const effectMetadata = getEnumeratedEffectMetadata(
                    allEffectMetadata,
                    effectType
                  );

                  return (
                    <React.Fragment key={i}>
                      <MiniToolbar>
                        <MiniToolbarText firstChild>
                          <Trans>Effect name:</Trans>
                        </MiniToolbarText>
                        <SemiControlledTextField
                          margin="none"
                          commitOnBlur
                          hintText={t`Enter the effect name`}
                          value={effect.getName()}
                          onChange={newName => {
                            if (newName === effect.getName()) return;

                            effect.setName(newName);
                            forceUpdate();
                            onEffectsUpdated();
                          }}
                          fullWidth
                        />
                        <MiniToolbarText>
                          <Trans>Type:</Trans>
                        </MiniToolbarText>
                        <SelectField
                          margin="none"
                          value={effectType}
                          onChange={(e, i, newEffectType: string) =>
                            chooseEffectType(effect, newEffectType)
                          }
                          fullWidth
                          hintText={t`Choose the effect to apply`}
                        >
                          {allEffectMetadata.map(effectMetadata => (
                            <SelectOption
                              key={effectMetadata.type}
                              value={effectMetadata.type}
                              primaryText={effectMetadata.fullName}
                              disabled={
                                props.target === 'object' &&
                                effectMetadata.isMarkedAsNotWorkingForObjects
                              }
                            />
                          ))}
                        </SelectField>
                        <ElementWithMenu
                          element={
                            <IconButton>
                              <MoreVert />
                            </IconButton>
                          }
                          buildMenuTemplate={(i18n: I18nType) => [
                            {
                              label: i18n._(t`Delete`),
                              click: () => removeEffect(effect.getName()),
                            },
                            { type: 'separator' },
                            {
                              type: 'checkbox',
                              label: i18n._(t`Show Parameter Names`),
                              checked: showEffectParameterNames,
                              click: () =>
                                setShowEffectParameterNames(
                                  !showEffectParameterNames
                                ),
                            },
                          ]}
                        />
                      </MiniToolbar>
                      <Line expand noMargin>
                        <Column expand>
                          {!!effectType && effectMetadata ? (
                            <React.Fragment>
                              <Line>
                                <BackgroundText>
                                  <MarkdownText
                                    source={effectMetadata.description}
                                  />
                                </BackgroundText>
                              </Line>
                              <PropertiesEditor
                                instances={[effect]}
                                schema={effectMetadata.parametersSchema}
                                project={props.project}
                                resourceSources={props.resourceSources}
                                onChooseResource={props.onChooseResource}
                                resourceExternalEditors={
                                  props.resourceExternalEditors
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
                        </Column>
                      </Line>
                    </React.Fragment>
                  );
                })}
              </ScrollView>
              <Column>
                <Line justifyContent="flex-end" expand>
                  <RaisedButton
                    primary
                    label={<Trans>Add an effect</Trans>}
                    onClick={addEffect}
                    icon={<Add />}
                  />
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
                onAdd={addEffect}
              />
            </Column>
          )}
        </Column>
      )}
    </I18n>
  );
}
