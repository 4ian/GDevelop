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
    source={`# Title 1
## Title 2
### Title 3
#### Title 4

This is some text that can contain [links](https://gdevelop.io), ~~strike through text~~, **bold** and *italic* words.

But also tables:

|Hello|world|!|
|-|:-:|-:|
|Hi|silly|you|

And code also: \`ToString(5)\`

And unordered lists too:

- First item

  Other text under the item

- Second item

  - Sub item

But ordered lists as well:

1. First chapter

   Other text under the item

1. Second chapter

   1. First sub item
   1. Second sub item
`}
  />
);
