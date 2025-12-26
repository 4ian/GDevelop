// @flow
/**
 * Scratch Project Import Dialog
 * UI for importing Scratch projects into GDevelop
 */

import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';
import LinearProgress from '../../UI/LinearProgress';
import {
  convertScratchToGDevelop,
  validateScratchFile,
  type GDevelopProject,
} from './index';

type Props = {|
  onClose: () => void,
  onProjectImported: (project: GDevelopProject) => void,
  open: boolean,
|};

const ScratchImportDialog = ({ onClose, onProjectImported, open }: Props) => {
  const [selectedFile, setSelectedFile] = React.useState<?File>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [error, setError] = React.useState<?string>(null);
  const [progress, setProgress] = React.useState(0);
  const fileInputRef = React.useRef<?HTMLInputElement>(null);

  const handleFileSelect = (event: SyntheticInputEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (validateScratchFile(file)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Invalid Scratch file. Please select a .sb3 or .sb2 file.');
        setSelectedFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setProgress(0);
    setError(null);

    try {
      setProgress(0.1);

      // Convert Scratch project
      const gdProject = await convertScratchToGDevelop(selectedFile);

      setProgress(0.8);

      if (!gdProject) {
        throw new Error('Failed to convert Scratch project');
      }

      setProgress(1.0);

      // Call the callback with converted project
      onProjectImported(gdProject);

      // Reset and close
      setSelectedFile(null);
      setIsImporting(false);
      onClose();
    } catch (err) {
      console.error('Error importing Scratch project:', err);
      setError(err.message || 'An error occurred while importing the project');
      setIsImporting(false);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Import Scratch Project</Trans>}
          actions={[
            <FlatButton
              key="cancel"
              label={<Trans>Cancel</Trans>}
              onClick={onClose}
              disabled={isImporting}
            />,
            <RaisedButton
              key="import"
              label={<Trans>Import</Trans>}
              primary
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
            />,
          ]}
          onRequestClose={onClose}
          open={open}
          maxWidth="md"
        >
          <Column noMargin>
            <Text>
              <Trans>
                Import a Scratch project (.sb3 or .sb2) and convert it to a
                GDevelop project. Sprites, costumes, sounds, and blocks will be
                converted to GDevelop objects and events.
              </Trans>
            </Text>

            {error && <AlertMessage kind="error">{error}</AlertMessage>}

            <Line justifyContent="center" alignItems="center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".sb3,.sb2"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <RaisedButton
                label={<Trans>Browse for Scratch File...</Trans>}
                onClick={handleBrowseClick}
                disabled={isImporting}
              />
            </Line>

            {selectedFile && (
              <Column noMargin>
                <Text size="block-title">
                  <Trans>Selected File:</Trans>
                </Text>
                <Text>{selectedFile.name}</Text>
                <Text size="body-small">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </Column>
            )}

            {isImporting && (
              <Column noMargin>
                <Text>
                  <Trans>Importing Scratch project...</Trans>
                </Text>
                <LinearProgress
                  value={progress}
                  variant={progress > 0 ? 'determinate' : 'indeterminate'}
                />
              </Column>
            )}

            <AlertMessage kind="info">
              <Trans>
                Note: Not all Scratch features may be fully supported. Complex
                blocks and custom extensions may need manual adjustment after
                import.
              </Trans>
            </AlertMessage>
          </Column>
        </Dialog>
      )}
    </I18n>
  );
};

export default ScratchImportDialog;
