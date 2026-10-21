// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import Background from '../../../UI/Background';
import { Column } from '../../../UI/Grid';
import Text from '../../../UI/Text';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/Text',
};

const Default = (): React.Node => (
  <Column>
    <Text size="title">Title text</Text>
    <Text size="body">
      Usual body text. For most usages. Lorem ipsum dolor sit amet, consectetur
      adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </Text>
    <Text size="body2">
      Smaller text. For rare use cases. Lorem ipsum dolor sit amet, consectetur
      adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
      magna aliqua.
    </Text>
  </Column>
);

export { Default as ________Default };
Default.storyName = 'default';

export const OnABackground = (): React.Node => (
  <Background>
    <Column>
      <Text size="title">Title text</Text>
      <Text size="body">
        Usual body text. For most usages. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua.
      </Text>
      <Text size="body2">
        Smaller text. For rare use cases. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua.
      </Text>
    </Column>
  </Background>
);
OnABackground.storyName = 'on a Background';
