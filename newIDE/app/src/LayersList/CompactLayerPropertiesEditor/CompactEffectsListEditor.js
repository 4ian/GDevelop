// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { type ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { Column, Line, Spacer, marginsSize } from '../../UI/Grid';
import { Separator } from '../../CompactPropertiesEditor';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import Paper from '../../UI/Paper';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import RemoveIcon from '../../UI/CustomSvgIcons/Remove';
import VisibilityIcon from '../../UI/CustomSvgIcons/Visibility';
import VisibilityOffIcon from '../../UI/CustomSvgIcons/VisibilityOff';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowDownWithRoundedBorder from '../../UI/CustomSvgIcons/ChevronArrowDownWithRoundedBorder';
import ChevronArrowRightWithRoundedBorder from '../../UI/CustomSvgIcons/ChevronArrowRightWithRoundedBorder';
import Add from '../../UI/CustomSvgIcons/Add';
import { CompactEffectPropertiesEditor } from '../../EffectsList/CompactEffectPropertiesEditor';
import { mapFor } from '../../Utils/MapFor';
import {
  getEnumeratedEffectMetadata,
  useManageEffects,
} from '../../EffectsList';
import CompactSelectField from '../../UI/CompactSelectField';
import SelectOption from '../../UI/SelectOption';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import Link from '../../UI/Link';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

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

type TitleBarButton = {|
  id: string,
  icon: any,
  label?: MessageDescriptor,
  onClick?: () => void,
|};

const CollapsibleSubPanel = ({
  renderContent,
  isFolded,
  toggleFolded,
  title,
  titleIcon,
  titleBarButtons,
}: {|
  renderContent: () => React.Node,
  isFolded: boolean,
  toggleFolded: () => void,
  titleIcon?: ?React.Node,
  title: string,
  titleBarButtons?: Array<TitleBarButton>,
|}) => (
  <Paper background="medium">
    <Line expand>
      <ColumnStackLayout noMargin expand noOverflowParent>
        <LineStackLayout noMargin justifyContent="space-between">
          <Line noMargin alignItems="center">
            <IconButton onClick={toggleFolded} size="small">
              {isFolded ? (
                <ChevronArrowRight style={styles.icon} />
              ) : (
                <ChevronArrowBottom style={styles.icon} />
              )}
            </IconButton>

            {titleIcon}
            {titleIcon && <Spacer />}
            <Text noMargin size="body" style={textEllipsisStyle}>
              {title}
            </Text>
          </Line>
          <Line noMargin>
            {titleBarButtons &&
              titleBarButtons.map(button => {
                const Icon = button.icon;
                return (
                  <IconButton
                    key={button.id}
                    id={button.id}
                    tooltip={button.label}
                    onClick={button.onClick}
                    size="small"
                  >
                    <Icon style={styles.icon} />
                  </IconButton>
                );
              })}
            <Spacer />
          </Line>
        </LineStackLayout>
        {isFolded ? null : (
          <div style={styles.subPanelContentContainer}>{renderContent()}</div>
        )}
      </ColumnStackLayout>
    </Line>
  </Paper>
);

const TopLevelCollapsibleSection = ({
  title,
  isFolded,
  toggleFolded,
  renderContent,
  renderContentAsHiddenWhenFolded,
  noContentMargin,
  onOpenFullEditor,
  onAdd,
}: {|
  title: React.Node,
  isFolded: boolean,
  toggleFolded: () => void,
  renderContent: () => React.Node,
  renderContentAsHiddenWhenFolded?: boolean,
  noContentMargin?: boolean,
  onOpenFullEditor: () => void,
  onAdd?: (() => void) | null,
|}) => (
  <>
    <Separator />
    <Column noOverflowParent>
      <LineStackLayout alignItems="center" justifyContent="space-between">
        <LineStackLayout noMargin alignItems="center">
          <IconButton size="small" onClick={toggleFolded}>
            {isFolded ? (
              <ChevronArrowRightWithRoundedBorder style={styles.icon} />
            ) : (
              <ChevronArrowDownWithRoundedBorder style={styles.icon} />
            )}
          </IconButton>
          <Text size="sub-title" noMargin style={textEllipsisStyle}>
            {title}
          </Text>
        </LineStackLayout>
        <Line alignItems="center" noMargin>
          <IconButton size="small" onClick={onOpenFullEditor}>
            <ShareExternal style={styles.icon} />
          </IconButton>
          {onAdd && (
            <IconButton size="small" onClick={onAdd}>
              <Add style={styles.icon} />
            </IconButton>
          )}
        </Line>
      </LineStackLayout>
    </Column>
    <Column noMargin={noContentMargin}>
      {isFolded ? (
        renderContentAsHiddenWhenFolded ? (
          <div style={styles.hiddenContent}>{renderContent()}</div>
        ) : null
      ) : (
        renderContent()
      )}
    </Column>
  </>
);

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
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [isEffectsFolded, setEffectsFolded] = React.useState(false);

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
      isFolded={isEffectsFolded}
      toggleFolded={() => setEffectsFolded(!isEffectsFolded)}
      onOpenFullEditor={onOpenFullEditor}
      onAdd={() => addEffect(layerRenderingType === '3d')}
      renderContent={() => (
        <ColumnStackLayout noMargin>
          {effectsContainer.getEffectsCount() === 0 && (
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
          {mapFor(0, effectsContainer.getEffectsCount(), (index: number) => {
            const effect: gdEffect = effectsContainer.getEffectAt(index);
            const effectType = effect.getEffectType();
            const effectMetadata = getEnumeratedEffectMetadata(
              allEffectMetadata,
              effectType
            );

            return !effectMetadata ||
              (layerRenderingType !== '3d' &&
                !effectMetadata.isMarkedAsOnlyWorkingFor3D) ||
              (layerRenderingType !== '2d' &&
                !effectMetadata.isMarkedAsOnlyWorkingFor2D) ? (
              <CollapsibleSubPanel
                key={effect.ptr}
                renderContent={() => (
                  <ColumnStackLayout noMargin expand noOverflowParent>
                    <CompactSelectField
                      value={effectType}
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
                    <CompactEffectPropertiesEditor
                      project={project}
                      effect={effect}
                      effectMetadata={effectMetadata}
                      resourceManagementProps={resourceManagementProps}
                      onPropertyModified={onEffectsUpdated}
                    />
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
                    icon: effect.isEnabled()
                      ? VisibilityIcon
                      : VisibilityOffIcon,
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
            ) : null;
          })}
        </ColumnStackLayout>
      )}
    />
  );
};
