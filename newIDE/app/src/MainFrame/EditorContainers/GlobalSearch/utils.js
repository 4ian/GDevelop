// @flow
import * as React from 'react';
import SceneIcon from '../../../UI/CustomSvgIcons/Scene';
import ExternalEventsIcon from '../../../UI/CustomSvgIcons/ExternalEvents';
import ExtensionIcon from '../../../UI/CustomSvgIcons/Extension';
import type {
  GlobalSearchGroup,
  GlobalSearchMatch,
} from '../../../Utils/EventsGlobalSearchScanner';

export const getEventPathLabel = (path: Array<number>): string =>
  path.length ? path.map(index => index + 1).join(' > ') : '-';

export const deduplicateEventPaths = (
  matches: Array<GlobalSearchMatch>
): Array<Array<number>> => {
  const uniquePathByKey = new Map<string, Array<number>>();
  matches.forEach(match => {
    const key = match.eventPath.join('.');
    if (!uniquePathByKey.has(key)) {
      uniquePathByKey.set(key, match.eventPath);
    }
  });
  return [...uniquePathByKey.values()];
};

export const getMatchContext = (match: any): string =>
  match.context || `Match at event path ${getEventPathLabel(match.eventPath)}`;

export type ParsedContext = {|
  type: 'standard' | 'condition-only' | 'action-only' | 'other',
  conditionText: string,
  actionText: string,
|};

export const parseMatchContext = (text: string): ParsedContext => {
  const ifThenPrefix = /^if\s+/i;
  const thenSeparator = /\s+then\s+/i;
  if (ifThenPrefix.test(text) && thenSeparator.test(text)) {
    const withoutIf = text.replace(ifThenPrefix, '');
    const split = withoutIf.split(thenSeparator);
    if (split.length >= 2) {
      return {
        type: 'standard',
        conditionText: split[0],
        actionText: split.slice(1).join(' then '),
      };
    }
  }

  if (/^Condition:\s/i.test(text)) {
    return {
      type: 'condition-only',
      conditionText: text.replace(/^Condition:\s/i, ''),
      actionText: '',
    };
  }
  if (/^Action:\s/i.test(text)) {
    return {
      type: 'action-only',
      conditionText: '',
      actionText: text.replace(/^Action:\s/i, ''),
    };
  }

  return { type: 'other', conditionText: text, actionText: '' };
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
