// @flow
import * as React from 'react';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import VariablesList, {
  type HistoryHandler,
  type VariablesListInterface,
} from '../VariablesList/VariablesList';
import { type ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import ErrorBoundary from '../UI/ErrorBoundary';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import { Column, Line, Spacer, marginsSize } from '../UI/Grid';
import { Separator } from '../CompactPropertiesEditor';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import IconButton from '../UI/IconButton';
import ShareExternal from '../UI/CustomSvgIcons/ShareExternal';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import Paper from '../UI/Paper';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowDownWithRoundedBorder from '../UI/CustomSvgIcons/ChevronArrowDownWithRoundedBorder';
import ChevronArrowRightWithRoundedBorder from '../UI/CustomSvgIcons/ChevronArrowRightWithRoundedBorder';
import Add from '../UI/CustomSvgIcons/Add';
import ObjectGroup from '../UI/CustomSvgIcons/ObjectGroup';
import { usePersistedScrollPosition } from '../Utils/UsePersistedScrollPosition';
import Help from '../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../Utils/HelpLink';
import Window from '../Utils/Window';
import CompactTextField from '../UI/CompactTextField';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import Link from '../UI/Link';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import useVariablesContainerRefactoring from '../VariablesList/useVariablesContainerRefactoring';
import useValueWithInit from '../Utils/UseRefInitHook';
import { type ObjectGroupEditorTab } from './EditedObjectGroupEditorDialog';
import CompactObjectGroupEditor from './CompactObjectGroupEditor';

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

const objectVariablesHelpLink = getHelpLink(
  '/all-features/variables/object-variables'
);

export type TitleBarButton = {|
  id: string,
  icon: any,
  label?: MessageDescriptor,
  onClick?: () => void,
|};

export const CollapsibleSubPanel = ({
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
|}): React.Node => (
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

export const TopLevelCollapsibleSection = ({
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
  onOpenFullEditor?: () => void,
  onAdd?: (() => void) | null,
|}): React.Node => (
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
          {onOpenFullEditor && (
            <IconButton size="small" onClick={onOpenFullEditor}>
              <ShareExternal style={styles.icon} />
            </IconButton>
          )}
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
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  /** Only set when a default variant is edited */
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  initialInstances: gdInitialInstancesContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  historyHandler?: HistoryHandler,

  objectGroup: gdObjectGroup,
  isObjectListLocked: boolean,
  isVariableListLocked: boolean,
  onEditObjectGroup: (
    objectGroup: gdObjectGroup,
    initialTab: ?ObjectGroupEditorTab
  ) => void,
|};

export const CompactObjectGroupPropertiesEditor = ({
  project,
  resourceManagementProps,
  eventsFunctionsExtension,
  eventsBasedObject,
  objectsContainer,
  globalObjectsContainer,
  initialInstances,
  projectScopedContainersAccessor,
  unsavedChanges,
  historyHandler,
  objectGroup,
  isObjectListLocked,
  isVariableListLocked,
  onEditObjectGroup,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();
  const [isObjectsFolded, setIsObjectsFolded] = React.useState(false);
  const [isVariablesFolded, setIsVariablesFolded] = React.useState(false);
  const variablesListRef = React.useRef<?VariablesListInterface>(null);

  const groupVariablesContainer = useValueWithInit(
    // The VariablesContainer is returned by value.
    // Thus, the same instance is reused every time.
    () =>
      gd.ObjectVariableHelper.mergeVariableContainers(
        projectScopedContainersAccessor.get().getObjectsContainersList(),
        objectGroup
      )
  );

  const openFullEditor = React.useCallback(
    () => onEditObjectGroup(objectGroup, 'objects'),
    [objectGroup, onEditObjectGroup]
  );

  const scrollViewRef = React.useRef<?ScrollViewInterface>(null);
  const scrollKey = '' + objectGroup.ptr;
  const onScroll = usePersistedScrollPosition({
    project,
    scrollViewRef,
    scrollKey,
    persistedScrollId: null,
    persistedScrollType: 'objectGroup',
  });

  // Variable refactoring: snapshot on object selection, apply on deselection/unmount.
  const { onVariablesUpdated } = useVariablesContainerRefactoring({
    project,
    variablesContainer: groupVariablesContainer,
    initialInstances,
    eventsBasedObject,
    enabled: true,
    objectGroup,
    objectsContainer,
    globalObjectsContainer,
    objectName: null,
  });

  const removeObject = React.useCallback(
    (objectName: string) => {
      objectGroup.removeObject(objectName);
      forceUpdate();
    },
    [forceUpdate, objectGroup]
  );

  const addObject = React.useCallback(
    (objectName: string) => {
      objectGroup.addObject(objectName);
      forceUpdate();
    },
    [forceUpdate, objectGroup]
  );

  return (
    <ErrorBoundary
      componentTitle={<Trans>Object properties</Trans>}
      scope="scene-editor-object-properties"
    >
      <ScrollView
        ref={scrollViewRef}
        autoHideScrollbar
        style={styles.scrollView}
        key={scrollKey}
        onScroll={onScroll}
      >
        <Column expand noMargin id="object-properties-editor" noOverflowParent>
          <ColumnStackLayout expand noOverflowParent>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
            >
              <LineStackLayout noMargin alignItems="center">
                {<ObjectGroup style={styles.icon} />}
                <Text size="body" noMargin>
                  <Trans>Object group</Trans>
                </Text>
                {
                  <IconButton
                    size="small"
                    onClick={() => {
                      Window.openExternalURL('/objects/object-groups');
                    }}
                  >
                    <Help style={styles.icon} />
                  </IconButton>
                }
              </LineStackLayout>
            </LineStackLayout>
            <CompactTextField
              value={objectGroup.getName()}
              onChange={() => {}}
              disabled
            />
          </ColumnStackLayout>
          <TopLevelCollapsibleSection
            title={<Trans>Objects</Trans>}
            isFolded={isObjectsFolded}
            toggleFolded={() => setIsObjectsFolded(!isObjectsFolded)}
            onOpenFullEditor={openFullEditor}
            renderContent={() => (
              <ColumnStackLayout noMargin noOverflowParent>
                <CompactObjectGroupEditor
                  project={project}
                  projectScopedContainersAccessor={
                    projectScopedContainersAccessor
                  }
                  globalObjectsContainer={globalObjectsContainer}
                  objectsContainer={objectsContainer}
                  groupObjectNames={objectGroup
                    .getAllObjectsNames()
                    .toJSArray()}
                  onObjectAdded={addObject}
                  onObjectRemoved={removeObject}
                  isObjectListLocked={isObjectListLocked}
                />
              </ColumnStackLayout>
            )}
          />
          <TopLevelCollapsibleSection
            title={<Trans>Object Variables</Trans>}
            isFolded={isVariablesFolded}
            toggleFolded={() => setIsVariablesFolded(!isVariablesFolded)}
            onOpenFullEditor={() => onEditObjectGroup(objectGroup, 'variables')}
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
                variablesContainer={groupVariablesContainer}
                areObjectVariables
                size="compact"
                historyHandler={historyHandler}
                onVariablesUpdated={onVariablesUpdated}
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
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};
