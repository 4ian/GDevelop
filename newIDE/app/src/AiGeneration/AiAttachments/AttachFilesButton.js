// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import Add from '../../UI/CustomSvgIcons/Add';

type Props = {|
  disabled?: boolean,
  onFilesChosen: (files: Array<File>) => void,
|};

/** A "+" button to choose files (any type) to attach to a message. */
export const AttachFilesButton = ({
  disabled,
  onFilesChosen,
}: Props): React.Node => {
  const inputRef = React.useRef<?HTMLInputElement>(null);

  return (
    <>
      <IconButton
        size="small"
        disabled={disabled}
        tooltip={t`Attach images or files`}
        onClick={e => {
          // The button is in the label of the text field.
          e.preventDefault();
          if (inputRef.current) inputRef.current.click();
        }}
      >
        <Add />
      </IconButton>
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          const files = Array.from(e.currentTarget.files || []);
          // Allow choosing the same file again.
          e.currentTarget.value = '';
          if (files.length) onFilesChosen(files);
        }}
      />
    </>
  );
};
