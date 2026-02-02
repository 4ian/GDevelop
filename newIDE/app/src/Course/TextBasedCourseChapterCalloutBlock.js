// @flow

import * as React from 'react';
import { MarkdownText } from '../UI/MarkdownText';
import AlertMessage from '../UI/AlertMessage';

type Props = {|
  kind: 'info' | 'warning' | 'error' | 'valid',
  text: string,
|};

const TextBasedCourseChapterCalloutBlock = ({ text, kind }: Props) => {
  return (
    <AlertMessage kind={kind}>
      <MarkdownText allowParagraphs source={text} />
    </AlertMessage>
  );
};

export default TextBasedCourseChapterCalloutBlock;
