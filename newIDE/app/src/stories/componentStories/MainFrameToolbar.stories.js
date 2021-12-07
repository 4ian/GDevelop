// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import MainFrameToolbar, {
  type MainFrameToolbarProps,
  type ToolbarInterface,
} from '../../MainFrame/Toolbar';
import ToolbarIcon from '../../UI/ToolbarIcon';

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
    <ToolbarIcon src="res/ribbon_default/bug32.png" tooltip="test" />
    <ToolbarIcon src="res/ribbon_default/bug32.png" tooltip="test" />
    <ToolbarIcon src="res/ribbon_default/bug32.png" tooltip="test" />
    <ToolbarIcon src="res/ribbon_default/bug32.png" tooltip="test" />
  </span>
);

const defaultProps: MainFrameToolbarProps = {
  showProjectIcons: true,
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
  exportProject: () => {},
  hasProject: false,
};

export const EditorNotLoaded = () => (
  <MainFrameToolbar {...defaultProps} showProjectIcons={false} />
);

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
      previewLayoutName: 'test',
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
      previewExternalLayoutName: 'test',
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
      overridenPreviewLayoutName: 'test',
      previewExternalLayoutName: null,
      previewLayoutName: 'test',
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
      overridenPreviewExternalLayoutName: 'test',
      overridenPreviewLayoutName: 'test',
      previewExternalLayoutName: 'test',
      previewLayoutName: 'test',
    }}
  />
);

export const ProjectOpenWithOtherToolbar = () => {
  const toolbar = React.useRef<?ToolbarInterface>(null);
  React.useEffect(
    () => {
      if (toolbar.current) {
        toolbar.current.setEditorToolbar(fakeEditorToolbar);
      }
    },
    [toolbar]
  );
  const component = (
    <MainFrameToolbar
      {...defaultProps}
      ref={toolbar}
      isPreviewEnabled
      hasProject
    />
  );

  return component;
};

export const PreviewRunning = () => (
  <MainFrameToolbar
    {...defaultProps}
    isPreviewEnabled
    hasProject
    hasPreviewsRunning
  />
);
