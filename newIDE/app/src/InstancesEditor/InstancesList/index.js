// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import IconButton from '../../UI/IconButton';
import CompactSearchBar from '../../UI/CompactSearchBar';
import Chip from '../../UI/Chip';
import RemoveCircle from '../../UI/CustomSvgIcons/RemoveCircle';
import Lock from '../../UI/CustomSvgIcons/Lock';
import LockOpen from '../../UI/CustomSvgIcons/LockOpen';
import Link from '../../UI/CustomSvgIcons/Link';
import Unlink from '../../UI/CustomSvgIcons/Unlink';
import ObjectGroup from '../../UI/CustomSvgIcons/ObjectGroup';
import ErrorBoundary from '../../UI/ErrorBoundary';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { Column, Line } from '../../UI/Grid';
import TreeView from '../../UI/TreeView';
import Text from '../../UI/Text';
import Tooltip from '@material-ui/core/Tooltip';
import { tooltipEnterDelay } from '../../UI/Tooltip';
import {
  buildInstancesIndex,
  getParentPersistentUuid,
  recomputeLocalFromWorld,
  setLocalToWorld,
  applyLocalToWorld,
  applyParentTransformFromLocal,
  getInstanceWorldScaleX,
  getInstanceWorldScaleY,
  getKeepWorldOnReparent,
} from '../ParentingHelpers';

export type InstancesListInterface = {|
  forceUpdate: () => void,
|};

type Props = {|
  instances: gdInitialInstancesContainer,
  selectedInstances: Array<gdInitialInstance>,
  onSelectInstances: (Array<gdInitialInstance>, boolean) => void,
  onInstancesModified: (Array<gdInitialInstance>) => void,
|};

