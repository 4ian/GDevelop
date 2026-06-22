// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import { Tabs, type TabOptions } from '../UI/Tabs';
import CompactSearchBar from '../UI/CompactSearchBar';
import EmptyMessage from '../UI/EmptyMessage';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import Archive from '../UI/CustomSvgIcons/Archive';
import Add from '../UI/CustomSvgIcons/Add';
import Trash from '../UI/CustomSvgIcons/Trash';
import Store from '../UI/CustomSvgIcons/Store';
import Upload from '../UI/CustomSvgIcons/Upload';
import Object2d from '../UI/CustomSvgIcons/Object2d';
import Behavior from '../UI/CustomSvgIcons/Behavior';
import { enumerateFunctionsInFolder } from '../EventsFunctionsList/EnumerateFunctionFolderOrFunction';
import { ExtensionOptionsEditor } from '../EventsFunctionsExtensionEditor/OptionsEditorDialog/ExtensionOptionsEditor';
import { ExtensionDependenciesEditor } from '../EventsFunctionsExtensionEditor/OptionsEditorDialog/ExtensionDependenciesEditor';
import ExtensionExporterDialog from '../EventsFunctionsExtensionEditor/OptionsEditorDialog/ExtensionExporterDialog';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { mapFor } from '../Utils/MapFor';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';

const gd: libGDevelop = global.gd;

type ExtensionEntryKind = 'system' | 'third-party' | 'custom';

type ExtensionEntry = {|
  id: string,
  kind: ExtensionEntryKind,
  name: string,
  displayName: string,
  description: string,
  category: string,
  iconUrl: string,
  projectExtension?: gdEventsFunctionsExtension,
  platformExtension?: gdPlatformExtension,
|};

type ExtensionCount = {|
  primary: number,
  secondary: number,
  tertiary: number,
|};

type ListedEntity = {|
  +name: string,
  +description: string,
  +count?: number,
|};

type FunctionGroups = {|
  actions: Array<ListedEntity>,
  conditions: Array<ListedEntity>,
  expressions: Array<ListedEntity>,
|};

type ExtensionDetailsTab = 'properties' | 'dependencies' | 'content';

const isStoreExtension = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): boolean =>
  eventsFunctionsExtension.getOriginName() === 'gdevelop-extension-store';

const getProjectExtensionDisplayName = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): string =>
  eventsFunctionsExtension.getFullName() || eventsFunctionsExtension.getName();

const getSystemExtensionDisplayName = (
  platformExtension: gdPlatformExtension
): string => platformExtension.getFullName() || platformExtension.getName();

const getProjectExtensionDescription = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): string =>
  eventsFunctionsExtension.getShortDescription() ||
  eventsFunctionsExtension.getDescription();

const getSystemExtensionDescription = (
  platformExtension: gdPlatformExtension
): string =>
  platformExtension.getShortDescription() || platformExtension.getDescription();

const getProjectExtensionIconUrl = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): string =>
  eventsFunctionsExtension.getIconUrl() ||
  eventsFunctionsExtension.getPreviewIconUrl();

const getProjectExtensionEntries = (
  project: gdProject
): Array<ExtensionEntry> =>
  mapFor(0, project.getEventsFunctionsExtensionsCount(), index => {
    const eventsFunctionsExtension = project.getEventsFunctionsExtensionAt(
      index
    );
    const name = eventsFunctionsExtension.getName();
    return {
      id: `project-${name}`,
      kind: isStoreExtension(eventsFunctionsExtension)
        ? 'third-party'
        : 'custom',
      name,
      displayName: getProjectExtensionDisplayName(eventsFunctionsExtension),
      description: getProjectExtensionDescription(eventsFunctionsExtension),
      category: eventsFunctionsExtension.getCategory(),
      iconUrl: getProjectExtensionIconUrl(eventsFunctionsExtension),
      projectExtension: eventsFunctionsExtension,
    };
  });

