// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import VariablesList, {
  type HistoryHandler,
  type VariablesListInterface,
} from '../../VariablesList/VariablesList';
import { type ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import ErrorBoundary from '../../UI/ErrorBoundary';
import ScrollView from '../../UI/ScrollView';
import { Column, Line, Spacer, marginsSize } from '../../UI/Grid';
import CompactPropertiesEditor, {
  Separator,
} from '../../CompactPropertiesEditor';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';
import propertiesMapToSchema from '../../CompactPropertiesEditor/PropertiesMapToCompactSchema';
import { type ObjectEditorTab } from '../../ObjectEditor/ObjectEditorDialog';
import { CompactBehaviorPropertiesEditor } from './CompactBehaviorPropertiesEditor';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import Paper from '../../UI/Paper';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import { IconContainer } from '../../UI/IconContainer';
import Remove from '../../UI/CustomSvgIcons/Remove';
import useForceUpdate, { useForceRecompute } from '../../Utils/UseForceUpdate';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import Add from '../../UI/CustomSvgIcons/Add';
import { useManageObjectBehaviors } from '../../BehaviorsEditor';
import Object3d from '../../UI/CustomSvgIcons/Object3d';
import Object2d from '../../UI/CustomSvgIcons/Object2d';
import { CompactEffectPropertiesEditor } from '../../EffectsList/CompactEffectPropertiesEditor';
import { mapFor } from '../../Utils/MapFor';
import {
  getEnumeratedEffectMetadata,
  useManageEffects,
} from '../../EffectsList';
import CompactSelectField from '../../UI/CompactSelectField';
import SelectOption from '../../UI/SelectOption';
import { ChildObjectPropertiesEditor } from './ChildObjectPropertiesEditor';
import { getSchemaWithOpenFullEditorButton } from './CompactObjectPropertiesSchema';
import FlatButton from '../../UI/FlatButton';
import ChevronArrowTop from '../../UI/CustomSvgIcons/ChevronArrowTop';

const gd: libGDevelop = global.gd;

export const styles = {
  icon: {
    fontSize: 18,
  },
  scrollView: { paddingTop: marginsSize },
};

const CollapsibleSubPanel = ({
  renderContent,
  isFolded,
  toggleFolded,
  title,
  onRemove,
}: {|
  renderContent: () => React.Node,
  isFolded: boolean,
  toggleFolded: () => void,
  title: React.Node,
  onRemove?: () => void,
|}) => (
  <Paper background="medium">
    <Line expand>
      <ColumnStackLayout expand noOverflowParent>
        <LineStackLayout noMargin justifyContent="space-between">
          <Line noMargin alignItems="center">
            <IconButton onClick={toggleFolded} size="small">
              {isFolded ? (
                <ChevronArrowRight style={styles.icon} />
              ) : (
                <ChevronArrowBottom style={styles.icon} />
              )}
            </IconButton>

            {title}
          </Line>

          {onRemove ? (
            <IconButton
              tooltip={t`Remove behavior`}
              onClick={onRemove}
              size="small"
            >
              <Remove style={styles.icon} />
            </IconButton>
          ) : null}
        </LineStackLayout>
        {isFolded ? null : renderContent()}
      </ColumnStackLayout>
    </Line>
  </Paper>
);

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  layout?: ?gdLayout,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  onUpdateBehaviorsSharedData: () => void,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,

  objects: Array<gdObject>,
  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
|};

