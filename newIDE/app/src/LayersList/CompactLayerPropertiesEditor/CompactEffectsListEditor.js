// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { type ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { marginsSize } from '../../UI/Grid';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { ColumnStackLayout } from '../../UI/Layout';
import RemoveIcon from '../../UI/CustomSvgIcons/Remove';
import VisibilityIcon from '../../UI/CustomSvgIcons/Visibility';
import VisibilityOffIcon from '../../UI/CustomSvgIcons/VisibilityOff';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { mapFor } from '../../Utils/MapFor';
import {
  getEnumeratedEffectMetadata,
  useManageEffects,
} from '../../EffectsList';
import CompactSelectField from '../../UI/CompactSelectField';
import SelectOption from '../../UI/SelectOption';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import Link from '../../UI/Link';
import { CompactPropertiesEditorByVisibility } from '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';
import { CollapsibleSubPanel } from '../../ObjectEditor/CompactObjectPropertiesEditor';
import { TopLevelCollapsibleSection } from '../../CompactPropertiesEditor/TopLevelCollapsibleSection';
import { usePersistedCollapsedSection } from '../../Utils/UsePersistedCollapsedSection';

export const styles = {
  icon: {
    fontSize: 18,
  },
  scrollView: {
    paddingTop: marginsSize,
    // In theory, should not be needed (the children should be responsible for not
    // overflowing the parent). In practice, even when no horizontal scroll is shown
    // on Chrome, it might happen on Safari. Prevent any scroll to be 100% sure no
    // scrollbar will be shown.
    overflowX: 'hidden',
  },
  hiddenContent: { display: 'none' },
  subPanelContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingLeft: marginsSize * 3,
    paddingRight: marginsSize,
  },
};

const layerEffectsHelpLink = getHelpLink(
  '/interface/scene-editor/layer-effects'
);
const objectEffectsHelpLink = getHelpLink('/objects/effects');

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,

  effectsContainer: gdEffectsContainer,
  onEffectsUpdated: () => void,
  onOpenFullEditor: () => void,
  onEffectAdded: () => void,
  layerRenderingType: '2d' | '3d',
  target: 'object' | 'layer',
  persistedPanelStateId: string,
|};

export const CompactEffectsListEditor = ({
  project,
  resourceManagementProps,
  projectScopedContainersAccessor,
  unsavedChanges,
  i18n,
  effectsContainer,
  onEffectsUpdated,
  onOpenFullEditor,
  onEffectAdded,
  layerRenderingType,
  target,
  persistedPanelStateId,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();

  const {
    isSectionFolded,
    toggleSectionFolded,
    setSectionFolded,
  } = usePersistedCollapsedSection({
    project,
    persistedPanelStateId: persistedPanelStateId,
    persistedPanelStateType: 'layer',
  });

  // Effects:
  const {
    allEffectMetadata,
    all2DEffectMetadata,
    all3DEffectMetadata,
    addEffect,
    removeEffect,
    chooseEffectType,
  } = useManageEffects({
    effectsContainer,
    project,
    onEffectsUpdated: () => {
      onEffectsUpdated();
      forceUpdate();
    },
    onEffectAdded,
    onUpdate: forceUpdate,
    target,
  });

  const filteredEffectMetadata =
    layerRenderingType === '3d' ? all3DEffectMetadata : all2DEffectMetadata;

  const effects = mapFor(
    0,
    effectsContainer.getEffectsCount(),
    (index: number) => {
      const effect: gdEffect = effectsContainer.getEffectAt(index);
      const effectType = effect.getEffectType();
      const effectMetadata = getEnumeratedEffectMetadata(
        allEffectMetadata,
        effectType
      );
      return { effect, effectMetadata };
    }
  ).filter(
    ({ effectMetadata }) =>
      !effectMetadata ||
      (layerRenderingType !== '3d' &&
        !effectMetadata.isMarkedAsOnlyWorkingFor3D) ||
      (layerRenderingType !== '2d' &&
        !effectMetadata.isMarkedAsOnlyWorkingFor2D)
  );

  return (
    <TopLevelCollapsibleSection
      title={
        target === 'object' ? (
          <Trans>Effects</Trans>
        ) : layerRenderingType === '3d' ? (
          <Trans>3D effects</Trans>
        ) : (
          <Trans>2D effects</Trans>
        )
      }
      isFolded={isSectionFolded(layerRenderingType + '-effects')}
      toggleFolded={() => toggleSectionFolded(layerRenderingType + '-effects')}
      onOpenFullEditor={onOpenFullEditor}
      onAdd={() => {
        addEffect(layerRenderingType === '3d');
        setSectionFolded(layerRenderingType + '-effects', false);
      }}
      renderContent={() => (
        <ColumnStackLayout noMargin>
          {effects.length === 0 && (
            <Text size="body2" align="center" color="secondary">
              {target === 'object' ? (
                <Trans>
                  There are no{' '}
                  <Link
                    href={objectEffectsHelpLink}
                    onClick={() =>
                      Window.openExternalURL(objectEffectsHelpLink)
                    }
                  >
                    effects
                  </Link>{' '}
                  on this object.
                </Trans>
              ) : layerRenderingType === '3d' ? (
                <Trans>
                  There are no{' '}
                  <Link
                    href={layerEffectsHelpLink}
                    onClick={() => Window.openExternalURL(layerEffectsHelpLink)}
                  >
                    3D effects
                  </Link>{' '}
                  on this layer.
                </Trans>
              ) : (
                <Trans>
                  There are no{' '}
                  <Link
                    href={layerEffectsHelpLink}
                    onClick={() => Window.openExternalURL(layerEffectsHelpLink)}
                  >
                    2D effects
                  </Link>{' '}
                  on this layer.
                </Trans>
              )}
            </Text>
          )}
          {effects.map(({ effect, effectMetadata }) => (
            <CollapsibleSubPanel
              key={effect.ptr}
              renderContent={() => (
                <ColumnStackLayout noMargin expand noOverflowParent>
                  <CompactSelectField
                    value={effect.getEffectType()}
                    onChange={type => chooseEffectType(effect, type)}
                  >
                    {filteredEffectMetadata.map(effectMetadata => (
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
                  </CompactSelectField>
                  {effectMetadata && (
                    <CompactPropertiesEditorByVisibility
                      project={project}
                      schema={effectMetadata.parametersSchema}
                      instances={[effect]}
                      onInstancesModified={onEffectsUpdated}
                      resourceManagementProps={resourceManagementProps}
                      placeholder={
                        <Trans>Nothing to configure for this effect.</Trans>
                      }
                      onRefreshAllFields={forceUpdate}
                    />
                  )}
                </ColumnStackLayout>
              )}
              isFolded={effect.isFolded()}
              toggleFolded={() => {
                effect.setFolded(!effect.isFolded());
                forceUpdate();
              }}
              title={effect.getName()}
              titleBarButtons={[
                {
                  id: 'effect-visibility',
                  icon: effect.isEnabled() ? VisibilityIcon : VisibilityOffIcon,
                  label: effect.isEnabled() ? t`Hide effect` : t`Show effect`,
                  onClick: () => {
                    effect.setEnabled(!effect.isEnabled());
                    onEffectsUpdated();
                    forceUpdate();
                  },
                },
                {
                  id: 'remove-effect',
                  icon: RemoveIcon,
                  label: t`Remove effect`,
                  onClick: () => {
                    removeEffect(effect);
                    onEffectsUpdated();
                  },
                },
              ]}
            />
          ))}
        </ColumnStackLayout>
      )}
    />
  );
};