const getSystemExtensionEntries = (
  project: gdProject
): Array<ExtensionEntry> => {
  const projectExtensionNames = new Set(
    getProjectExtensionEntries(project).map(entry => entry.name)
  );
  const platformExtensions = project
    .getCurrentPlatform()
    .getAllPlatformExtensions();
  const entries: Array<ExtensionEntry> = [];

  for (let index = 0; index < platformExtensions.size(); index++) {
    const platformExtension = platformExtensions.at(index);
    const name = platformExtension.getName();
    if (projectExtensionNames.has(name)) continue;

    entries.push({
      id: `system-${name}`,
      kind: 'system',
      name,
      displayName: getSystemExtensionDisplayName(platformExtension),
      description: getSystemExtensionDescription(platformExtension),
      category: platformExtension.getCategory(),
      iconUrl: platformExtension.getIconUrl(),
      platformExtension,
    });
  }

  return entries;
};

const sortEntries = (entries: Array<ExtensionEntry>): Array<ExtensionEntry> =>
  entries.sort((entryA, entryB) =>
    entryA.displayName.localeCompare(entryB.displayName)
  );

const getExtensionEntries = (project: gdProject): Array<ExtensionEntry> => [
  ...sortEntries(
    getProjectExtensionEntries(project).filter(entry => entry.kind === 'custom')
  ),
  ...sortEntries(
    getProjectExtensionEntries(project).filter(
      entry => entry.kind === 'third-party'
    )
  ),
  ...sortEntries(getSystemExtensionEntries(project)),
];

const getEventsBasedObjects = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): Array<gdEventsBasedObject> =>
  mapFor(0, eventsFunctionsExtension.getEventsBasedObjects().size(), index =>
    eventsFunctionsExtension.getEventsBasedObjects().at(index)
  );

const getEventsBasedBehaviors = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): Array<gdEventsBasedBehavior> =>
  mapFor(0, eventsFunctionsExtension.getEventsBasedBehaviors().size(), index =>
    eventsFunctionsExtension.getEventsBasedBehaviors().at(index)
  );

const getEventsFunctions = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): Array<gdEventsFunction> =>
  enumerateFunctionsInFolder(
    eventsFunctionsExtension.getEventsFunctions().getRootFolder()
  );

const getEventsBasedObjectFunctions = (
  eventsBasedObject: gdEventsBasedObject
): Array<gdEventsFunction> =>
  enumerateFunctionsInFolder(
    eventsBasedObject.getEventsFunctions().getRootFolder()
  );

const getEventsBasedBehaviorFunctions = (
  eventsBasedBehavior: gdEventsBasedBehavior
): Array<gdEventsFunction> =>
  enumerateFunctionsInFolder(
    eventsBasedBehavior.getEventsFunctions().getRootFolder()
  );

const getProjectExtensionCounts = (
  eventsFunctionsExtension: gdEventsFunctionsExtension
): ExtensionCount => ({
  primary: eventsFunctionsExtension.getEventsBasedObjects().size(),
  secondary: eventsFunctionsExtension.getEventsBasedBehaviors().size(),
  tertiary: getEventsFunctions(eventsFunctionsExtension).length,
});

const getSystemExtensionCounts = (
  platformExtension: gdPlatformExtension
): ExtensionCount => ({
  primary: platformExtension.getExtensionObjectsTypes().size(),
  secondary: platformExtension.getBehaviorsTypes().size(),
  tertiary:
    platformExtension
      .getAllActions()
      .keys()
      .size() +
    platformExtension
      .getAllConditions()
      .keys()
      .size() +
    platformExtension
      .getAllExpressions()
      .keys()
      .size() +
    platformExtension
      .getAllStrExpressions()
      .keys()
      .size(),
});

const getEntryCounts = (entry: ExtensionEntry): ExtensionCount => {
  if (entry.projectExtension)
    return getProjectExtensionCounts(entry.projectExtension);
  if (entry.platformExtension)
    return getSystemExtensionCounts(entry.platformExtension);
  return { primary: 0, secondary: 0, tertiary: 0 };
};

const getEntityDisplayName = (
  entity: gdEventsBasedObject | gdEventsBasedBehavior | gdEventsFunction
): string => entity.getFullName() || entity.getName();

const getEntityDescription = (
  entity: gdEventsBasedObject | gdEventsBasedBehavior | gdEventsFunction
): string => entity.getDescription();

const getFunctionGroupsCount = (functionGroups: FunctionGroups): number =>
  functionGroups.actions.length +
  functionGroups.conditions.length +
  functionGroups.expressions.length;