export const CompactObjectPropertiesEditor = ({
  project,
  resourceManagementProps,
  layout,
  eventsFunctionsExtension,
  onUpdateBehaviorsSharedData,
  objectsContainer,
  globalObjectsContainer,
  layersContainer,
  projectScopedContainersAccessor,
  unsavedChanges,
  i18n,
  historyHandler,
  objects,
  onEditObject,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [
    showObjectAdvancedOptions,
    setShowObjectAdvancedOptions,
  ] = React.useState(false);
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();
  const variablesListRef = React.useRef<?VariablesListInterface>(null);
  const object = objects[0];
  const objectConfiguration = object.getConfiguration();

  // Don't use a memo for this because metadata from custom objects are built
  // from event-based object when extensions are refreshed after an extension
  // installation.
  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    object.getType()
  );
  const is3DObject = !!objectMetadata && objectMetadata.isRenderedIn3D();
  const fullEditorLabel = objectMetadata
    ? objectMetadata.getOpenFullEditorLabel()
    : null;

  // TODO: Workaround a bad design of ObjectJsImplementation. When getProperties
  // and associated methods are redefined in JS, they have different arguments (
  // see ObjectJsImplementation C++ implementation). If called directly here from JS,
  // the arguments will be mismatched. To workaround this, always cast the object to
  // a base gdObject to ensure C++ methods are called.
  const objectConfigurationAsGd = gd.castObject(
    objectConfiguration,
    gd.ObjectConfiguration
  );

  // Properties:
  const objectBasicPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }

      const properties = objectConfigurationAsGd.getProperties();
      const objectBasicPropertiesSchema = propertiesMapToSchema(
        properties,
        ({ object, objectConfiguration }) =>
          objectConfiguration.getProperties(),
        ({ object, objectConfiguration }, name, value) =>
          objectConfiguration.updateProperty(name, value),
        null,
        'Basic'
      );

      return getSchemaWithOpenFullEditorButton({
        schema: objectBasicPropertiesSchema,
        fullEditorLabel,
        object,
        onEditObject,
      });
    },
    [
      objectConfigurationAsGd,
      schemaRecomputeTrigger,
      fullEditorLabel,
      object,
      onEditObject,
    ]
  );
  const objectAdvancedPropertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }

      const properties = objectConfigurationAsGd.getProperties();
      return propertiesMapToSchema(
        properties,
        ({ object, objectConfiguration }) =>
          objectConfiguration.getProperties(),
        ({ object, objectConfiguration }, name, value) =>
          objectConfiguration.updateProperty(name, value),
        null,
        'Advanced'
      );
    },
    [objectConfigurationAsGd, schemaRecomputeTrigger]
  );
  const hasObjectAdvancedProperties = objectAdvancedPropertiesSchema.length > 0;
  const hasSomeObjectProperties =
    objectBasicPropertiesSchema.length > 0 || hasObjectAdvancedProperties;

  // Behaviors:
  const {
    openNewBehaviorDialog,
    newBehaviorDialog,
    removeBehavior,
  } = useManageObjectBehaviors({
    project,
    object,
    eventsFunctionsExtension,
    onUpdate: forceUpdate,
    onBehaviorsUpdated: forceUpdate,
    onUpdateBehaviorsSharedData,
  });

  const allVisibleBehaviors = object
    .getAllBehaviorNames()
    .toJSArray()
    .map(behaviorName => object.getBehavior(behaviorName))
    .filter(behavior => !behavior.isDefaultBehavior());

  // Effects:
  const effectsContainer = object.getEffects();
  const {
    allEffectMetadata,
    all2DEffectMetadata,
    addEffect,
    removeEffect,
    chooseEffectType,
  } = useManageEffects({
    effectsContainer,
    project,
    onEffectsUpdated: forceUpdate,
    onUpdate: forceUpdate,
    target: 'object',
  });

  // Events based object children:
  const eventsBasedObject = project.hasEventsBasedObject(
    objectConfiguration.getType()
  )
    ? project.getEventsBasedObject(objectConfiguration.getType())
    : null;
  const customObjectConfiguration = eventsBasedObject
    ? gd.asCustomObjectConfiguration(objectConfiguration)
    : null;

  const shouldDisplayEventsBasedObjectChildren =
    customObjectConfiguration &&
    (customObjectConfiguration.isForcedToOverrideEventsBasedObjectChildrenConfiguration() ||
      customObjectConfiguration.isMarkedAsOverridingEventsBasedObjectChildrenConfiguration());

  return (
    <ErrorBoundary
      componentTitle={<Trans>Object properties</Trans>}
      scope="scene-editor-object-properties"
    >
      <ScrollView
        autoHideScrollbar
        style={styles.scrollView}
        key={objects.map((instance: gdObject) => '' + instance.ptr).join(';')}
      >
        <Column expand noMargin id="object-properties-editor" noOverflowParent>
          <ColumnStackLayout noOverflowParent>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
            >
              <LineStackLayout noMargin alignItems="center">
                {is3DObject ? (
                  <Object3d style={styles.icon} />
                ) : (
                  <Object2d style={styles.icon} />
                )}
                <Text size="body" noMargin>
                  <Trans>Object - {object.getName()}</Trans>
                </Text>
              </LineStackLayout>
              <IconButton
                size="small"
                onClick={() => {
                  onEditObject(object);
                }}
              >
                <ShareExternal style={styles.icon} />
              </IconButton>
            </LineStackLayout>
            {!hasSomeObjectProperties && (
              <Text size="body2" align="center" color="secondary">
                <Trans>This object has no properties.</Trans>
              </Text>
            )}
            {hasSomeObjectProperties && (
              <CompactPropertiesEditor
                project={project}
                resourceManagementProps={resourceManagementProps}
                unsavedChanges={unsavedChanges}
                schema={objectBasicPropertiesSchema}
                instances={[
                  { object, objectConfiguration: objectConfigurationAsGd },
                ]}
                onInstancesModified={() => {
                  // TODO: undo/redo?
                }}
                onRefreshAllFields={forceRecomputeSchema}
              />
            )}
            {!showObjectAdvancedOptions && hasObjectAdvancedProperties && (
              <FlatButton
                fullWidth
                primary
                leftIcon={<ChevronArrowRight />}
                label={<Trans>Show more</Trans>}
                onClick={() => {
                  setShowObjectAdvancedOptions(true);
                }}
              />
            )}
            {showObjectAdvancedOptions && hasObjectAdvancedProperties && (
              <CompactPropertiesEditor
                project={project}
                resourceManagementProps={resourceManagementProps}
                unsavedChanges={unsavedChanges}
                schema={objectAdvancedPropertiesSchema}
                instances={[
                  { object, objectConfiguration: objectConfigurationAsGd },
                ]}
                onInstancesModified={() => {
                  // TODO: undo/redo?
                }}
                onRefreshAllFields={forceRecomputeSchema}
              />
            )}
            {showObjectAdvancedOptions && hasObjectAdvancedProperties && (
              <FlatButton
                fullWidth
                primary
                leftIcon={<ChevronArrowTop />}
                label={<Trans>Show less</Trans>}
                onClick={() => {
                  setShowObjectAdvancedOptions(false);
                }}
              />
            )}
            {eventsBasedObject &&
              customObjectConfiguration &&
              shouldDisplayEventsBasedObjectChildren &&
              mapFor(0, eventsBasedObject.getObjects().getObjectsCount(), i => {
                const childObject = eventsBasedObject
                  .getObjects()
                  .getObjectAt(i);
                const childObjectName = childObject.getName();
                const isFolded = customObjectConfiguration.isChildObjectFolded(
                  childObjectName
                );
                return (
                  <CollapsibleSubPanel
                    key={i}
                    renderContent={() => (
                      <ChildObjectPropertiesEditor
                        key={i}
                        project={project}
                        resourceManagementProps={resourceManagementProps}
                        unsavedChanges={unsavedChanges}
                        eventsBasedObject={eventsBasedObject}
                        customObjectConfiguration={customObjectConfiguration}
                        childObject={childObject}
                        onRefreshAllFields={forceRecomputeSchema}
                      />
                    )}
                    isFolded={isFolded}
                    toggleFolded={() => {
                      customObjectConfiguration.setChildObjectFolded(
                        childObjectName,
                        !isFolded
                      );
                      forceUpdate();
                    }}
                    title={
                      <Text noMargin size="body">
                        {childObjectName}
                      </Text>
                    }
                  />
                );
              })}
          </ColumnStackLayout>
          <Column>
            <Separator />
            <Line alignItems="center" justifyContent="space-between">
              <Text size="sub-title" noMargin>
                <Trans>Behaviors</Trans>
              </Text>
              <Line alignItems="center" noMargin>
                <IconButton
                  size="small"
                  onClick={() => {
                    onEditObject(object, 'behaviors');
                  }}
                >
                  <ShareExternal style={styles.icon} />
                </IconButton>
                <IconButton size="small" onClick={openNewBehaviorDialog}>
                  <Add style={styles.icon} />
                </IconButton>
              </Line>
            </Line>
          </Column>
          <ColumnStackLayout>
            {!allVisibleBehaviors.length && (
              <Text size="body2" align="center" color="secondary">
                <Trans>There are no behaviors on this object.</Trans>
              </Text>
            )}
            {allVisibleBehaviors.map(behavior => {
              const behaviorTypeName = behavior.getTypeName();
              const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
                gd.JsPlatform.get(),
                behaviorTypeName
              );

              const iconUrl = behaviorMetadata.getIconFilename();

              return (
                <CollapsibleSubPanel
                  key={behavior.ptr}
                  renderContent={() => (
                    <CompactBehaviorPropertiesEditor
                      project={project}
                      behavior={behavior}
                      object={object}
                      onBehaviorUpdated={() => {}}
                      resourceManagementProps={resourceManagementProps}
                    />
                  )}
                  isFolded={behavior.isFolded()}
                  toggleFolded={() => {
                    behavior.setFolded(!behavior.isFolded());
                    forceUpdate();
                  }}
                  title={
                    <>
                      {iconUrl ? (
                        <IconContainer
                          src={iconUrl}
                          alt={behaviorMetadata.getFullName()}
                          size={16}
                        />
                      ) : null}
                      <Spacer />
                      <Text noMargin size="body">
                        {behavior.getName()}
                      </Text>
                    </>
                  }
                  onRemove={() => {
                    removeBehavior(behavior.getName());
                  }}
                />
              );
            })}
          </ColumnStackLayout>
          <Column>
            <Separator />
            <Line alignItems="center" justifyContent="space-between">
              <Text size="sub-title" noMargin>
                <Trans>Object Variables</Trans>
              </Text>
              <Line alignItems="center" noMargin>
                <IconButton
                  size="small"
                  onClick={() => {
                    onEditObject(object, 'variables');
                  }}
                >
                  <ShareExternal style={styles.icon} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={
                    variablesListRef.current
                      ? variablesListRef.current.addVariable
                      : undefined
                  }
                >
                  <Add style={styles.icon} />
                </IconButton>
              </Line>
            </Line>
          </Column>
          <VariablesList
            ref={variablesListRef}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            directlyStoreValueChangesWhileEditing
            variablesContainer={object.getVariables()}
            areObjectVariables
            size="small"
            onComputeAllVariableNames={() =>
              object && layout
                ? EventsRootVariablesFinder.findAllObjectVariables(
                    project.getCurrentPlatform(),
                    project,
                    layout,
                    object.getName()
                  )
                : []
            }
            historyHandler={historyHandler}
            toolbarIconStyle={styles.icon}
          />
        </Column>
        {objectMetadata &&
          objectMetadata.hasDefaultBehavior(
            'EffectCapability::EffectBehavior'
          ) && (
            <>
              <Column>
                <Separator />
                <Line alignItems="center" justifyContent="space-between">
                  <Text size="sub-title" noMargin>
                    <Trans>Effects</Trans>
                  </Text>
                  <Line alignItems="center" noMargin>
                    <IconButton
                      size="small"
                      onClick={() => {
                        onEditObject(object, 'effects');
                      }}
                    >
                      <ShareExternal style={styles.icon} />
                    </IconButton>
                    <IconButton size="small" onClick={() => addEffect(false)}>
                      <Add style={styles.icon} />
                    </IconButton>
                  </Line>
                </Line>
              </Column>
              <ColumnStackLayout>
                {effectsContainer.getEffectsCount() === 0 && (
                  <Text size="body2" align="center" color="secondary">
                    <Trans>There are no effects on this object.</Trans>
                  </Text>
                )}
                {mapFor(
                  0,
                  effectsContainer.getEffectsCount(),
                  (index: number) => {
                    const effect: gdEffect = effectsContainer.getEffectAt(
                      index
                    );
                    const effectType = effect.getEffectType();
                    const effectMetadata = getEnumeratedEffectMetadata(
                      allEffectMetadata,
                      effectType
                    );

                    return (
                      <CollapsibleSubPanel
                        key={effect.ptr}
                        renderContent={() => (
                          <ColumnStackLayout expand noOverflowParent>
                            <CompactSelectField
                              value={effectType}
                              onChange={type => chooseEffectType(effect, type)}
                            >
                              {all2DEffectMetadata.map(effectMetadata => (
                                <SelectOption
                                  key={effectMetadata.type}
                                  value={effectMetadata.type}
                                  label={effectMetadata.fullName}
                                  disabled={
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
                            />
                          </ColumnStackLayout>
                        )}
                        isFolded={effect.isFolded()}
                        toggleFolded={() => {
                          effect.setFolded(!effect.isFolded());
                          forceUpdate();
                        }}
                        title={
                          <Text noMargin size="body">
                            {effect.getName()}
                          </Text>
                        }
                        onRemove={() => {
                          removeEffect(effect);
                        }}
                      />
                    );
                  }
                )}
              </ColumnStackLayout>
            </>
          )}
      </ScrollView>
      {newBehaviorDialog}
    </ErrorBoundary>
  );
};
