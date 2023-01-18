// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from './Dialog';
import TextField, { type TextFieldInterface } from './TextField';
import FlatButton from './FlatButton';
import { Trans } from '@lingui/macro';
import { type Tags, getTagsFromString } from '../Utils/TagsHelper';
import { shouldValidate } from './KeyboardShortcuts/InteractionKeys';

type Props = {|
  tagsString: string,
  onCancel: () => void,
  onEdit: (tags: Tags) => void,
|};

type State = {|
  tagsString: string,
|};

/**
 * Dialog to edit tags, with keyboard support (auto focus of tags field,
 * enter to validate, esc to dismiss dialog).
 */
export default class EditTagsDialog extends React.Component<Props, State> {
  state = {
    tagsString: this.props.tagsString,
  };
  _tagsField = React.createRef<TextFieldInterface>();

  componentDidMount() {
    setTimeout(() => {
      if (this._tagsField && this._tagsField.current) {
        this._tagsField.current.focus();
      }
    }, 10);
  }

  _canEdit = () => {
    const { tagsString } = this.state;
    const tags = getTagsFromString(tagsString);

    return !!this.props.tagsString || !!tags.length;
  };

  _onEdit = (tags: Tags) => {
    if (!this._canEdit()) return;

    this.props.onEdit(tags);
  };

  render() {
    const { onCancel, onEdit } = this.props;
    const { tagsString } = this.state;

    const tags = getTagsFromString(tagsString);

    return (
      <Dialog
        title={<Trans>Edit object tags</Trans>}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Cancel</Trans>}
            primary={false}
            onClick={onCancel}
          />,
          <DialogPrimaryButton
            key="add"
            label={
              this.props.tagsString && !tags.length ? (
                <Trans>Remove all tags</Trans>
              ) : (
                <Trans>Add/update {tags.length} tag(s)</Trans>
              )
            }
            primary
            onClick={() => this._onEdit(tags)}
            disabled={!this._canEdit()}
          />,
        ]}
        onRequestClose={onCancel}
        onApply={() => this._onEdit(tags)}
        open
      >
        <TextField
          fullWidth
          value={tagsString}
          onChange={(e, tagsString) =>
            this.setState({
              tagsString,
            })
          }
          floatingLabelText="Tag(s) (comma-separated)"
          translatableHintText={t`For example: player, spaceship, inventory...`}
          onKeyPress={event => {
            if (shouldValidate(event)) {
              onEdit(tags);
            }
          }}
          ref={this._tagsField}
        />
      </Dialog>
    );
  }
}
