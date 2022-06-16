// @flow
import * as React from 'react';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import MainFrameToolbar, {
  type MainFrameToolbarProps,
  type ToolbarInterface,
} from '../../MainFrame/Toolbar';
import IconButton from '../../UI/IconButton';
import DebugIcon from '../../UI/CustomSvgIcons/Debug';

export default {
  title: 'MainFrameToolbar',
  component: MainFrameToolbar,
  decorators: [paperDecorator, muiDecorator],
};

const fakeEditorToolbar = (
  <span
    style={{
      flex: 1,
      display: 'flex',
      justifyContent: 'flex-end',
    }}
  >
    <IconButton
      size="small"
      tooltip={'Test tooltip'}
      color="default"
    >
      <DebugIcon />
    </IconButton>
    <IconButton
      size="small"
      tooltip={'Test tooltip'}
      color="default"
    >
      <DebugIcon />
    </IconButton>
    <IconButton
      size="small"
      tooltip={'Test tooltip'}
      disabled
      color="default"
    >
      <DebugIcon />
    </IconButton>
    <IconButton
      size="small"
      tooltip={'Test tooltip'}
      color="default"
    >
      <DebugIcon />
    </IconButton>
  </span>
);

const defaultProps: MainFrameToolbarProps = {
  hasProject: false,
  toggleProjectManager: () => {},
  requestUpdate: () => {},
  simulateUpdateDownloaded: () => {},
  simulateUpdateAvailable: () => {},
  exportProject: () => {},
  onPreviewWithoutHotReload: () => {},
  onOpenDebugger: () => {},
  onNetworkPreview: () => {},
  onHotReloadPreview: () => {},
  setPreviewOverride: () => {},
  canDoNetworkPreview: true,
  isPreviewEnabled: false,
  hasPreviewsRunning: false,
  previewState: {
    isPreviewOverriden: false,
    previewLayoutName: null,
    previewExternalLayoutName: null,
    overridenPreviewLayoutName: null,
    overridenPreviewExternalLayoutName: null,
  },
};

export const NoProjectLoaded = () => <MainFrameToolbar {...defaultProps} />;

export const ProjectOpenOnScene = () => (
  <MainFrameToolbar
    {...defaultProps}
    isPreviewEnabled
    hasProject
    previewState={{
      isPreviewOverriden: false,
      overridenPreviewExternalLayoutName: null,
      overridenPreviewLayoutName: null,
      previewExternalLayoutName: null,
      previewLayoutName: 'testLayout',
    }}
  />
);

export const ProjectOpenOnExternalLayout = () => (
  <MainFrameToolbar
    {...defaultProps}
    isPreviewEnabled
    hasProject
    previewState={{
      isPreviewOverriden: false,
      overridenPreviewExternalLayoutName: null,
      overridenPreviewLayoutName: null,
      previewExternalLayoutName: 'testExternalLayout',
      previewLayoutName: null,
    }}
  />
);

export const PreviewOverridenOnScene = () => (
  <MainFrameToolbar
    {...defaultProps}
    isPreviewEnabled
    hasProject
    previewState={{
      isPreviewOverriden: true,
      overridenPreviewExternalLayoutName: null,
      overridenPreviewLayoutName: 'testLayout',
      previewExternalLayoutName: null,
      previewLayoutName: 'testLayout',
    }}
  />
);

export const PreviewOverridenOnExternalLayout = () => (
  <MainFrameToolbar
    {...defaultProps}
    isPreviewEnabled
    hasProject
    previewState={{
      isPreviewOverriden: true,
      overridenPreviewExternalLayoutName: 'testExternalLayout',
      overridenPreviewLayoutName: 'testLayout',
      previewExternalLayoutName: 'testExternalLayout',
      previewLayoutName: 'testLayout',
    }}
  />
);

export const ProjectOpenWithOtherToolbar = () => {
  const toolbar = React.useRef<?ToolbarInterface>(null);
  React.useEffect(
    () => {
      if (toolbar.current) {
        toolbar.current.setEditorToolbar(fakeEditorToolbar, {
          showProjectButtons: true,
        });
      }
    },
    [toolbar]
  );

  return (
    <MainFrameToolbar
      {...defaultProps}
      ref={toolbar}
      isPreviewEnabled
      hasProject
    />
  );
};
export const PreviewRunning = () => {
  const toolbar = React.useRef<?ToolbarInterface>(null);
  React.useEffect(
    () => {
      if (toolbar.current) {
        toolbar.current.setEditorToolbar(fakeEditorToolbar, {
          showProjectButtons: true,
        });
      }
    },
    [toolbar]
  );

  return (
    <MainFrameToolbar
      {...defaultProps}
      ref={toolbar}
      isPreviewEnabled
      hasProject
      hasPreviewsRunning
    />
  );
};