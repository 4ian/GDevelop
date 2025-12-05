// @flow

import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { MarkdownText } from '../UI/MarkdownText';
import { Trans } from '@lingui/macro';
import ReactMarkdown from 'react-markdown';

type Props = {|
  calloutType?: 'info' | 'warning' | 'tip' | 'note',
  title: string,
  text: string,
  children?: React.Node,
|};

const TextBasedCourseChapterCalloutBlock = ({
  title,
  text,
  calloutType = 'info',
  children,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const isDarkMode = gdevelopTheme.palette.type === 'dark';
  const backgroundColor = isDarkMode ? '#0f172a' : '#f3f4f6';
  const borderColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(15, 23, 42, 0.15)';

  const getIcon = (type: string): string => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'tip':
        return '💡';
      case 'note':
        return '📝';
      default:
        return '📝';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 16,
        borderRadius: 8,
        border: '1px solid transparent',
        borderColor,
        backgroundColor,
        alignItems: 'flex-start',
        fontFamily: gdevelopTheme.fontFamily || 'sans-serif',
      }}
    >
      <div style={{ fontSize: 24, lineHeight: 1 }}>{getIcon(calloutType)}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{title}</div>

        <MarkdownText key={title} allowParagraphs source={text} />
      </div>
    </div>
  );
};

export default TextBasedCourseChapterCalloutBlock;
