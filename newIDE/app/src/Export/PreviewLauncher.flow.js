export type PreviewOptions = {|
  networkPreview?: boolean,
|};

export type PreviewLauncher = {
  launchLayoutPreview: (
    project: gdProject,
    layout: gdLayout,
    options: PreviewOptions
  ) => Promise<any>,

  launchExternalLayoutPreview: (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout,
    options: PreviewOptions
  ) => Promise<any>,

  canDoNetworkPreview: () => boolean,
};
