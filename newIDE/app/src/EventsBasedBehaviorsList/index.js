// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
import SearchBar from '../UI/SearchBar';
import { showWarningBox } from '../UI/Messages/MessageBox';
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
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

const EVENTS_BASED_BEHAVIOR_CLIPBOARD_KIND = 'Events Based Behavior';

const styles = {
  listContainer: {
    flex: 1,
  },
  tooltip: { marginRight: 5, verticalAlign: 'bottom' },
};

const renderEventsBehaviorLabel = (
  eventsBasedBehavior: gdEventsBasedBehavior
) =>
  eventsBasedBehavior.isPrivate() ? (
    <>
      <Tooltip
        title={
          <Trans>This behavior won't be visible in the events editor.</Trans>
        }
      >
        <VisibilityOffIcon fontSize="small" style={styles.tooltip} />
      </Tooltip>
      <span title={eventsBasedBehavior.getName()}>
        {eventsBasedBehavior.getName()}
      </span>
    </>
  ) : (
    eventsBasedBehavior.getName()
  );

type State = {|
  renamedEventsBasedBehavior: ?gdEventsBasedBehavior,
  searchText: string,
|};

const getEventsBasedBehaviorName = (
  eventsBasedBehavior: gdEventsBasedBehavior
) => eventsBasedBehavior.getName();

type Props = {|
  project: gdProject,
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
    const { eventsBasedBehaviorsList } = this.props;
    this.setState({
      renamedEventsBasedBehavior: null,
    });

    if (eventsBasedBehavior.getName() === newName) return;

    if (eventsBasedBehaviorsList.has(newName)) {
      showWarningBox('Another behavior with this name already exists.', {
        delayToNextTick: true,
      });
      return;
    }

    this.props.onRenameEventsBasedBehavior(
      eventsBasedBehavior,
      newName,
      doRename => {
        if (!doRename) return;
        eventsBasedBehavior.setName(newName);
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

    eventsBasedBehaviorsList.move(
      eventsBasedBehaviorsList.getPosition(selectedEventsBasedBehavior),
      eventsBasedBehaviorsList.getPosition(destinationEventsBasedBehavior)
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

    this.props.onSelectEventsBasedBehavior(newEventsBasedBehavior);
    this._editName(newEventsBasedBehavior);
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
                    onAddNewItem={this._addNewEventsBasedBehavior}
                    addNewItemLabel={<Trans>Add a new behavior</Trans>}
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
        <SearchBar
          value={searchText}
          onRequestSearch={() => {}}
          onChange={text =>
            this.setState({
              searchText: text,
            })
          }
          aspect="integrated-search-bar"
          placeholder={t`Search behaviors`}
        />
      </Background>
    );
  }
}