const getEventsFunctionEntity = (
  eventsFunction: gdEventsFunction
): ListedEntity => ({
  name: getEntityDisplayName(eventsFunction),
  description: getEntityDescription(eventsFunction),
});

const getCategorizedEventsFunctionEntities = (
  eventsFunctions: Array<gdEventsFunction>
): FunctionGroups => {
  const functionGroups: FunctionGroups = {
    actions: [],
    conditions: [],
    expressions: [],
  };

  eventsFunctions.forEach(eventsFunction => {
    const functionEntity = getEventsFunctionEntity(eventsFunction);
    const functionType = eventsFunction.getFunctionType();

    if (functionType === gd.EventsFunction.Condition) {
      functionGroups.conditions.push(functionEntity);
      return;
    }

    if (
      functionType === gd.EventsFunction.Expression ||
      functionType === gd.EventsFunction.ExpressionAndCondition
    ) {
      functionGroups.expressions.push(functionEntity);
      return;
    }

    functionGroups.actions.push(functionEntity);
  });

  return functionGroups;
};

const getPlatformInstructionNames = (
  instructionMetadataMap: gdMapStringInstructionMetadata
): Array<string> =>
  instructionMetadataMap
    .keys()
    .toJSArray()
    .sort();

const getPlatformExpressionNames = (
  expressionMetadataMap: gdMapStringExpressionMetadata
): Array<string> =>
  expressionMetadataMap
    .keys()
    .toJSArray()
    .sort();

const getEntryKindLabel = (kind: ExtensionEntryKind): React.Node => {
  if (kind === 'system') return <Trans>System</Trans>;
  if (kind === 'third-party') return <Trans>Third-party</Trans>;
  return <Trans>Custom</Trans>;
};

const filterEntry = (entry: ExtensionEntry, searchText: string): boolean => {
  if (!searchText) return true;
  const normalizedSearchText = searchText.toLowerCase();
  return [entry.displayName, entry.name, entry.description, entry.category]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearchText);
};

const styles = {
  root: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sidebar: {
    width: 420,
    minWidth: 320,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRight: '1px solid',
  },
  sidebarHeader: {
    padding: '16px 16px 12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sidebarTitleLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryList: {
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 8px 16px 8px',
  },
  category: {
    marginTop: 10,
  },
  categoryHeader: {
    padding: '8px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  entryButton: {
    width: '100%',
    border: 0,
    padding: '10px 12px',
    margin: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr auto',
    gap: 12,
    alignItems: 'center',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 6,
    background: 'transparent',
  },
  packageIconContainer: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  extensionIconImage: {
    display: 'block',
    objectFit: 'contain',
  },
  entryText: {
    minWidth: 0,
  },
  entryNameLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  entryName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  entryMeta: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  kindBadge: {
    padding: '2px 7px',
    borderRadius: 6,
    fontSize: 12,
    lineHeight: '18px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  details: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  detailsScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 24,
  },
  detailsHeader: {
    display: 'grid',
    gridTemplateColumns: '56px 1fr auto',
    gap: 16,
    alignItems: 'start',
  },
  detailsIconContainer: {
    width: 52,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  detailsActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    margin: '20px 0',
  },
  stat: {
    borderRadius: 8,
    padding: 12,
  },
  section: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    width: '100%',
    border: 0,
    padding: '12px 14px',
    display: 'grid',
    gridTemplateColumns: '28px 1fr auto',
    gap: 10,
    alignItems: 'center',
    textAlign: 'left',
    cursor: 'pointer',
  },
  sectionBody: {
    padding: '4px 0 8px 0',
  },
  detailsTabContent: {
    paddingTop: 8,
  },
  entityRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
    padding: '9px 14px 9px 52px',
    alignItems: 'center',
  },
  entityName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  functionGroup: {
    padding: '6px 0',
  },
  functionGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 14px 8px 52px',
  },
  emptyDetails: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
};

const FnIcon = () => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <span
      style={{
        fontSize: 19,
        lineHeight: '24px',
        fontWeight: 700,
        color: gdevelopTheme.text.color.primary,
        fontFamily: 'monospace',
      }}
    >
      fn
    </span>
  );
};

