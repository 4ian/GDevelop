// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import SearchBar from '../UI/SearchBar';
import Background from '../UI/Background';
import newNameGenerator from '../Utils/NewNameGenerator';
import {
  enumerateEventsBasedBehaviors,
  filterEventsBasedBehaviorsList,
} from './EnumerateEventsBasedBehaviors';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import Tooltip from '@material-ui/core/Tooltip';
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Text from '../UI/Text';
import Add from '../UI/CustomSvgIcons/Add';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';

const EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND = 'Events Based Behavior';

const styles = {
  listContainer: {
    flex: 1,
  },
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

const renderEventsBehaviorLabel = (
  eventsBasedBehavior: gdEventsBasedBehavior
) => {
  const label = (
    <Text noMargin size="body-small">
      {eventsBasedBehavior.getName()}
    </Text>
  );
  return eventsBasedBehavior.isPrivate() ? (
    <>
      <Tooltip
        title={
          <Trans>This behavior won't be visible in the events editor.</Trans>
        }
      >
        <VisibilityOff fontSize="small" style={styles.tooltip} />
      </Tooltip>
      {label}
    </>
  ) : (
    label
  );
};

type State = {|
  renamedEventsBasedBehavior: ?gdEventsBasedBehavior,
  searchText: string,
|};

const getEventsBasedBehaviorName = (
  eventsBasedBehavior: gdEventsBasedBehavior
) => eventsBasedBehavior.getName();

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehaviorsList: gdEventsBasedBehaviorsList,
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
  onSelectEventsBasedBehavior: (
    eventsBasedBehavior: ?gdEventsBasedBehavior
  ) => void,
  onDeleteEventsBasedBehavior: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    cb: (boolean) => void
  ) => void,
  onRenameEventsBasedBehavior: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onEventsBasedBehaviorRenamed: (
    eventsBasedBehavior: gdEventsBasedBehavior
  ) => void,
  onEventsBasedBehaviorPasted: (
    eventsBasedBehavior: gdEventsBasedBehavior,
    sourceExtensionName: string
  ) => void,
  onEditProperties: (eventsBasedBehavior: gdEventsBasedBehavior) => void,
  unsavedChanges?: ?UnsavedChanges,
|};

export default class EventsBasedBehaviorsList extends React.Component<
  Props,
  State
