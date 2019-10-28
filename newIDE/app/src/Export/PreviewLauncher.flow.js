// @flow
import * as React from 'react';

export type PreviewOptions =
  | {|
      networkPreview?: boolean,
    |}
  | {||};

/** The functions that PreviewLauncher must expose on their class */
export type PreviewLauncherInterface = {
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

/** The props that PreviewLauncher must support */
export type PreviewLauncherProps = {|
  onExport: () => void,
  onChangeSubscription: () => void,
|};

/**
 * A PreviewLaunchComponent supports the props and has at least the functions exposed in PreviewLauncherInterface.
 * This is important as MainFrame is keeping ref to it to launch previews.
 */
export type PreviewLauncherComponent = React.AbstractComponent<
  PreviewLauncherProps,
  PreviewLauncherInterface
>;
