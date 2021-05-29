// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { ExampleStore } from '../AssetStore/ExampleStore';
import { getExample } from '../Utils/GDevelopServices/Asset';
import Divider from '@material-ui/core/Divider';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { Column, Line } from '../UI/Grid';
import optionalRequire from '../Utils/OptionalRequire.js';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import LocalFileStorageProvider from '../ProjectsStorage/LocalFileStorageProvider';
import { writeAndCheckFile } from '../ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter';
import axios from 'axios';
const path = optionalRequire('path');
var fs = optionalRequire('fs-extra');

type Props = {|
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void,
  onChangeOutputPath: (outputPath: string) => void,
  outputPath: string,
|};

export const showGameFileCreationError = (
  i18n: I18nType,
  outputPath: string,
  rawError: Error
) => {
  showErrorBox({
    message: i18n._(
      t`Unable to create the game in the specified folder. Check that you have permissions to write in this folder: ${outputPath} or choose another folder.`
    ),
    rawError,
    errorId: 'local-example-creation-error',
  });
};

export default function LocalExamples({
  outputPath,
  onChangeOutputPath,
  onOpen,
}: Props) {
  const [isOpening, setIsOpening] = React.useState(false);

  return (
    <I18n>
      {({ i18n }) => (
        <Column noMargin>
          <Line expand>
            <Column expand>
              <LocalFolderPicker
                fullWidth
                value={outputPath}
                onChange={onChangeOutputPath}
                type="create-game"
              />
            </Column>
          </Line>
          <Divider />
          <ExampleStore
            isOpening={isOpening}
            onOpen={async (exampleShortHeader: ExampleShortHeader) => {
              if (!fs || !outputPath) return;
              try {
                setIsOpening(true);
                const example = await getExample(exampleShortHeader);

                // Prepare the folder for the example.
                fs.mkdirsSync(outputPath);

                // Download the project file and save it.
                const response = await axios.get(example.projectFileUrl, {
                  responseType: 'text',
                  // Required to properly get the response as text, and not as JSON:
                  transformResponse: [data => data],
                });
                const projectFileContent = response.data;
                const localFilePath = path.join(outputPath, 'game.json');

                await writeAndCheckFile(projectFileContent, localFilePath);

                // Open the project file. Note that resources that are URLs will be downloaded
                // thanks the the LocalResourceFetcher.
                onOpen(LocalFileStorageProvider, {
                  fileIdentifier: localFilePath,
                });

                sendNewGameCreated(example.projectFileUrl);
              } catch (error) {
                showErrorBox({
                  message: 'TODO',
                  rawError: error,
                  errorId: 'local-example-load-error',
                });
              } finally {
                setIsOpening(false);
              }
            }}
          />
        </Column>
      )}
    </I18n>
  );
}
