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
import { Separator } from '../../CompactPropertiesEditor';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import ShareExternal from '../../UI/CustomSvgIcons/ShareExternal';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';
import { type ObjectEditorTab } from '../../ObjectEditor/ObjectEditorDialog';
import { CompactBehaviorPropertiesEditor } from './CompactBehaviorPropertiesEditor';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import Paper from '../../UI/Paper';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import { IconContainer } from '../../UI/IconContainer';
import RemoveIcon from '../../UI/CustomSvgIcons/Remove';
import useForceUpdate from '../../Utils/UseForceUpdate';
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
import { mapFor } from '../../Utils/MapFor';
import CompactSelectField from '../../UI/CompactSelectField';
import SelectOption from '../../UI/SelectOption';
import { ChildObjectPropertiesEditor } from './ChildObjectPropertiesEditor';
import { getSchemaWithOpenFullEditorButton } from './CompactObjectPropertiesSchema';
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
  ChildrenOverridingDepreciationAlert,
} from '../Editors/CustomObjectPropertiesEditor';
import NewVariantDialog from '../Editors/CustomObjectPropertiesEditor/NewVariantDialog';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { CompactEffectsListEditor } from '../../LayersList/CompactLayerPropertiesEditor/CompactEffectsListEditor';
import { CompactPropertiesEditorByVisibility } from '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import { useForceRecompute } from '../../Utils/UseForceUpdate';

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
const objectVariablesHelpLink = getHelpLink(
  '/all-features/variables/object-variables'
);

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
  onObjectsModified: (objects: Array<gdObject>) => void,
  onEffectAdded: () => void,
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
  onWillInstallExtension: (extensionNames: Array<string>) => void,
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
  onObjectsModified,
  onEffectAdded,
  onOpenEventBasedObjectVariantEditor,
  onDeleteEventsBasedObjectVariant,
  onWillInstallExtension,
  onExtensionInstalled,
  isVariableListLocked,
  isBehaviorListLocked,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [isPropertiesFolded, setIsPropertiesFolded] = React.useState(false);
  const [isBehaviorsFolded, setIsBehaviorsFolded] = React.useState(false);
  const [isVariablesFolded, setIsVariablesFolded] = React.useState(false);
  const [newVariantDialogOpen, setNewVariantDialogOpen] = React.useState(false);
  const [
    duplicateAndEditVariantDialogOpen,
    setDuplicateAndEditVariantDialogOpen,
  ] = React.useState(false);
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

  // Behaviors:
  const {
    openNewBehaviorDialog,
    newBehaviorDialog,
    removeBehavior,
  } = useManageObjectBehaviors({
    project,
    object,
    isChildObject: !layout,
    eventsFunctionsExtension,
    onUpdate: forceUpdate,
    onBehaviorsUpdated: forceUpdate,
    onUpdateBehaviorsSharedData,
    onWillInstallExtension,
    onExtensionInstalled,
  });

  const allVisibleBehaviors = object
    .getAllBehaviorNames()
    .toJSArray()
    .map(behaviorName => object.getBehavior(behaviorName))
    .filter(behavior => !behavior.isDefaultBehavior());

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

  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();

  const propertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      const properties = objectConfigurationAsGd.getProperties();
      return propertiesMapToSchema({
        properties,
        defaultValueProperties: customObjectEventsBasedObject
          ? customObjectEventsBasedObject.getPropertyDescriptors()
          : // We can't access default values for built-in objects.
            null,
        getProperties: ({ objectConfiguration }) =>
          objectConfiguration.getProperties(),
        onUpdateProperty: ({ objectConfiguration }, name, value) => {
          objectConfiguration.updateProperty(name, value);
        },
        object,
        visibility: 'All',
      });
    },
    [
      schemaRecomputeTrigger,
      objectConfigurationAsGd,
      object,
      customObjectEventsBasedObject,
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
                <CompactPropertiesEditorByVisibility
                  project={project}
                  object={object}
                  schema={propertiesSchema}
                  instances={[
                    { object, objectConfiguration: objectConfigurationAsGd },
                  ]}
                  onInstancesModified={() => {
                    // TODO: undo/redo?
                  }}
                  resourceManagementProps={resourceManagementProps}
                  placeholder={<Trans>This object has no properties.</Trans>}
                  customizeBasicSchema={schema =>
                    getSchemaWithOpenFullEditorButton({
                      schema,
                      fullEditorLabel,
                      object,
                      onEditObject,
                    })
                  }
                  onRefreshAllFields={forceRecomputeSchema}
                />
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
                        onObjectsModified([object]);
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
                {shouldDisplayEventsBasedObjectChildren &&
                  customObjectConfiguration &&
                  !customObjectConfiguration.isForcedToOverrideEventsBasedObjectChildrenConfiguration() && (
                    <ChildrenOverridingDepreciationAlert />
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
                      titleBarButtons={[
                        {
                          id: 'remove-behavior',
                          icon: RemoveIcon,
                          label: t`Remove behavior`,
                          onClick: () => {
                            removeBehavior(behavior.getName());
                          },
                        },
                      ]}
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
              <CompactEffectsListEditor
                layerRenderingType={'2d'}
                target={'layer'}
                project={project}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                unsavedChanges={unsavedChanges}
                i18n={i18n}
                effectsContainer={object.getEffects()}
                onEffectsUpdated={() => onObjectsModified([object])}
                onOpenFullEditor={() => onEditObject(object, 'effects')}
                onEffectAdded={onEffectAdded}
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
