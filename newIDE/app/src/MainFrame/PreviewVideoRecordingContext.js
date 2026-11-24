// @flow
import * as React from 'react';

export type PreviewVideoRecording = {|
  /** The id of the game of the project opened in the editor, if any. */
  currentProjectGameId: ?string,
  /** Launch a preview where the user records the preview video of the opened project. */
  onRecordPreviewVideo: () => Promise<void>,
|};

const PreviewVideoRecordingContext: React.Context<PreviewVideoRecording> = React.createContext<PreviewVideoRecording>(
  {
    currentProjectGameId: null,
    onRecordPreviewVideo: async () => {},
  }
);

export default PreviewVideoRecordingContext;
