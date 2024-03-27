// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import { MarkdownText } from '../../../UI/MarkdownText';

export default {
  title: 'UI Building Blocks/MarkdownText',
  component: MarkdownText,
  decorators: [paperDecorator],
};

export const Default = () => (
  <MarkdownText
    allowParagraphs
    source={
      '# Title 1\n## Title 2\n### Title 3\n#### Title 4\n\nThis is some text that can contain [links](https://gdevelop.io), ~~strike through text~~, **bold** and *italic* words.\n\nBut also tables:\n\n|Hello|world|!|\n|-|:-:|-:|\n|Hi|silly|you|\n\nAnd code also: `ToString(5)`'
    }
  />
);
