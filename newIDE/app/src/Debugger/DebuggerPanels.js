// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import ProfilerIcon from '../UI/CustomSvgIcons/Profiler';
import InspectorIcon from '../UI/CustomSvgIcons/Debug';
import ConsoleIcon from '../UI/CustomSvgIcons/Console';
import GraphsIcon from '../UI/CustomSvgIcons/Graphs';
import ProjectResourcesIcon from '../UI/CustomSvgIcons/ProjectResources';

export type DebuggerPanelName =
  | 'inspector'
  | 'profiler'
  | 'performance'
  | 'resources'
  | 'console';

export type DebuggerPanel = {|
  name: DebuggerPanelName,
  /** Shown on the button of the toolbar opening the panel. */
  icon: React.ComponentType<any>,
  /** The tooltip of the button, and the title of the panel. */
  title: MessageDescriptor,
  /** Where the panel is opened the first time, in the mosaic of the debugger. */
  position: 'left' | 'right' | 'bottom',
|};

/**
 * The panels of the debugger, in the order of their buttons in the toolbar:
 * declared once for the toolbar and the mosaic of the debugger.
 */
export const DEBUGGER_PANELS: Array<DebuggerPanel> = [
  {
    name: 'inspector',
    icon: InspectorIcon,
    title: t`Inspector`,
    position: 'left',
  },
  {
    name: 'profiler',
    icon: ProfilerIcon,
    title: t`Profiler`,
    position: 'bottom',
  },
  {
    name: 'performance',
    icon: GraphsIcon,
    title: t`Performance`,
    position: 'bottom',
  },
  {
    name: 'resources',
    icon: ProjectResourcesIcon,
    title: t`Resources`,
    position: 'bottom',
  },
  {
    name: 'console',
    icon: ConsoleIcon,
    title: t`Console`,
    position: 'bottom',
  },
];
