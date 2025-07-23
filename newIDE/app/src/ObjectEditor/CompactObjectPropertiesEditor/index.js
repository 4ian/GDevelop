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
import ChevronArrowTop from '../../UI/CustomSvgIcons/ChevronArrowTop';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowDownWithRoundedBorder from '../../UI/CustomSvgIcons/ChevronArrowDownWithRoundedBorder';
import ChevronArrowRightWithRoundedBorder from '../../UI/CustomSvgIcons/ChevronArrowRightWithRoundedBorder';
import Add from '../../UI/CustomSvgIcons/Add';
import Trash from '../../UI/CustomSvgIcons/Trash';
import Edit from '../../UI/CustomSvgIcons/ShareExternal';
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
import Help from '../../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import CompactTextField from '../../UI/CompactTextField';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import Link from '../../UI/Link';
import {
  getVariantName,
  isVariantEditable,
  duplicateVariant,
  deleteVariant,
} from '../Editors/CustomObjectPropertiesEditor';
import NewVariantDialog from '../Editors/CustomObjectPropertiesEditor/NewVariantDialog';
import useAlertDialog from '../../UI/Alert/useAlertDialog';

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
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  onDeleteEventsBasedObjectVariant: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  isVariableListLocked: boolean,
  isBehaviorListLocked: boolean,
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
  onOpenEventBasedObjectVariantEditor,
  onDeleteEventsBasedObjectVariant,
  onExtensionInstalled,
  isVariableListLocked,
  isBehaviorListLocked,
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
  const [newVariantDialogOpen, setNewVariantDialogOpen] = React.useState(false);
  const [
    duplicateAndEditVariantDialogOpen,
    setDuplicateAndEditVariantDialogOpen,
  ] = React.useState(false);
  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();
  const { showDeleteConfirmation } = useAlertDialog();
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
    onExtensionInstalled,
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
  const customObjectEventsBasedObject = project.hasEventsBasedObject(
    objectConfiguration.getType()
  )
    ? project.getEventsBasedObject(objectConfiguration.getType())
    : null;
  const customObjectConfiguration = customObjectEventsBasedObject
    ? gd.asCustomObjectConfiguration(objectConfiguration)
    : null;
  const variantName = customObjectConfiguration
    ? getVariantName(customObjectEventsBasedObject, customObjectConfiguration)
    : '';

  const customObjectExtensionName = customObjectConfiguration
    ? gd.PlatformExtension.getExtensionFromFullObjectType(
        customObjectConfiguration.getType()
      )
    : null;
  const customObjectExtension =
    customObjectExtensionName &&
    project.hasEventsFunctionsExtensionNamed(customObjectExtensionName)
      ? project.getEventsFunctionsExtension(customObjectExtensionName)
      : null;

  const shouldDisplayEventsBasedObjectChildren =
    customObjectConfiguration &&
    (customObjectConfiguration.isForcedToOverrideEventsBasedObjectChildrenConfiguration() ||
      (!variantName &&
        customObjectConfiguration.isMarkedAsOverridingEventsBasedObjectChildrenConfiguration()));
  const shouldDisplayVariant = customObjectConfiguration
    ? !customObjectConfiguration.isForcedToOverrideEventsBasedObjectChildrenConfiguration()
    : false;

  const helpLink = getHelpLink(objectMetadata.getHelpPath());

  const openFullEditor = React.useCallback(
    () => onEditObject(object, 'properties'),
    [object, onEditObject]
  );

  const editVariant = React.useCallback(
    () => {
      if (
        !isVariantEditable(
          customObjectConfiguration,
          customObjectEventsBasedObject,
          customObjectExtension
        )
      ) {
        setDuplicateAndEditVariantDialogOpen(true);
        return;
      }
      customObjectExtension &&
        customObjectEventsBasedObject &&
        customObjectConfiguration &&
        onOpenEventBasedObjectVariantEditor &&
        onOpenEventBasedObjectVariantEditor(
          customObjectExtension.getName(),
          customObjectEventsBasedObject.getName(),
          customObjectConfiguration.getVariantName()
        );
    },
    [
      customObjectConfiguration,
      onOpenEventBasedObjectVariantEditor,
      customObjectExtension,
      customObjectEventsBasedObject,
    ]
  );

  const doDuplicateVariant = React.useCallback(
    (i18n: I18nType, newName: string) => {
      duplicateVariant(
        newName,
        customObjectConfiguration,
        customObjectEventsBasedObject,
        customObjectExtension,
        project,
        i18n
      );
      setNewVariantDialogOpen(false);
      forceUpdate();
    },
    [
      customObjectConfiguration,
      customObjectEventsBasedObject,
      customObjectExtension,
      forceUpdate,
      project,
    ]
  );

  const duplicateAndEditVariant = React.useCallback(
    (i18n: I18nType, newName: string) => {
      duplicateVariant(
        newName,
        customObjectConfiguration,
        customObjectEventsBasedObject,
        customObjectExtension,
        project,
        i18n
      );
      setDuplicateAndEditVariantDialogOpen(false);
      forceUpdate();
      editVariant();
    },
    [
      customObjectConfiguration,
      customObjectEventsBasedObject,
      customObjectExtension,
      forceUpdate,
      project,
      editVariant,
    ]
  );

  const doDeleteVariant = React.useCallback(
    async () => {
      const hasConfirmedDeletion = await showDeleteConfirmation({
        title: t`Remove variant`,
        message: t`Are you sure you want to remove this variant from your project? This can't be undone.`,
      });
      if (!hasConfirmedDeletion) {
        return;
      }
      deleteVariant(
        customObjectConfiguration,
        customObjectEventsBasedObject,
        customObjectExtension,
        project,
        onDeleteEventsBasedObjectVariant
      );
      forceUpdate();
    },
    [
      customObjectConfiguration,
      customObjectEventsBasedObject,
      forceUpdate,
      onDeleteEventsBasedObjectVariant,
      project,
      customObjectExtension,
      showDeleteConfirmation,
    ]
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
                    leftIcon={<ChevronArrowRight style={styles.icon} />}
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
                    leftIcon={<ChevronArrowTop style={styles.icon} />}
                    label={<Trans>Show less</Trans>}
                    onClick={() => {
                      setShowObjectAdvancedOptions(false);
                    }}
                  />
                )}
                {shouldDisplayVariant && (
                  <ColumnStackLayout noMargin noOverflowParent>
                    <LineStackLayout noMargin justifyContent="space-between">
                      <Text size="body" noMargin>
                        <Trans>Variant</Trans>
                      </Text>
                      <LineStackLayout noMargin>
                        <IconButton
                          key={'delete-variant'}
                          size="small"
                          onClick={doDeleteVariant}
                          disabled={!variantName}
                        >
                          <Trash style={styles.icon} />
                        </IconButton>
                        <IconButton
                          key={'duplicate-variant'}
                          size="small"
                          onClick={() => setNewVariantDialogOpen(true)}
                        >
                          <Add style={styles.icon} />
                        </IconButton>
                        <IconButton
                          key={'edit-variant'}
                          size="small"
                          onClick={editVariant}
                        >
                          <Edit style={styles.icon} />
                        </IconButton>
                      </LineStackLayout>
                    </LineStackLayout>
                    <CompactSelectField
                      key={'variant-name'}
                      value={variantName}
                      onChange={(newValue: string) => {
                        customObjectConfiguration &&
                          customObjectConfiguration.setVariantName(newValue);
                        forceUpdate();
                      }}
                    >
                      <SelectOption
                        key="default-variant"
                        value=""
                        label={t`Default`}
                      />
                      {customObjectEventsBasedObject &&
                        mapFor(
                          0,
                          customObjectEventsBasedObject
                            .getVariants()
                            .getVariantsCount(),
                          i => {
                            if (!customObjectEventsBasedObject) {
                              return null;
                            }
                            const variant = customObjectEventsBasedObject
                              .getVariants()
                              .getVariantAt(i);
                            return (
                              <SelectOption
                                key={'variant-' + variant.getName()}
                                value={variant.getName()}
                                label={variant.getName()}
                              />
                            );
                          }
                        )}
                    </CompactSelectField>
                  </ColumnStackLayout>
                )}
                {customObjectEventsBasedObject &&
                  customObjectConfiguration &&
                  shouldDisplayEventsBasedObjectChildren &&
                  mapFor(
                    0,
                    customObjectEventsBasedObject
                      .getObjects()
                      .getObjectsCount(),
                    i => {
                      const childObject = customObjectEventsBasedObject
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
            onAdd={isBehaviorListLocked ? null : openNewBehaviorDialog}
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
            onAdd={
              isVariableListLocked
                ? null
                : () => {
                    if (variablesListRef.current) {
                      variablesListRef.current.addVariable();
                    }
                    setIsVariablesFolded(false);
                  }
            }
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
                isListLocked={isVariableListLocked}
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
      {newVariantDialogOpen && customObjectEventsBasedObject && (
        <NewVariantDialog
          initialName={variantName || i18n._(t`New variant`)}
          onApply={name => doDuplicateVariant(i18n, name)}
          onCancel={() => {
            setNewVariantDialogOpen(false);
          }}
        />
      )}
      {duplicateAndEditVariantDialogOpen && customObjectEventsBasedObject && (
        <NewVariantDialog
          isDuplicationBeforeEdition
          initialName={variantName || i18n._(t`New variant`)}
          onApply={name => duplicateAndEditVariant(i18n, name)}
          onCancel={() => {
            setDuplicateAndEditVariantDialogOpen(false);
          }}
        />
      )}
    </ErrorBoundary>
  );
};
