// @flow
import React from 'react';
import { ListItem } from '../UI/List';
import ListIcon from '../UI/ListIcon';
import TextField, {
  noMarginTextFieldInListItemTopOffset,
} from '../UI/TextField';
import Clipboard from '../Utils/Clipboard';
import { CLIPBOARD_KIND } from './ClipboardKind';
import {
  type SelectedTags,
  buildTagsMenuTemplate,
  getTagsFromString,
} from '../Utils/TagsHelper';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';

const LEFT_MOUSE_BUTTON = 0;

const styles = {
  objectName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  textField: {
    top: noMarginTextFieldInListItemTopOffset,
  },
};

const getPasteLabel = isGlobalObject => {
  let clipboardObjectName = '';
  if (Clipboard.has(CLIPBOARD_KIND)) {
    const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
    if (clipboardContent) {
      clipboardObjectName = clipboardContent.name;
    }
  }

  return isGlobalObject
    ? 'Paste ' + clipboardObjectName + ' as a Global Object'
    : 'Paste ' + clipboardObjectName;
};

type Props = {|
  project: gdProject,
  object: gdObject,
  selected: boolean,
  isGlobalObject: boolean,
  onObjectSelected: string => void,
  onEdit: (?gdObject) => void,
  onEditVariables: () => void,
  editingName: boolean,
  onEditName: () => void,
  onSetAsGlobalObject: () => void,
  onDelete: () => void,
  onAddNewObject: () => void,
  onCopyObject: () => void,
  onCutObject: () => void,
  onPasteObject: () => void,
  onDuplicateObject: () => void,
  getAllObjectTags: () => Array<string>,
  selectedTags: SelectedTags,
  onChangeTags: SelectedTags => void,
  onEditTags?: () => void,
  onRename: string => void,
  style: Object,
  getThumbnail: (gdProject, gdObject) => string,
|};

class ObjectRow extends React.Component<Props, {||}> {
  textField: ?TextField;

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.editingName && this.props.editingName) {
      setTimeout(() => {
        if (this.textField) this.textField.focus();
      }, 100);
    }
  }

  render() {
    const { project, object, selected, isGlobalObject, style } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => {
          const objectName = object.getName();
          const label = this.props.editingName ? (
            <TextField
              id="rename-object-field"
              margin="none"
              ref={textField => (this.textField = textField)}
              defaultValue={objectName}
              onBlur={e => this.props.onRename(e.currentTarget.value)}
              onKeyPress={event => {
                if (event.charCode === 13) {
                  // enter key pressed
                  if (this.textField) this.textField.blur();
                }
              }}
              fullWidth
              style={styles.textField}
            />
          ) : (
            <div
              style={{
                ...styles.objectName,
                color: selected
                  ? muiTheme.listItem.selectedTextColor
                  : undefined,
                fontStyle: isGlobalObject ? 'italic' : undefined,
                fontWeight: isGlobalObject ? 'bold' : 'normal',
              }}
            >
              {objectName}
            </div>
          );

          const itemStyle = {
            borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
            backgroundColor: selected
              ? muiTheme.listItem.selectedBackgroundColor
              : undefined,
          };

          return (
            <ListItem
              style={{ ...itemStyle, ...style }}
              primaryText={label}
              leftIcon={
                <ListIcon
                  iconSize={32}
                  src={this.props.getThumbnail(project, object)}
                />
              }
              displayMenuButton
              buildMenuTemplate={() => [
                {
                  label: 'Edit object',
                  enabled: !!this.props.onEdit,
                  click: () => this.props.onEdit(object),
                },
                {
                  label: 'Edit object variables',
                  enabled: !!this.props.onEditVariables,
                  click: () => this.props.onEditVariables(),
                },
                { type: 'separator' },
                {
                  label: 'Tags',
                  submenu: buildTagsMenuTemplate({
                    noTagLabel: 'No tags',
                    getAllTags: this.props.getAllObjectTags,
                    selectedTags: getTagsFromString(object.getTags()),
                    onChange: objectTags => {
                      this.props.onChangeTags(objectTags);
                    },
                    editTagsLabel: 'Add/edit tags...',
                    onEditTags: this.props.onEditTags,
                  }),
                },
                {
                  label: 'Rename',
                  enabled: !!this.props.onEdit,
                  click: () => this.props.onEditName(),
                },
                {
                  label: 'Set as a global object',
                  enabled: !!this.props.onSetAsGlobalObject,
                  click: () => this.props.onSetAsGlobalObject(),
                },
                {
                  label: 'Delete',
                  enabled: !!this.props.onEdit,
                  click: () => this.props.onDelete(),
                },
                { type: 'separator' },
                {
                  label: 'Add a new object...',
                  click: () => this.props.onAddNewObject(),
                },
                { type: 'separator' },
                {
                  label: 'Copy',
                  click: () => this.props.onCopyObject(),
                },
                {
                  label: 'Cut',
                  click: () => this.props.onCutObject(),
                },
                {
                  label: getPasteLabel(this.props.isGlobalObject),
                  enabled: Clipboard.has(CLIPBOARD_KIND),
                  click: () => this.props.onPasteObject(),
                },
                {
                  label: 'Duplicate',
                  click: () => this.props.onDuplicateObject(),
                },
              ]}
              onClick={() => {
                if (!this.props.onObjectSelected) return;
                if (this.props.editingName) return;
                this.props.onObjectSelected(selected ? '' : objectName);
              }}
              onDoubleClick={event => {
                if (event.button !== LEFT_MOUSE_BUTTON) return;
                if (!this.props.onEdit) return;
                if (this.props.editingName) return;

                this.props.onObjectSelected('');
                this.props.onEdit(object);
              }}
            />
          );
        }}
      </ThemeConsumer>
    );
  }
}

export default ObjectRow;
