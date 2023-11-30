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
  enumerateEventsBasedObjects,
  filterEventsBasedObjectsList,
} from './EnumerateEventsBasedObjects';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Add from '../UI/CustomSvgIcons/Add';

const EVENTS_BASED_OBJECT_CLIPBOARD_KIND = 'Events Based Object';

const styles = {
  listContainer: {
    flex: 1,
  },
};

type State = {|
  renamedEventsBasedObject: ?gdEventsBasedObject,
  searchText: string,
|};

const getEventsBasedObjectName = (eventsBasedObject: gdEventsBasedObject) =>
  eventsBasedObject.getName();

type Props = {|
  project: gdProject,
  eventsBasedObjectsList: gdEventsBasedObjectsList,
  selectedEventsBasedObject: ?gdEventsBasedObject,
  onSelectEventsBasedObject: (eventsBasedObject: ?gdEventsBasedObject) => void,
  onDeleteEventsBasedObject: (
    eventsBasedObject: gdEventsBasedObject,
    cb: (boolean) => void
  ) => void,
  onRenameEventsBasedObject: (
    eventsBasedObject: gdEventsBasedObject,
    newName: string,
    cb: (boolean) => void
  ) => void,
  onEventsBasedObjectRenamed: (eventsBasedObject: gdEventsBasedObject) => void,
  onEditProperties: (eventsBasedObject: gdEventsBasedObject) => void,
  unsavedChanges?: ?UnsavedChanges,
|};

export default class EventsBasedObjectsList extends React.Component<
  Props,
  State
