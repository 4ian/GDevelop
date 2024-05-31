// @flow
import * as React from 'react';
import InAppTutorialContext from './InAppTutorialContext';
import { setCurrentlyRunningInAppTutorial } from '../Utils/Analytics/EventSender';
import {
  fetchInAppTutorial,
  fetchInAppTutorialShortHeaders,
  type InAppTutorialShortHeader,
  type InAppTutorial,
} from '../Utils/GDevelopServices/InAppTutorial';
import { IN_APP_TUTORIALS_FETCH_TIMEOUT } from '../Utils/GlobalFetchTimeouts';
import optionalRequire from '../Utils/OptionalRequire';
import Window from '../Utils/Window';
import { openFilePicker, readJSONFile } from '../Utils/FileSystem';
import { checkInAppTutorialFileJsonSchema } from './SchemaChecker';
const electron = optionalRequire('electron');

type Props = {| children: React.Node |};

const InAppTutorialProvider = (props: Props) => {
  const [tutorial, setTutorial] = React.useState<InAppTutorial | null>(null);
  const [fetchingError, setFetchingError] = React.useState<string | null>(null);
  const [startStepIndex, setStartStepIndex] = React.useState<number>(0);
  const [startProjectData, setStartProjectData] = React.useState<{
    [key: string]: string,
  }>({});
  const [
    inAppTutorialShortHeaders,
    setInAppTutorialShortHeaders,
  ] = React.useState<?Array<InAppTutorialShortHeader>>(null);

  const getInAppTutorialShortHeader = React.useCallback(
    (tutorialId: string) => {
      if (!inAppTutorialShortHeaders) return null;
      const inAppTutorialShortHeader = inAppTutorialShortHeaders.find(
        shortHeader => shortHeader.id === tutorialId
      );
      return inAppTutorialShortHeader;
    },
    [inAppTutorialShortHeaders]
  );

  const startTutorial = React.useCallback(
    async ({
      tutorialId,
      initialStepIndex,
      initialProjectData,
      inAppTutorial,
    }: {|
      tutorialId: string,
      initialStepIndex: number,
      initialProjectData: { [key: string]: string },
      inAppTutorial?: InAppTutorial,
    |}) => {
      let inAppTutorialToLoad = inAppTutorial;
      if (!inAppTutorialToLoad) {
        if (!inAppTutorialShortHeaders) return;

        const inAppTutorialShortHeader = getInAppTutorialShortHeader(
          tutorialId
        );

        if (!inAppTutorialShortHeader) return;

        inAppTutorialToLoad = await fetchInAppTutorial(
          inAppTutorialShortHeader
        );
      }
      setStartStepIndex(initialStepIndex);
      setStartProjectData(initialProjectData);
      setTutorial(inAppTutorialToLoad);
      setCurrentlyRunningInAppTutorial(tutorialId);
    },
    [getInAppTutorialShortHeader, inAppTutorialShortHeaders]
  );

  const endTutorial = () => {
    setTutorial(null);
    setCurrentlyRunningInAppTutorial(null);
  };

  const loadInAppTutorials = React.useCallback(async () => {
    setFetchingError(null);
    try {
      const fetchedInAppTutorialShortHeaders = await fetchInAppTutorialShortHeaders();
      setInAppTutorialShortHeaders(fetchedInAppTutorialShortHeaders);
    } catch (error) {
      console.error('An error occurred when fetching in app tutorials:', error);
      setFetchingError('fetching-error');
    }
  }, []);

  const onLoadInAppTutorialFromLocalFile = React.useCallback(
    async () => {
      if (!electron) {
        Window.showMessageBox(
          'This option is available on the desktop app only.'
        );
        return;
      }
      const filePath = await openFilePicker({
        title: 'Open a guided lesson',
        properties: ['openFile'],
        message: 'Choose a guided lesson (.json file)',
        filters: [{ name: 'GDevelop 5 in-app tutorial', extensions: ['json'] }],
      });
      if (!filePath) return;
      const inAppTutorial = await readJSONFile(filePath);
      const errors = checkInAppTutorialFileJsonSchema(inAppTutorial);
      if (errors.length) {
        console.error(
          "Guided lesson file doesn't respect the format. See errors:",
          errors
        );
        Window.showMessageBox(
          "Guided lesson file doesn't respect the format. Check developer console for details."
        );
        return;
      }
      if (inAppTutorial.initialTemplateUrl) {
        console.warn(
          'Starting tutorial from file. The tutorial has the field initialTemplateUrl set so make sure the project is already open in the editor.'
        );
      }
      startTutorial({
        tutorialId: inAppTutorial.id,
        initialProjectData: inAppTutorial.initialProjectData || {},
        initialStepIndex: 0,
        inAppTutorial,
      });
    },
    [startTutorial]
  );

  // Preload the in-app tutorial short headers when the app loads.
  React.useEffect(
    () => {
      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching in-app tutorials...');
        loadInAppTutorials();
      }, IN_APP_TUTORIALS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [loadInAppTutorials]
  );

  return (
    <InAppTutorialContext.Provider
      value={{
        inAppTutorialShortHeaders,
        getInAppTutorialShortHeader,
        currentlyRunningInAppTutorial: tutorial,
        startTutorial,
        startProjectData,
        endTutorial,
        startStepIndex,
        inAppTutorialsFetchingError: fetchingError,
        fetchInAppTutorials: loadInAppTutorials,
        onLoadInAppTutorialFromLocalFile,
      }}
    >
      {props.children}
    </InAppTutorialContext.Provider>
  );
};

export default InAppTutorialProvider;
