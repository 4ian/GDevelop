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
import Help from '../../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import CompactTextField from '../../UI/CompactTextField';
import SquaredDoubleChevronArrowDown from '../../UI/CustomSvgIcons/SquaredDoubleChevronArrowDown';
import SquaredDoubleChevronArrowUp from '../../UI/CustomSvgIcons/SquaredDoubleChevronArrowUp';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import Link from '../../UI/Link';

const gd: libGDevelop = global.gd;

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

const behaviorsHelpLink = getHelpLink('/behaviors');
const effectsHelpLink = getHelpLink('/objects/effects');
const objectVariablesHelpLink = getHelpLink(
  '/all-features/variables/object-variables'
);

const CollapsibleSubPanel = ({
  renderContent,
  isFolded,
  toggleFolded,
  title,
  titleIcon,
  onRemove,
}: {|
  renderContent: () => React.Node,
  isFolded: boolean,
  toggleFolded: () => void,
  titleIcon?: ?React.Node,
  title: string,
  onRemove?: () => void,
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

          {onRemove ? (
            <Line noMargin>
              <IconButton
                tooltip={t`Remove behavior`}
                onClick={onRemove}
                size="small"
              >
                <Remove style={styles.icon} />
              </IconButton>
              <Spacer />
            </Line>
          ) : null}
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
  onAdd?: () => void,
|}) => (
  <>
    <Separator />
    <Column noOverflowParent>
      <LineStackLayout alignItems="center" justifyContent="space-between">
        <LineStackLayout noMargin alignItems="center">
          <IconButton size="small" onClick={toggleFolded}>
            {isFolded ? (
              <SquaredDoubleChevronArrowUp style={styles.icon} />
            ) : (
              <SquaredDoubleChevronArrowDown style={styles.icon} />
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
  const [isPropertiesFolded, setIsPropertiesFolded] = React.useState(false);
  const [isBehaviorsFolded, setIsBehaviorsFolded] = React.useState(false);
  const [isVariablesFolded, setIsVariablesFolded] = React.useState(false);
  const [isEffectsFolded, setIsEffectsFolded] = React.useState(false);
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
      const objectBasicPropertiesSchema = propertiesMapToSchema({
        properties,
        getProperties: ({ object, objectConfiguration }) =>
          objectConfiguration.getProperties(),
        onUpdateProperty: ({ object, objectConfiguration }, name, value) =>
          objectConfiguration.updateProperty(name, value),
        visibility: 'Basic',
      });

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
      return propertiesMapToSchema({
        properties,
        getProperties: ({ object, objectConfiguration }) =>
          objectConfiguration.getProperties(),
        onUpdateProperty: ({ object, objectConfiguration }, name, value) =>
          objectConfiguration.updateProperty(name, value),
        visibility: 'Advanced',
      });
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

  const helpLink = getHelpLink(objectMetadata.getHelpPath());

  const openFullEditor = React.useCallback(
    () => onEditObject(object, 'properties'),
    [object, onEditObject]
  );

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
          <ColumnStackLayout expand noOverflowParent>
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
                  <Trans>{objectMetadata.getFullName()}</Trans>
                </Text>
                {helpLink && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      Window.openExternalURL(helpLink);
                    }}
                  >
                    <Help style={styles.icon} />
                  </IconButton>
                )}
              </LineStackLayout>
            </LineStackLayout>
            <CompactTextField
              value={object.getName()}
              onChange={() => {}}
              disabled
            />
          </ColumnStackLayout>
          <TopLevelCollapsibleSection
            title={<Trans>Properties</Trans>}
            isFolded={isPropertiesFolded}
            toggleFolded={() => setIsPropertiesFolded(!isPropertiesFolded)}
            onOpenFullEditor={openFullEditor}
            renderContent={() => (
              <ColumnStackLayout noMargin noOverflowParent>
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
                  mapFor(
                    0,
                    eventsBasedObject.getObjects().getObjectsCount(),
                    i => {
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
                              customObjectConfiguration={
                                customObjectConfiguration
                              }
                              childObject={childObject}
                              onRefreshAllFields={forceRecomputeSchema}
                              onEditObject={openFullEditor}
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
                          title={childObjectName}
                        />
                      );
                    }
                  )}
              </ColumnStackLayout>
            )}
          />
          <TopLevelCollapsibleSection
            title={<Trans>Behaviors</Trans>}
            isFolded={isBehaviorsFolded}
            toggleFolded={() => setIsBehaviorsFolded(!isBehaviorsFolded)}
            onOpenFullEditor={() => onEditObject(object, 'behaviors')}
            onAdd={openNewBehaviorDialog}
            renderContent={() => (
              <ColumnStackLayout noMargin>
                {!allVisibleBehaviors.length && (
                  <Text size="body2" align="center" color="secondary">
                    <Trans>
                      There are no{' '}
                      <Link
                        href={behaviorsHelpLink}
                        onClick={() =>
                          Window.openExternalURL(behaviorsHelpLink)
                        }
                      >
                        behaviors
                      </Link>{' '}
                      on this object.
                    </Trans>
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
                          behaviorMetadata={behaviorMetadata}
                          behavior={behavior}
                          object={object}
                          onBehaviorUpdated={() => {}}
                          resourceManagementProps={resourceManagementProps}
                          onOpenFullEditor={() =>
                            onEditObject(object, 'behaviors')
                          }
                        />
                      )}
                      isFolded={behavior.isFolded()}
                      toggleFolded={() => {
                        behavior.setFolded(!behavior.isFolded());
                        forceUpdate();
                      }}
                      titleIcon={
                        iconUrl ? (
                          <IconContainer
                            src={iconUrl}
                            alt={behaviorMetadata.getFullName()}
                            size={16}
                          />
                        ) : null
                      }
                      title={behavior.getName()}
                      onRemove={() => {
                        removeBehavior(behavior.getName());
                      }}
                    />
                  );
                })}
              </ColumnStackLayout>
            )}
          />
          <TopLevelCollapsibleSection
            title={<Trans>Object Variables</Trans>}
            isFolded={isVariablesFolded}
            toggleFolded={() => setIsVariablesFolded(!isVariablesFolded)}
            onOpenFullEditor={() => onEditObject(object, 'variables')}
            onAdd={() => {
              if (variablesListRef.current) {
                variablesListRef.current.addVariable();
              }
              setIsVariablesFolded(false);
            }}
            renderContentAsHiddenWhenFolded={
              true /* Allows to keep a ref to the variables list for add button to work. */
            }
            noContentMargin
            renderContent={() => (
              <VariablesList
                ref={variablesListRef}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                directlyStoreValueChangesWhileEditing
                variablesContainer={object.getVariables()}
                areObjectVariables
                size="compact"
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
                compactEmptyPlaceholderText={
                  <Trans>
                    There are no{' '}
                    <Link
                      href={objectVariablesHelpLink}
                      onClick={() =>
                        Window.openExternalURL(objectVariablesHelpLink)
                      }
                    >
                      variables
                    </Link>{' '}
                    on this object.
                  </Trans>
                }
              />
            )}
          />
          {objectMetadata &&
            objectMetadata.hasDefaultBehavior(
              'EffectCapability::EffectBehavior'
            ) && (
              <TopLevelCollapsibleSection
                title={<Trans>Effects</Trans>}
                isFolded={isEffectsFolded}
                toggleFolded={() => setIsEffectsFolded(!isEffectsFolded)}
                onOpenFullEditor={() => onEditObject(object, 'effects')}
                onAdd={() => addEffect(false)}
                renderContent={() => (
                  <ColumnStackLayout noMargin>
                    {effectsContainer.getEffectsCount() === 0 && (
                      <Text size="body2" align="center" color="secondary">
                        <Trans>
                          There are no{' '}
                          <Link
                            href={effectsHelpLink}
                            onClick={() =>
                              Window.openExternalURL(effectsHelpLink)
                            }
                          >
                            effects
                          </Link>{' '}
                          on this object.
                        </Trans>
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
                              <ColumnStackLayout
                                noMargin
                                expand
                                noOverflowParent
                              >
                                <CompactSelectField
                                  value={effectType}
                                  onChange={type =>
                                    chooseEffectType(effect, type)
                                  }
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
                                  resourceManagementProps={
                                    resourceManagementProps
                                  }
                                />
                              </ColumnStackLayout>
                            )}
                            isFolded={effect.isFolded()}
                            toggleFolded={() => {
                              effect.setFolded(!effect.isFolded());
                              forceUpdate();
                            }}
                            title={effect.getName()}
                            onRemove={() => {
                              removeEffect(effect);
                            }}
                          />
                        );
                      }
                    )}
                  </ColumnStackLayout>
                )}
              />
            )}
        </Column>
      </ScrollView>
      {newBehaviorDialog}
    </ErrorBoundary>
  );
};