const ExtensionEntryIcon = ({
  entry,
  selected,
  size,
}: {|
  entry: ExtensionEntry,
  selected?: boolean,
  size: 'small' | 'large',
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);
  React.useEffect(
    () => {
      setImageLoadFailed(false);
    },
    [entry.iconUrl]
  );

  const containerSize = size === 'large' ? 52 : 36;
  const imageSize = size === 'large' ? 44 : 30;
  const hasIcon = !!entry.iconUrl && !imageLoadFailed;

  return (
    <div
      style={{
        ...styles.packageIconContainer,
        width: containerSize,
        height: containerSize,
        backgroundColor: hasIcon
          ? 'transparent'
          : selected
          ? gdevelopTheme.palette.primary
          : gdevelopTheme.listItem.backgroundColor,
        color: selected
          ? gdevelopTheme.palette.primaryContrastText
          : gdevelopTheme.text.color.primary,
      }}
    >
      {hasIcon ? (
        <CorsAwareImage
          src={entry.iconUrl}
          alt={entry.displayName}
          style={{
            ...styles.extensionIconImage,
            width: imageSize,
            height: imageSize,
          }}
          onError={() => setImageLoadFailed(true)}
        />
      ) : (
        <Archive />
      )}
    </div>
  );
};

const ExtensionStats = ({ entry }: {| entry: ExtensionEntry |}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const counts = getEntryCounts(entry);
  const statDefinitions =
    entry.kind === 'system'
      ? [
          { label: <Trans>Prefabs</Trans>, value: counts.primary },
          { label: <Trans>Behaviors</Trans>, value: counts.secondary },
          { label: <Trans>Functions</Trans>, value: counts.tertiary },
        ]
      : [
          { label: <Trans>Prefabs</Trans>, value: counts.primary },
          { label: <Trans>Behaviors</Trans>, value: counts.secondary },
          { label: <Trans>Functions</Trans>, value: counts.tertiary },
        ];

  return (
    <div style={styles.stats}>
      {statDefinitions.map((statDefinition, index) => (
        <div
          key={index}
          style={{
            ...styles.stat,
            backgroundColor: gdevelopTheme.listItem.backgroundColor,
          }}
        >
          <Text noMargin size="block-title">
            {statDefinition.value}
          </Text>
          <Text noMargin color="secondary">
            {statDefinition.label}
          </Text>
        </div>
      ))}
    </div>
  );
};

const CollapsibleSection = ({
  title,
  icon,
  count,
  children,
}: {|
  title: React.Node,
  icon: React.Node,
  count?: number,
  children: React.Node,
|}) => {
  const [expanded, setExpanded] = React.useState(true);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <div
      style={{
        ...styles.section,
        backgroundColor: 'transparent',
      }}
    >
      <button
        type="button"
        style={{
          ...styles.sectionHeader,
          backgroundColor: gdevelopTheme.dialog.backgroundColor,
          color: gdevelopTheme.text.color.primary,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>{icon}</div>
        <Text noMargin size="block-title">
          {title}
        </Text>
        {count !== undefined ? (
          <Text noMargin color="secondary">
            {count}
          </Text>
        ) : (
          <span />
        )}
      </button>
      {expanded && <div style={styles.sectionBody}>{children}</div>}
    </div>
  );
};

const ProjectExtensionProperties = ({
  eventsFunctionsExtension,
  onExtensionPropertiesChanged,
}: {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onExtensionPropertiesChanged: () => void,
|}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <ExtensionOptionsEditor
      eventsFunctionsExtension={eventsFunctionsExtension}
      onLoadChange={setIsLoading}
      isLoading={isLoading}
      onChange={onExtensionPropertiesChanged}
    />
  );
};