> {
  static defaultProps = {
    onDeleteEventsBasedObject: (
      eventsBasedObject: gdEventsBasedObject,
      cb: boolean => void
    ) => cb(true),
    onRenameEventsBasedObject: (
      eventsBasedObject: gdEventsBasedObject,
      newName: string,
      cb: boolean => void
    ) => cb(true),
  };

  sortableList: ?SortableVirtualizedItemList<gdEventsBasedObject>;
  state: State = {
    renamedEventsBasedObject: null,
    searchText: '',
  };

  _deleteEventsBasedObject = (
    eventsBasedObject: gdEventsBasedObject,
    { askForConfirmation }: {| askForConfirmation: boolean |}
  ) => {
    const { eventsBasedObjectsList } = this.props;

    if (askForConfirmation) {
      const answer = Window.showConfirmDialog(
        "Are you sure you want to remove this object? This can't be undone."
      );
      if (!answer) return;
    }

    this.props.onDeleteEventsBasedObject(eventsBasedObject, doRemove => {
      if (!doRemove) return;

      eventsBasedObjectsList.remove(eventsBasedObject.getName());
      this._onEventsBasedObjectModified();
    });
  };

  _editName = (renamedEventsBasedObject: ?gdEventsBasedObject) => {
    this.setState(
      {
        renamedEventsBasedObject,
      },
      () => {
        if (this.sortableList) this.sortableList.forceUpdateGrid();
      }
    );
  };

  _rename = (eventsBasedObject: gdEventsBasedObject, newName: string) => {
    this.setState({
      renamedEventsBasedObject: null,
    });

    if (eventsBasedObject.getName() === newName) return;

    this.props.onRenameEventsBasedObject(
      eventsBasedObject,
      newName,
      doRename => {
        if (!doRename) return;

        this._onEventsBasedObjectModified();
        this.props.onEventsBasedObjectRenamed(eventsBasedObject);
      }
    );
  };

  _moveSelectionTo = (destinationEventsBasedObject: gdEventsBasedObject) => {
    const { eventsBasedObjectsList, selectedEventsBasedObject } = this.props;
    if (!selectedEventsBasedObject) return;

    const originIndex = eventsBasedObjectsList.getPosition(
      selectedEventsBasedObject
    );
    const destinationIndex = eventsBasedObjectsList.getPosition(
      destinationEventsBasedObject
    );
    eventsBasedObjectsList.move(
      originIndex,
      // When moving the item down, it must not be counted.
      destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
    );

    this.forceUpdateList();
  };

  forceUpdateList = () => {
    this._onEventsBasedObjectModified();
    if (this.sortableList) this.sortableList.forceUpdateGrid();
  };

  _copyEventsBasedObject = (eventsBasedObject: gdEventsBasedObject) => {
    Clipboard.set(EVENTS_BASED_OBJECT_CLIPBOARD_KIND, {
      eventsBasedObject: serializeToJSObject(eventsBasedObject),
      name: eventsBasedObject.getName(),
    });
  };

  _cutEventsBasedObject = (eventsBasedObject: gdEventsBasedObject) => {
    this._copyEventsBasedObject(eventsBasedObject);
    this._deleteEventsBasedObject(eventsBasedObject, {
      askForConfirmation: false,
    });
  };

  _pasteEventsBasedObject = (index: number) => {
    if (!Clipboard.has(EVENTS_BASED_OBJECT_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(EVENTS_BASED_OBJECT_CLIPBOARD_KIND);
    const copiedEventsBasedObject = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'eventsBasedObject'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedEventsBasedObject) return;

    const { project, eventsBasedObjectsList } = this.props;

    const newName = newNameGenerator(name, name =>
      eventsBasedObjectsList.has(name)
    );

    const newEventsBasedObject = eventsBasedObjectsList.insertNew(
      newName,
      index
    );

    unserializeFromJSObject(
      newEventsBasedObject,
      copiedEventsBasedObject,
      'unserializeFrom',
      project
    );
    newEventsBasedObject.setName(newName);

    this._onEventsBasedObjectModified();
    this.props.onSelectEventsBasedObject(newEventsBasedObject);
    this._editName(newEventsBasedObject);
  };

  _renderEventsBasedObjectMenuTemplate = (i18n: I18nType) => (
    eventsBasedObject: gdEventsBasedObject,
    index: number
  ) => {
    return [
      {
        label: i18n._(t`Properties`),
        click: () => this.props.onEditProperties(eventsBasedObject),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Rename`),
        click: () => this._editName(eventsBasedObject),
      },
      {
        label: i18n._(t`Delete`),
        click: () =>
          this._deleteEventsBasedObject(eventsBasedObject, {
            askForConfirmation: true,
          }),
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this._copyEventsBasedObject(eventsBasedObject),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this._cutEventsBasedObject(eventsBasedObject),
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(EVENTS_BASED_OBJECT_CLIPBOARD_KIND),
        click: () => this._pasteEventsBasedObject(index + 1),
      },
    ];
  };

  _addNewEventsBasedObject = () => {
    const { eventsBasedObjectsList } = this.props;

    const name = newNameGenerator('MyObject', name =>
      eventsBasedObjectsList.has(name)
    );
    const newEventsBasedObject = eventsBasedObjectsList.insertNew(
      name,
      eventsBasedObjectsList.getCount()
    );
    this._onEventsBasedObjectModified();

    // Scroll to the new function.
    // Ideally, we'd wait for the list to be updated to scroll, but
    // to simplify the code, we just wait a few ms for a new render
    // to be done.
    setTimeout(() => {
      this.scrollToItem(newEventsBasedObject);
    }, 100); // A few ms is enough for a new render to be done.

    // We focus it so the user can edit the name directly.
    this.props.onSelectEventsBasedObject(newEventsBasedObject);
    this._editName(newEventsBasedObject);
  };

  scrollToItem = (eventsBasedObject: gdEventsBasedObject) => {
    if (this.sortableList) {
      this.sortableList.scrollToItem(eventsBasedObject);
    }
  };

  _onEventsBasedObjectModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.forceUpdate();
  }

  render() {
    const {
      project,
      eventsBasedObjectsList,
      selectedEventsBasedObject,
      onSelectEventsBasedObject,
    } = this.props;
    const { searchText } = this.state;

    const list = filterEventsBasedObjectsList(
      enumerateEventsBasedObjects(eventsBasedObjectsList),
      searchText
    );

    // Force List component to be mounted again if project or eventsBasedObjectsList
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + eventsBasedObjectsList.ptr;

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
              placeholder={t`Search objects`}
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
                    getItemName={getEventsBasedObjectName}
                    selectedItems={
                      selectedEventsBasedObject
                        ? [selectedEventsBasedObject]
                        : []
                    }
                    onItemSelected={onSelectEventsBasedObject}
                    renamedItem={this.state.renamedEventsBasedObject}
                    onRename={this._rename}
                    onMoveSelectionToItem={this._moveSelectionTo}
                    buildMenuTemplate={this._renderEventsBasedObjectMenuTemplate(
                      i18n
                    )}
                    reactDndType="GD_EVENTS_BASED_OBJECT"
                  />
                )}
              </I18n>
            )}
          </AutoSizer>
        </div>
        <Line>
          <Column expand>
            <ResponsiveRaisedButton
              label={<Trans>Add a new object</Trans>}
              primary
              onClick={this._addNewEventsBasedObject}
              icon={<Add />}
            />
          </Column>
        </Line>
      </Background>
    );
  }
}
