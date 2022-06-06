// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from './Dialog';
import TextField from './TextField';
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
  _tagsField = React.createRef<TextField>();

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
          hintText={t`For example: player, spaceship, inventory...`}
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
