// @flow
import * as React from 'react';
import LightweightJavaScriptCodeBlock from '../../../UI/LightweightJavaScriptCodeBlock';
import paperDecorator from '../../PaperDecorator';
import FixedWidthFlexContainer from '../../FixedWidthFlexContainer';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';

export default {
  title: 'UI Building Blocks/LightweightJavaScriptCodeBlock',
  component: LightweightJavaScriptCodeBlock,
  decorators: [paperDecorator],
};

const scriptCode = `const scene = 'Level1';
// Place the coins in an arc above the platforms.
for (let i = 0; i < 10; i++) {
  const x = 200 + i * 60;
  const y = 300 - Math.sin((i / 9) * Math.PI) * 120;
  await put_2d_instances({ scene_name: scene, object_name: 'Coin', brush_kind: 'point', brush_position: \`\${x},\${y}\` });
}

/* A block comment,
   on two lines. */
console.log('Placed 10 coins.', { done: true, count: 10 });
return 'Placed 10 coins in an arc.';`;

export const Default = (): React.Node => (
  <LightweightJavaScriptCodeBlock code={scriptCode} />
);

// The line an error was reported on is tinted and marked.
export const WithAHighlightedLine = (): React.Node => (
  <LightweightJavaScriptCodeBlock
    code={`const scene = 'Level1';
for (let i = 0; i < 10; i++ {
  await put_2d_instances({ scene_name: scene, object_name: 'Coin' });
}`}
    highlightedLineNumber={2}
  />
);

export const WithoutLineNumbers = (): React.Node => (
  <LightweightJavaScriptCodeBlock
    code={`await create_or_replace_object({ object_name: 'Coin' });`}
    showLineNumbers={false}
  />
);

// Past `maxHeight`, the code scrolls instead of pushing the layout down.
export const TallCodeScrolling = (): React.Node => (
  <LightweightJavaScriptCodeBlock
    code={Array.from(
      { length: 40 },
      (unusedValue, index) =>
        `console.log('Line ${index + 1} of a long script', ${index + 1});`
    ).join('\n')}
    maxHeight={140}
  />
);

// In a narrow container, long lines wrap instead of widening it (which is what
// lets the block live inside a chat row).
export const InANarrowContainer = (): React.Node => (
  <FixedWidthFlexContainer width={280}>
    <ColumnStackLayout noMargin expand>
      <Text noMargin size="body-small" color="secondary">
        A 280px wide container:
      </Text>
      <LightweightJavaScriptCodeBlock code={scriptCode} maxHeight={200} />
    </ColumnStackLayout>
  </FixedWidthFlexContainer>
);

export const EmptyCode = (): React.Node => (
  <LightweightJavaScriptCodeBlock code="" />
);