> {
  static defaultProps = {
    onDeleteEventsBasedBehavior: (
      eventsBasedBehavior: gdEventsBasedBehavior,
      cb: boolean => void
    ) => cb(true),
    onRenameEventsBasedBehavior: (
      eventsBasedBehavior: gdEventsBasedBehavior,
      newName: string,
      cb: boolean => void
    ) => cb(true),
  };

  sortableList: ?SortableVirtualizedItemList<gdEventsBasedBehavior>;
  state: State = {
    renamedEventsBasedBehavior: null,
    searchText: '',
  };

  _deleteEventsBasedBehavior = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    { askForConfirmation }: {| askForConfirmation: boolean |}
  ) => {
    const { eventsBasedBehaviorsList } = this.props;

    if (askForConfirmation) {
      const answer = Window.showConfirmDialog(
        "Are you sure you want to remove this behavior? This can't be undone."
      );
      if (!answer) return;
    }

    this.props.onDeleteEventsBasedBehavior(eventsBasedBehavior, doRemove => {
      if (!doRemove) return;

      eventsBasedBehaviorsList.remove(eventsBasedBehavior.getName());
      this._onEventsBasedBehaviorModified();
    });
  };

  _editName = (renamedEventsBasedBehavior: ?gdEventsBasedBehavior) => {
    this.setState(
      {
        renamedEventsBasedBehavior,
      },
      () => {
        if (this.sortableList) this.sortableList.forceUpdateGrid();
      }
    );
  };

  _rename = (eventsBasedBehavior: gdEventsBasedBehavior, newName: string) => {
    this.setState({
      renamedEventsBasedBehavior: null,
    });

    if (eventsBasedBehavior.getName() === newName) return;

    this.props.onRenameEventsBasedBehavior(
      eventsBasedBehavior,
      newName,
      doRename => {
        if (!doRename) return;

        this._onEventsBasedBehaviorModified();
        this.props.onEventsBasedBehaviorRenamed(eventsBasedBehavior);
      }
    );
  };

  _moveSelectionTo = (
    destinationEventsBasedBehavior: gdEventsBasedBehavior
  ) => {
    const {
      eventsBasedBehaviorsList,
      selectedEventsBasedBehavior,
    } = this.props;
    if (!selectedEventsBasedBehavior) return;

    const originIndex = eventsBasedBehaviorsList.getPosition(
      selectedEventsBasedBehavior
    );
    const destinationIndex = eventsBasedBehaviorsList.getPosition(
      destinationEventsBasedBehavior
    );
    eventsBasedBehaviorsList.move(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );

    this.forceUpdateList();
  };

  _togglePrivate = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    eventsBasedBehavior.setPrivate(!eventsBasedBehavior.isPrivate());
    this.forceUpdate();
  };

  forceUpdateList = () => {
    this._onEventsBasedBehaviorModified();
    if (this.sortableList) this.sortableList.forceUpdateGrid();
  };

  _copyEventsBasedBehavior = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    Clipboard.set(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND, {
      eventsBasedBehavior: serializeToJSObject(eventsBasedBehavior),
      name: eventsBasedBehavior.getName(),
      extensionName: this.props.eventsFunctionsExtension.getName(),
    });
  };

  _cutEventsBasedBehavior = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    this._copyEventsBasedBehavior(eventsBasedBehavior);
    this._deleteEventsBasedBehavior(eventsBasedBehavior, {
      askForConfirmation: false,
    });
  };

  _pasteEventsBasedBehavior = (index: number) => {
    if (!Clipboard.has(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(
      EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND
    );
    const copiedEventsBasedBehavior = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsBasedBehavior'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedEventsBasedBehavior) return;

    const { project, eventsBasedBehaviorsList } = this.props;

    const newName = newNameGenerator(name, name =>
      eventsBasedBehaviorsList.has(name)
    );

    const newEventsBasedBehavior = eventsBasedBehaviorsList.insertNew(
      newName,
      index
    );

    unserializeFromJSObject(
      newEventsBasedBehavior,
      copiedEventsBasedBehavior,
      'unserializeFrom',
      project
    );
    newEventsBasedBehavior.setName(newName);

    const sourceExtensionName = SafeExtractor.extractStringProperty(
      clipboardContent,
      'extensionName'
    );
    if (sourceExtensionName) {
      this.props.onEventsBasedBehaviorPasted(
        newEventsBasedBehavior,
        sourceExtensionName
      );
    }

    this._onEventsBasedBehaviorModified();
    this.props.onSelectEventsBasedBehavior(newEventsBasedBehavior);
    this._editName(newEventsBasedBehavior);
  };

  _renderEventsBasedBehaviorMenuTemplate = (i18n: I18nType) => (
    eventsBasedBehavior: gdEventsBasedBehavior,
    index: number
  ) => {
    return [
      {
        label: i18n._(t`Properties`),
        click: () => this.props.onEditProperties(eventsBasedBehavior),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this._editName(eventsBasedBehavior),
      },
      {
        label: i18n._(t`Delete`),
        click: () =>
          this._deleteEventsBasedBehavior(eventsBasedBehavior, {
            askForConfirmation: true,
          }),
      },
      {
        label: eventsBasedBehavior.isPrivate()
          ? i18n._(t`Make public`)
          : i18n._(t`Make private`),
        click: () => this._togglePrivate(eventsBasedBehavior),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this._copyEventsBasedBehavior(eventsBasedBehavior),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this._cutEventsBasedBehavior(eventsBasedBehavior),
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND),
        click: () => this._pasteEventsBasedBehavior(index + 1),
      },
    ];
  };

  _addNewEventsBasedBehavior = () => {
    const { eventsBasedBehaviorsList } = this.props;

    const name = newNameGenerator('MyBehavior', name =>
      eventsBasedBehaviorsList.has(name)
    );
    const newEventsBasedBehavior = eventsBasedBehaviorsList.insertNew(
      name,
      eventsBasedBehaviorsList.getCount()
    );
    this._onEventsBasedBehaviorModified();

    // Scroll to the new behavior.
    // Ideally, we'd wait for the list to be updated to scroll, but
    // to simplify the code, we just wait a few ms for a new render
    // to be done.
    setTimeout(() => {
      this.scrollToItem(newEventsBasedBehavior);
    }, 100); // A few ms is enough for a new render to be done.

    // We focus it so the user can edit the name directly.
    this.props.onSelectEventsBasedBehavior(newEventsBasedBehavior);
    this._editName(newEventsBasedBehavior);
  };

  scrollToItem = (eventsBasedBehavior: gdEventsBasedBehavior) => {
    if (this.sortableList) {
      this.sortableList.scrollToItem(eventsBasedBehavior);
    }
  };

  _onEventsBasedBehaviorModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  }

  render() {
    const {
      project,
      eventsBasedBehaviorsList,
      selectedEventsBasedBehavior,
      onSelectEventsBasedBehavior,
    } = this.props;
    const { searchText } = this.state;

    const list = filterEventsBasedBehaviorsList(
      enumerateEventsBasedBehaviors(eventsBasedBehaviorsList),
      searchText
    );

    // Force List component to be mounted again if project or eventsBasedBehaviorsList
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + eventsBasedBehaviorsList.ptr;

    return (
      <Background>
        <Line>
          <Column expand>
            <SearchBar
              value={searchText}
              onRequestSearch={() => {}}
              onChange={text =>
                this.setState({
                  searchText: text,
                })
              }
              placeholder={t`Search behaviors`}
            />
          </Column>
        </Line>
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <I18n>
                {({ i18n }) => (
                  <SortableVirtualizedItemList
                    key={listKey}
                    ref={sortableList => (this.sortableList = sortableList)}
                    fullList={list}
                    width={width}
                    height={height}
                    renderItemLabel={renderEventsBehaviorLabel}
                    getItemName={getEventsBasedBehaviorName}
                    selectedItems={
                      selectedEventsBasedBehavior
                        ? [selectedEventsBasedBehavior]
                        : []
                    }
                    onItemSelected={onSelectEventsBasedBehavior}
                    renamedItem={this.state.renamedEventsBasedBehavior}
                    onRename={this._rename}
                    onMoveSelectionToItem={this._moveSelectionTo}
                    buildMenuTemplate={this._renderEventsBasedBehaviorMenuTemplate(
                      i18n
                    )}
                    reactDndType="GD_EVENTS_BASED_BEHAVIOR"
                  />
                )}
              </I18n>
            )}
          </AutoSizer>
        </div>
        <Line>
          <Column expand>
            <ResponsiveRaisedButton
              label={<Trans>Add a new behavior</Trans>}
              primary
              onClick={this._addNewEventsBasedBehavior}
              icon={<Add />}
            />
          </Column>
        </Line>
      </Background>
    );
  }
}
