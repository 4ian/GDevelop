// @flow
import * as React from 'react';
import SceneIcon from '../../../UI/CustomSvgIcons/Scene';
import ExternalEventsIcon from '../../../UI/CustomSvgIcons/ExternalEvents';
import ExtensionIcon from '../../../UI/CustomSvgIcons/Extension';
import type {
  GlobalSearchGroup,
  GlobalSearchMatch,
} from '../../../Utils/EventsGlobalSearchScanner';
import type { EventPath } from '../../../Utils/EventPath';

export const getEventPathLabel = (path: EventPath): string =>
  path.length ? path.map(index => index + 1).join(' > ') : '-';

export const deduplicateEventPaths = (
  matches: Array<GlobalSearchMatch>
): Array<EventPath> => {
  const uniquePathByKey = new Map<string, EventPath>();
  matches.forEach(match => {
    const key = match.eventPath.join('.');
    if (!uniquePathByKey.has(key)) {
      uniquePathByKey.set(key, match.eventPath);
    }
  });
  return [...uniquePathByKey.values()];
};

export const getGroupIcon = (group: GlobalSearchGroup): React.Node => {
  switch (group.targetType) {
    case 'layout':
      return <SceneIcon />;
    case 'external-events':
      return <ExternalEventsIcon />;
    case 'extension':
      return <ExtensionIcon />;
    default:
      return null;
  }
};