type InstanceTreeItem = {|
  id: string,
  instance: ?gdInitialInstance,
  children?: Array<InstanceTreeItem>,
  isRoot?: boolean,
  isPlaceholder?: boolean,
  label?: React.Node,
|};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minWidth: 0,
  },
  treeContainer: {
    flex: 1,
    minWidth: 0,
  },
  hierarchyHint: {
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 2,
  },
  hierarchyBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginRight: 6,
    maxWidth: 260,
    minWidth: 0,
  },
  hierarchyBadge: {
    height: 22,
    fontSize: 11,
    maxWidth: 150,
  },
  hierarchyLabel: {
    display: 'inline-block',
    maxWidth: 110,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  hierarchyLabelShort: {
    display: 'inline-block',
    maxWidth: 70,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  hierarchyRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  hierarchyIcon: {
    fontSize: 14,
  },
};

const rootId = 'scene-objects-root';
const emptyId = 'scene-objects-empty';

const InstancesList = (props: Props): React.Node => {
  const {
    instances,
    selectedInstances,
    onSelectInstances,
    onInstancesModified,
  } = props;
  const [searchText, setSearchText] = React.useState<string>('');

  const instancesIndex = buildInstancesIndex(instances);
  const {
    instancesByPersistentUuid,
    childrenByParentPersistentUuid,
  } = instancesIndex;

  const createItem = (
    instance: gdInitialInstance,
    ancestry: Set<string>
  ): InstanceTreeItem => {
    const persistentUuid = instance.getPersistentUuid();
    if (ancestry.has(persistentUuid)) {
      const item = {
        id: persistentUuid,
        instance,
        children: [],
      };
      return item;
    }
    const nextAncestry = new Set(ancestry);
    nextAncestry.add(persistentUuid);
    const childrenInstances =
      childrenByParentPersistentUuid.get(persistentUuid) || [];
    const children = childrenInstances.map(child =>
      createItem(child, nextAncestry)
    );
    const item = {
      id: persistentUuid,
      instance,
      children,
    };
    return item;
  };

  const rootChildren: Array<InstanceTreeItem> = [];
  instancesIndex.instances.forEach(instance => {
    const parentPersistentUuid = getParentPersistentUuid(instance);
    const hasValidParent =
      parentPersistentUuid &&
      instancesByPersistentUuid.has(parentPersistentUuid);
    if (!hasValidParent) {
      rootChildren.push(createItem(instance, new Set()));
    }
  });

  if (rootChildren.length === 0) {
    rootChildren.push({
      id: emptyId,
      instance: null,
      isPlaceholder: true,
      label: <Trans>No instances</Trans>,
      children: [],
    });
  }

  const items: Array<InstanceTreeItem> = [
    {
      id: rootId,
      instance: null,
      isRoot: true,
      children: rootChildren,
    },
  ];

  const selectedItems: Array<InstanceTreeItem> = selectedInstances.map(
    instance => ({
      id: instance.getPersistentUuid(),
      instance,
      children: [],
    })
  );

  const onSelectItems = React.useCallback(
    (items: Array<InstanceTreeItem>) => {
      const selected = items
        .map(item => item.instance)
        .filter(Boolean)
        // $FlowFixMe[incompatible-type] - filtered values are instances.
        .map(instance => instance);
      onSelectInstances(selected, false);
    },
    [onSelectInstances]
  );

  const buildMenuTemplate = React.useCallback(() => [], []);

  const getItemId = React.useCallback((item: InstanceTreeItem) => item.id, []);

  const getItemChildren = React.useCallback(
    (item: InstanceTreeItem) => item.children || null,
    []
  );

  const getItemName = React.useCallback((item: InstanceTreeItem) => {
    if (item.isRoot) return <Trans>Scene Objects</Trans>;
    if (item.isPlaceholder) return item.label || <Trans>No instances</Trans>;
    if (!item.instance) return '';
    return item.instance.getObjectName();
  }, []);

  const renderRightComponent = React.useCallback(
    (item: InstanceTreeItem) => {
      const instance = item.instance;
      if (!instance) return null;

      const parentPersistentUuid = getParentPersistentUuid(instance);
      const parentInstance =
        parentPersistentUuid &&
        instancesByPersistentUuid.get(parentPersistentUuid)
          ? instancesByPersistentUuid.get(parentPersistentUuid)
          : null;
      const parentName = parentInstance ? parentInstance.getObjectName() : '';
      const children =
        childrenByParentPersistentUuid.get(instance.getPersistentUuid()) || [];
      const childrenCount = children.length;

      const hierarchyBadges =
        parentName || childrenCount > 0 ? (
          <div style={styles.hierarchyBadges}>
            {parentName && (
              <Tooltip
                title={<Trans>Parent: {parentName}</Trans>}
                enterDelay={tooltipEnterDelay}
              >
                <div>
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<Link style={styles.hierarchyIcon} />}
                    style={styles.hierarchyBadge}
                    disableAutoTranslate
                    label={
                      <span style={styles.hierarchyLabel}>
                        <Trans>Parent:</Trans> {parentName}
                      </span>
                    }
                  />
                </div>
              </Tooltip>
            )}
            {childrenCount > 0 && (
              <Tooltip
                title={<Trans>Children: {childrenCount}</Trans>}
                enterDelay={tooltipEnterDelay}
              >
                <div>
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<ObjectGroup style={styles.hierarchyIcon} />}
                    style={styles.hierarchyBadge}
                    disableAutoTranslate
                    label={
                      <span style={styles.hierarchyLabelShort}>
                        <Trans>Children:</Trans> {childrenCount}
                      </span>
                    }
                  />
                </div>
              </Tooltip>
            )}
          </div>
        ) : null;

      const detachButton = parentPersistentUuid ? (
        <IconButton
          size="small"
          tooltip={t`Detach from parent`}
          onClick={event => {
            event.stopPropagation();
            const keepWorld = getKeepWorldOnReparent();
            if (keepWorld) {
              const worldScaleX = getInstanceWorldScaleX(
                instance,
                instancesByPersistentUuid
              );
              const worldScaleY = getInstanceWorldScaleY(
                instance,
                instancesByPersistentUuid
              );
              setLocalToWorld(instance, worldScaleX, worldScaleY);
            } else {
              applyLocalToWorld(instance);
            }
            instance.setParentPersistentUuid('');
            onInstancesModified([instance]);
          }}
        >
          <Unlink />
        </IconButton>
      ) : null;

      return (
        <div style={styles.hierarchyRight}>
          {hierarchyBadges}
          {detachButton}
          <IconButton
            size="small"
            onClick={event => {
              event.stopPropagation();
              if (instance.isSealed()) {
                instance.setSealed(false);
                instance.setLocked(false);
              } else if (instance.isLocked()) {
                instance.setSealed(true);
              } else {
                instance.setLocked(true);
              }
              onInstancesModified([instance]);
            }}
          >
            {instance.isLocked() && instance.isSealed() ? (
              <RemoveCircle />
            ) : instance.isLocked() ? (
              <Lock />
            ) : (
              <LockOpen />
            )}
          </IconButton>
        </div>
      );
    },
    [
      childrenByParentPersistentUuid,
      instancesByPersistentUuid,
      onInstancesModified,
    ]
  );

  const canMoveSelectionToItem = React.useCallback(
    (
      destinationItem: InstanceTreeItem,
      where: 'before' | 'inside' | 'after'
    ) => {
      if (where !== 'inside') return false;
      if (destinationItem.isPlaceholder) return false;

      const destinationInstance = destinationItem.instance;
      if (!destinationInstance) return true;

      const selectedUuids = new Set(
        selectedInstances.map(instance => instance.getPersistentUuid())
      );
      const destinationUuid = destinationInstance.getPersistentUuid();
      if (selectedUuids.has(destinationUuid)) return false;

      let current = destinationInstance;
      while (current) {
        const parentPersistentUuid = getParentPersistentUuid(current);
        if (!parentPersistentUuid) break;
        if (selectedUuids.has(parentPersistentUuid)) return false;
        const parentInstance = instancesByPersistentUuid.get(
          parentPersistentUuid
        );
        if (!parentInstance) break;
        current = parentInstance;
      }

      return true;
    },
    [instancesByPersistentUuid, selectedInstances]
  );

  const onMoveSelectionToItem = React.useCallback(
    (
      destinationItem: InstanceTreeItem,
      where: 'before' | 'inside' | 'after'
    ) => {
      if (where !== 'inside') return;
      const destinationInstance = destinationItem.instance || null;
      const parentPersistentUuid = destinationInstance
        ? destinationInstance.getPersistentUuid()
        : '';
      const instancesIndexForMove = buildInstancesIndex(instances);

      const modifiedInstances = [];
      const keepWorld = getKeepWorldOnReparent();

      selectedInstances.forEach(instance => {
        const currentParentPersistentUuid = instance.getParentPersistentUuid();
        if (currentParentPersistentUuid === parentPersistentUuid) return;
        if (
          destinationInstance &&
          instance.getPersistentUuid() ===
            destinationInstance.getPersistentUuid()
        )
          return;

        const worldScaleX = getInstanceWorldScaleX(
          instance,
          instancesIndexForMove.instancesByPersistentUuid
        );
        const worldScaleY = getInstanceWorldScaleY(
          instance,
          instancesIndexForMove.instancesByPersistentUuid
        );

        if (destinationInstance) {
          if (keepWorld) {
            recomputeLocalFromWorld(
              instance,
              destinationInstance,
              instancesIndexForMove.instancesByPersistentUuid
            );
            // Preserve world scale when reparenting.
            // $FlowFixMe[prop-missing]
            const inheritScale =
              typeof instance.inheritScale === 'function'
                ? // $FlowFixMe[prop-missing]
                  instance.inheritScale()
                : true;
            if (inheritScale) {
              const parentWorldScaleX = getInstanceWorldScaleX(
                destinationInstance,
                instancesIndexForMove.instancesByPersistentUuid
              );
              const parentWorldScaleY = getInstanceWorldScaleY(
                destinationInstance,
                instancesIndexForMove.instancesByPersistentUuid
              );
              if (parentWorldScaleX !== 0)
                instance.setLocalScaleX(worldScaleX / parentWorldScaleX);
              else instance.setLocalScaleX(worldScaleX);
              if (parentWorldScaleY !== 0)
                instance.setLocalScaleY(worldScaleY / parentWorldScaleY);
              else instance.setLocalScaleY(worldScaleY);
            } else {
              instance.setLocalScaleX(worldScaleX);
              instance.setLocalScaleY(worldScaleY);
            }
          }
          instance.setParentPersistentUuid(parentPersistentUuid);
          if (!keepWorld) {
            applyParentTransformFromLocal(
              instance,
              destinationInstance,
              instancesIndexForMove.instancesByPersistentUuid
            );
          }
        } else {
          if (keepWorld) {
            setLocalToWorld(instance, worldScaleX, worldScaleY);
          }
          instance.setParentPersistentUuid(parentPersistentUuid);
          if (!keepWorld) {
            applyLocalToWorld(instance);
          }
        }

        modifiedInstances.push(instance);
      });

      if (modifiedInstances.length > 0) {
        onInstancesModified(modifiedInstances);
      }
    },
    [instances, onInstancesModified, selectedInstances]
  );

  const shouldHideMenuIcon = React.useCallback(() => true, []);

  return (
    <div style={styles.container}>
      <Line>
        <Column expand noOverflowParent>
          <CompactSearchBar
            value={searchText}
            onChange={searchText => setSearchText(searchText)}
            onRequestSearch={() => {}}
            placeholder={t`Search instances`}
          />
          <Text
            size="body-small"
            color="secondary"
            noMargin
            style={styles.hierarchyHint}
          >
            <Trans>
              Drag an instance onto another to make it a child. Drag it to empty
              space to unparent.
            </Trans>
          </Text>
        </Column>
      </Line>
      <div style={styles.treeContainer}>
        <AutoSizer>
          {({ height, width }) => (
            <TreeView
              height={height}
              width={width}
              items={items}
              searchText={searchText}
              getItemName={getItemName}
              getItemId={getItemId}
              getItemChildren={getItemChildren}
              buildMenuTemplate={buildMenuTemplate}
              renderRightComponent={renderRightComponent}
              selectedItems={selectedItems}
              onSelectItems={onSelectItems}
              onRenameItem={() => {}}
              onMoveSelectionToItem={onMoveSelectionToItem}
              canMoveSelectionToItem={canMoveSelectionToItem}
              multiSelect
              reactDndType="INSTANCE_TREE_ITEM"
              forceAllOpened={false}
              initiallyOpenedNodeIds={[rootId]}
              shouldHideMenuIcon={shouldHideMenuIcon}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

const InstancesListWithErrorBoundary: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<InstancesListInterface>,
}> = React.forwardRef<Props, InstancesListInterface>((props, ref) => {
  const forceUpdate = useForceUpdate();
  React.useImperativeHandle(ref, () => ({
    forceUpdate,
  }));

  return (
    <ErrorBoundary
      componentTitle={<Trans>Instances list</Trans>}
      scope="scene-editor-instances-list"
    >
      <InstancesList {...props} />
    </ErrorBoundary>
  );
});

export default InstancesListWithErrorBoundary;