const EntityRows = ({
  entities,
  emptyMessage,
}: {|
  entities: $ReadOnlyArray<ListedEntity>,
  emptyMessage: React.Node,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  if (!entities.length) {
    return (
      <div style={{ padding: '6px 14px 14px 52px' }}>
        <Text noMargin color="secondary">
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return entities.map(entity => (
    <div
      key={entity.name}
      style={{
        ...styles.entityRow,
        borderTop: `1px solid ${gdevelopTheme.toolbar.separatorColor}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={styles.entityName}>
          <Text noMargin>{entity.name}</Text>
        </div>
        {!!entity.description && (
          <div style={styles.entryMeta}>
            <Text noMargin color="secondary">
              {entity.description}
            </Text>
          </div>
        )}
      </div>
      {entity.count !== undefined && (
        <Text noMargin color="secondary">
          {entity.count} <Trans>functions</Trans>
        </Text>
      )}
    </div>
  ));
};

const FunctionCategoryRows = ({
  title,
  entities,
  emptyMessage,
}: {|
  title: React.Node,
  entities: $ReadOnlyArray<ListedEntity>,
  emptyMessage: React.Node,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <div style={styles.functionGroup}>
      <div
        style={{
          ...styles.functionGroupHeader,
          borderTop: `1px solid ${gdevelopTheme.toolbar.separatorColor}`,
        }}
      >
        <Text noMargin size="block-title">
          {title}
        </Text>
        <Text noMargin color="secondary">
          {entities.length}
        </Text>
      </div>
      <EntityRows entities={entities} emptyMessage={emptyMessage} />
    </div>
  );
};

const FunctionsSection = ({
  functionGroups,
}: {|
  functionGroups: FunctionGroups,
|}) => (
  <CollapsibleSection
    title={<Trans>Functions</Trans>}
    icon={<FnIcon />}
    count={getFunctionGroupsCount(functionGroups)}
  >
    <FunctionCategoryRows
      title={<Trans>Actions</Trans>}
      entities={functionGroups.actions}
      emptyMessage={<Trans>No actions in this extension.</Trans>}
    />
    <FunctionCategoryRows
      title={<Trans>Conditions</Trans>}
      entities={functionGroups.conditions}
      emptyMessage={<Trans>No conditions in this extension.</Trans>}
    />
    <FunctionCategoryRows
      title={<Trans>Expressions</Trans>}
      entities={functionGroups.expressions}
      emptyMessage={<Trans>No expressions in this extension.</Trans>}
    />
  </CollapsibleSection>
);

const ProjectExtensionDetails = ({
  eventsFunctionsExtension,
}: {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
|}) => {
  const prefabs = getEventsBasedObjects(eventsFunctionsExtension).map(
    object => ({
      name: getEntityDisplayName(object),
      description: getEntityDescription(object),
      count: getEventsBasedObjectFunctions(object).length,
    })
  );
  const behaviors = getEventsBasedBehaviors(eventsFunctionsExtension).map(
    behavior => ({
      name: getEntityDisplayName(behavior),
      description: getEntityDescription(behavior),
      count: getEventsBasedBehaviorFunctions(behavior).length,
    })
  );
  const functionGroups = getCategorizedEventsFunctionEntities(
    getEventsFunctions(eventsFunctionsExtension)
  );

  return (
    <React.Fragment>
      <CollapsibleSection
        title={<Trans>Prefabs</Trans>}
        icon={<Object2d />}
        count={prefabs.length}
      >
        <EntityRows
          entities={prefabs}
          emptyMessage={<Trans>No prefabs in this extension.</Trans>}
        />
      </CollapsibleSection>
      <CollapsibleSection
        title={<Trans>Behaviors</Trans>}
        icon={<Behavior />}
        count={behaviors.length}
      >
        <EntityRows
          entities={behaviors}
          emptyMessage={<Trans>No behaviors in this extension.</Trans>}
        />
      </CollapsibleSection>
      <FunctionsSection functionGroups={functionGroups} />
    </React.Fragment>
  );
};

const SystemExtensionDetails = ({
  platformExtension,
}: {|
  platformExtension: gdPlatformExtension,
|}) => {
  const objects = platformExtension
    .getExtensionObjectsTypes()
    .toJSArray()
    .sort()
    .map(name => ({ name, description: '' }));
  const behaviors = platformExtension
    .getBehaviorsTypes()
    .toJSArray()
    .sort()
    .map(name => ({ name, description: '' }));
  const actions: Array<ListedEntity> = getPlatformInstructionNames(
    platformExtension.getAllActions()
  ).map(name => ({ name, description: '' }));
  const conditions: Array<ListedEntity> = getPlatformInstructionNames(
    platformExtension.getAllConditions()
  ).map(name => ({ name, description: '' }));
  const expressions: Array<ListedEntity> = [
    ...getPlatformExpressionNames(platformExtension.getAllExpressions()),
    ...getPlatformExpressionNames(platformExtension.getAllStrExpressions()),
  ]
    .sort()
    .map(name => ({ name, description: '' }));
  const functionGroups: FunctionGroups = {
    actions,
    conditions,
    expressions,
  };

  return (
    <React.Fragment>
      <CollapsibleSection
        title={<Trans>Prefabs</Trans>}
        icon={<Object2d />}
        count={objects.length}
      >
        <EntityRows
          entities={objects}
          emptyMessage={<Trans>No prefabs in this system extension.</Trans>}
        />
      </CollapsibleSection>
      <CollapsibleSection
        title={<Trans>Behaviors</Trans>}
        icon={<Behavior />}
        count={behaviors.length}
      >
        <EntityRows
          entities={behaviors}
          emptyMessage={<Trans>No behaviors in this system extension.</Trans>}
        />
      </CollapsibleSection>
      <FunctionsSection functionGroups={functionGroups} />
    </React.Fragment>
  );
};

const ProjectExtensionDetailsTabs = ({
  project,
  resourceManagementProps,
  eventsFunctionsExtension,
  onExtensionPropertiesChanged,
}: {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  onExtensionPropertiesChanged: () => void,
|}) => {
  const [currentTab, setCurrentTab] = React.useState<ExtensionDetailsTab>(
    'properties'
  );
  const tabOptions: TabOptions<ExtensionDetailsTab> = [
    {
      value: 'properties',
      label: <Trans>Properties</Trans>,
    },
    {
      value: 'dependencies',
      label: <Trans>Dependencies</Trans>,
    },
    {
      value: 'content',
      label: <Trans>Content</Trans>,
    },
  ];

  return (
    <React.Fragment>
      <Tabs value={currentTab} onChange={setCurrentTab} options={tabOptions} />
      <div style={styles.detailsTabContent}>
        {currentTab === 'properties' && (
          <ProjectExtensionProperties
            eventsFunctionsExtension={eventsFunctionsExtension}
            onExtensionPropertiesChanged={onExtensionPropertiesChanged}
          />
        )}
        {currentTab === 'dependencies' && (
          <ExtensionDependenciesEditor
            project={project}
            resourceManagementProps={resourceManagementProps}
            eventsFunctionsExtension={eventsFunctionsExtension}
            onChange={onExtensionPropertiesChanged}
          />
        )}
        {currentTab === 'content' && (
          <ProjectExtensionDetails
            eventsFunctionsExtension={eventsFunctionsExtension}
          />
        )}
      </div>
    </React.Fragment>
  );
};

const ExtensionListEntry = ({
  entry,
  selected,
  onSelect,
}: {|
  entry: ExtensionEntry,
  selected: boolean,
  onSelect: () => void,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const counts = getEntryCounts(entry);
  const statLine =
    entry.kind === 'system'
      ? `${counts.primary} prefabs, ${counts.secondary} behaviors, ${
          counts.tertiary
        } functions`
      : `${counts.primary} prefabs, ${counts.secondary} behaviors, ${
          counts.tertiary
        } functions`;

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        ...styles.entryButton,
        backgroundColor: selected
          ? gdevelopTheme.listItem.selectedBackgroundColor
          : 'transparent',
        color: gdevelopTheme.text.color.primary,
      }}
    >
      <ExtensionEntryIcon entry={entry} selected={selected} size="small" />
      <div style={styles.entryText}>
        <div style={styles.entryNameLine}>
          <div style={styles.entryName}>
            <Text noMargin>{entry.displayName}</Text>
          </div>
        </div>
        <div style={styles.entryMeta}>
          <Text noMargin color="secondary">
            {statLine}
          </Text>
        </div>
      </div>
      <span
        style={{
          ...styles.kindBadge,
          color: selected
            ? gdevelopTheme.listItem.selectedTextColor
            : gdevelopTheme.text.color.secondary,
          backgroundColor: selected
            ? gdevelopTheme.listItem.selectedBackgroundColor
            : gdevelopTheme.listItem.backgroundColor,
        }}
      >
        {getEntryKindLabel(entry.kind)}
      </span>
    </button>
  );
};

const ExtensionCategory = ({
  title,
  entries,
  selectedEntryId,
  onSelect,
}: {|
  title: React.Node,
  entries: Array<ExtensionEntry>,
  selectedEntryId: ?string,
  onSelect: string => void,
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  if (!entries.length) return null;

  return (
    <div style={styles.category}>
      <div style={styles.categoryHeader}>
        <Text noMargin size="block-title">
          {title}
        </Text>
        <Text noMargin color="secondary">
          {entries.length}
        </Text>
      </div>
      {entries.map(entry => (
        <ExtensionListEntry
          key={entry.id}
          entry={entry}
          selected={entry.id === selectedEntryId}
          onSelect={() => onSelect(entry.id)}
        />
      ))}
      <div
        style={{
          height: 1,
          margin: '8px 8px 0 8px',
          backgroundColor: gdevelopTheme.toolbar.separatorColor,
        }}
      />
    </div>
  );
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  onClose: () => void,
  onInstallExtension: () => void,
  onExtensionPropertiesChanged: () => void,
  onShowExtensionStoreDetails: (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => void,
  onDeleteEventsFunctionsExtension: (
    eventsFunctionsExtension: gdEventsFunctionsExtension
  ) => Promise<void>,
|};

const ProjectExtensionsDialog = ({
  project,
  resourceManagementProps,
  onClose,
  onInstallExtension,
  onExtensionPropertiesChanged,
  onShowExtensionStoreDetails,
  onDeleteEventsFunctionsExtension,
}: Props): React.Node => {
  const [searchText, setSearchText] = React.useState('');
  const [selectedEntryId, setSelectedEntryId] = React.useState<?string>(null);
  const [isUninstalling, setIsUninstalling] = React.useState(false);
  const [
    exportedEventsFunctionsExtension,
    setExportedEventsFunctionsExtension,
  ] = React.useState<?gdEventsFunctionsExtension>(null);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const canExportExtensions = !!eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();

  const entries = getExtensionEntries(project);
  const filteredEntries = entries.filter(entry =>
    filterEntry(entry, searchText)
  );
  const thirdPartyEntries = filteredEntries.filter(
    entry => entry.kind === 'third-party'
  );
  const customEntries = filteredEntries.filter(
    entry => entry.kind === 'custom'
  );
  const systemEntries = filteredEntries.filter(
    entry => entry.kind === 'system'
  );

  React.useEffect(
    () => {
      if (!entries.length) {
        setSelectedEntryId(null);
        return;
      }

      if (
        !selectedEntryId ||
        !entries.some(entry => entry.id === selectedEntryId)
      ) {
        setSelectedEntryId(entries[0].id);
      }
    },
    [entries, selectedEntryId]
  );

  const selectedEntry =
    entries.find(entry => entry.id === selectedEntryId) || entries[0];

  const uninstallSelectedExtension = async () => {
    if (!selectedEntry) return;

    const projectExtension = selectedEntry.projectExtension;
    if (!projectExtension) return;

    const extensionName = projectExtension.getName();
    setIsUninstalling(true);
    try {
      await onDeleteEventsFunctionsExtension(projectExtension);
      if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
        setSelectedEntryId(null);
      }
    } finally {
      setIsUninstalling(false);
    }
  };

  return (
    <Dialog
      title={<Trans>Extensions</Trans>}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary
          onClick={onClose}
        />,
      ]}
      open
      onRequestClose={onClose}
      fullHeight
      flexColumnBody
      disableContentScroll
      maxWidth="lg"
    >
      <React.Fragment>
        <div
          style={{
            ...styles.root,
            backgroundColor: gdevelopTheme.dialog.backgroundColor,
          }}
        >
          <div
            style={{
              ...styles.sidebar,
              borderRightColor: gdevelopTheme.toolbar.separatorColor,
            }}
          >
            <div style={styles.sidebarHeader}>
              <div style={styles.sidebarTitleLine}>
                <Text noMargin size="title">
                  <Trans>Extensions</Trans>
                </Text>
                <RaisedButton
                  primary
                  label={<Trans>Install</Trans>}
                  icon={<Add />}
                  onClick={onInstallExtension}
                />
              </div>
              <CompactSearchBar
                value={searchText}
                onChange={setSearchText}
                placeholder={t`Search extensions`}
              />
            </div>
            <div style={styles.categoryList}>
              <ExtensionCategory
                title={<Trans>Custom extensions</Trans>}
                entries={customEntries}
                selectedEntryId={selectedEntryId}
                onSelect={setSelectedEntryId}
              />
              <ExtensionCategory
                title={<Trans>Third-party extensions</Trans>}
                entries={thirdPartyEntries}
                selectedEntryId={selectedEntryId}
                onSelect={setSelectedEntryId}
              />
              <ExtensionCategory
                title={<Trans>System extensions</Trans>}
                entries={systemEntries}
                selectedEntryId={selectedEntryId}
                onSelect={setSelectedEntryId}
              />
              {!filteredEntries.length && (
                <EmptyMessage>
                  <Trans>No extensions match this search.</Trans>
                </EmptyMessage>
              )}
            </div>
          </div>
          <div style={styles.details}>
            {!selectedEntry ? (
              <div style={styles.emptyDetails}>
                <EmptyMessage>
                  <Trans>Install an extension to see its contents here.</Trans>
                </EmptyMessage>
              </div>
            ) : (
              <div style={styles.detailsScroll}>
                <div style={styles.detailsHeader}>
                  <div
                    style={{
                      ...styles.detailsIconContainer,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <ExtensionEntryIcon entry={selectedEntry} size="large" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <Text noMargin size="title">
                      {selectedEntry.displayName}
                    </Text>
                    <Text noMargin color="secondary">
                      {selectedEntry.name}
                      {!!selectedEntry.category &&
                        ` - ${selectedEntry.category}`}
                    </Text>
                    {!!selectedEntry.description && (
                      <Text color="secondary">{selectedEntry.description}</Text>
                    )}
                    <span
                      style={{
                        ...styles.kindBadge,
                        backgroundColor: gdevelopTheme.listItem.backgroundColor,
                        color: gdevelopTheme.text.color.secondary,
                      }}
                    >
                      {getEntryKindLabel(selectedEntry.kind)}
                    </span>
                  </div>
                  <div style={styles.detailsActions}>
                    {selectedEntry.kind === 'third-party' &&
                      !!selectedEntry.projectExtension && (
                        <FlatButton
                          label={<Trans>Store details</Trans>}
                          leftIcon={<Store />}
                          onClick={() =>
                            selectedEntry.projectExtension &&
                            onShowExtensionStoreDetails(
                              selectedEntry.projectExtension
                            )
                          }
                        />
                      )}
                    {!!selectedEntry.projectExtension && (
                      <FlatButton
                        label={<Trans>Export extension</Trans>}
                        leftIcon={<Upload />}
                        disabled={!canExportExtensions}
                        onClick={() =>
                          setExportedEventsFunctionsExtension(
                            selectedEntry.projectExtension || null
                          )
                        }
                      />
                    )}
                    {!!selectedEntry.projectExtension && (
                      <FlatButton
                        label={<Trans>Uninstall</Trans>}
                        leftIcon={<Trash />}
                        disabled={isUninstalling}
                        onClick={uninstallSelectedExtension}
                      />
                    )}
                  </div>
                </div>
                <ExtensionStats entry={selectedEntry} />
                {selectedEntry.projectExtension ? (
                  <ProjectExtensionDetailsTabs
                    key={selectedEntry.id}
                    project={project}
                    resourceManagementProps={resourceManagementProps}
                    eventsFunctionsExtension={selectedEntry.projectExtension}
                    onExtensionPropertiesChanged={onExtensionPropertiesChanged}
                  />
                ) : selectedEntry.platformExtension ? (
                  <SystemExtensionDetails
                    platformExtension={selectedEntry.platformExtension}
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>
        {exportedEventsFunctionsExtension && (
          <ExtensionExporterDialog
            project={project}
            eventsFunctionsExtension={exportedEventsFunctionsExtension}
            onClose={() => setExportedEventsFunctionsExtension(null)}
          />
        )}
      </React.Fragment>
    </Dialog>
  );
};

export default ProjectExtensionsDialog;
