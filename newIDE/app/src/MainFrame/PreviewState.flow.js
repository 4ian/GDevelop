// @flow

/** Represents what should be run when a preview is launched */
export type PreviewState = {|
  /** The previewed layout name, set by the current editor. */
  previewLayoutName: ?string,
  /** The previewed external layout name, set by the current editor. */
  previewExternalLayoutName: ?string,

  /** If true, the previewed layout/external layout is overriden, */
  isPreviewOverriden: boolean,
  /** The layout name to be used instead of the one set by the current editor. */
  overridenPreviewLayoutName: ?string,
  /** The external layout name to be used instead of the one set by the current editor. */
  overridenPreviewExternalLayoutName: ?string,
|};
