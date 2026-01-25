// @flow
import * as React from 'react';
import TextBasedCourseChapterCodeBlock from '../../../Course/TextBasedCourseChapterCodeBlock';
import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Course/TextBasedCourseChapterCodeBlock',
  component: TextBasedCourseChapterCodeBlock,
  decorators: [paperDecorator],
};

export const Default = () => (
  <TextBasedCourseChapterCodeBlock
    language="javascript"
    code={`// Example GDevelop JavaScript code
const player = runtimeScene.getdObjects("Player")[0];
if (player.getX() < 100) {
  player.setX(player.getX() + 5);
}`}
  />
);

export const LongCode = () => (
  <TextBasedCourseChapterCodeBlock
    language="javascript"
    code={`// Longer example to test scrolling and layout
for (let i = 0; i < 10; i++) {
  const enemy = runtimeScene.createObject("Enemy");
  enemy.setPosition(Math.random() * 800, Math.random() * 600);
  enemy.addForceTowardPosition(player.getX(), player.getY(), 150, 1);
  console.log("Enemy #" + i + " spawned!");
}`}
  />
);

export const NonHighlightedCode = () => (
  <TextBasedCourseChapterCodeBlock
    language="python"
    code={`# Example Python code (no JS highlighting)
for i in range(5):
    print("Hello from GDevelop!", i)`}
  />
);
