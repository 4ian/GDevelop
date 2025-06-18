// @flow

import React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import EmptyAndStartingPointProjects from '../ProjectCreation/EmptyAndStartingPointProjects';
import { ColumnStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { generateProjectName } from '../ProjectCreation/NewProjectSetupDialog';
import { type NewProjectSetup } from '../ProjectCreation/NewProjectSetupDialog';
import { Spacer } from '../UI/Grid';

type RenderCreateAiProjectDialogProps = {
  onCreateEmptyProject: (newProjectSetup: NewProjectSetup) => Promise<void>,
  onCreateProjectFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType,
    isQuickCustomization?: boolean
  ) => Promise<void>,
};

type CreateAiProjectDialogProps = {
  onClose: () => void,
  onSelectExampleShortHeader: (
    exampleShortHeader: ExampleShortHeader
  ) => Promise<void>,
  onSelectEmptyProject: () => Promise<void>,
};

const CreateAiProjectDialog = ({
  onClose,
  onSelectExampleShortHeader,
  onSelectEmptyProject,
}: CreateAiProjectDialogProps) => {
  return (
    <Dialog
      open
      title={<Trans>Ok! Choose a game style to start with</Trans>}
      id="ai-project-dialog"
      maxWidth="md"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
      flexColumnBody
    >
      <ColumnStackLayout noMargin>
        <Spacer />
        <EmptyAndStartingPointProjects
          onSelectExampleShortHeader={exampleShortHeader => {
            onSelectExampleShortHeader(exampleShortHeader);
          }}
          onSelectEmptyProject={() => {
            onSelectEmptyProject();
          }}
        />
        {/* Use a spacer to avoid extra scrollbars when template tiles are hovered. */}
        <Spacer />
      </ColumnStackLayout>
    </Dialog>
  );
};

type CreateAiProjectResult = 'canceled' | 'created';

export const useCreateAiProjectDialog = () => {
  const [createPromise, setCreatePromise] = React.useState<null | {|
    onFinished: (result: CreateAiProjectResult) => void,
    promise: Promise<CreateAiProjectResult>,
  |}>(null);

  const createAiProject: () => Promise<CreateAiProjectResult> = React.useCallback(
    () => {
      if (createPromise) {
        return createPromise.promise;
      }

      // Make a promise that we can resolve later from the creation dialog.
      let resolve: (result: CreateAiProjectResult) => void = () => {};
      const promise = new Promise(resolveFn => {
        resolve = resolveFn;
      });

      setCreatePromise({
        onFinished: (result: CreateAiProjectResult) => {
          setCreatePromise(null);
          resolve(result);
        },
        promise,
      });
      return promise;
    },
    [createPromise]
  );

  return {
    createAiProject,
    renderCreateAiProjectDialog: (props: RenderCreateAiProjectDialogProps) => {
      if (!createPromise) return null;

      return (
        <I18n>
          {({ i18n }) => (
            <CreateAiProjectDialog
              onClose={() => {
                createPromise.onFinished('canceled');
              }}
              onSelectExampleShortHeader={async exampleShortHeader => {
                const newProjectSetup: NewProjectSetup = {
                  storageProvider: UrlStorageProvider,
                  saveAsLocation: null,
                  dontOpenAnySceneOrProjectManager: true,
                };
                await props.onCreateProjectFromExample(
                  exampleShortHeader,
                  newProjectSetup,
                  i18n,
                  false // isQuickCustomization
                );
                createPromise.onFinished('created');
              }}
              onSelectEmptyProject={async () => {
                await props.onCreateEmptyProject({
                  projectName: generateProjectName('AI starter'),
                  storageProvider: UrlStorageProvider,
                  saveAsLocation: null,
                  dontOpenAnySceneOrProjectManager: true,
                });
                createPromise.onFinished('created');
              }}
            />
          )}
        </I18n>
      );
    },
  };
};
