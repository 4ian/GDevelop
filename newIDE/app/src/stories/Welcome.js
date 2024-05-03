// @flow
import * as React from 'react';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';
import AlertMessage from '../UI/AlertMessage';

export default function Welcome() {
  return (
    <Column>
      <Text size="title">Welcome to GDevelop Storybook</Text>
      <Text>This is a UI component dev environment for GDevelop.</Text>
      <Text>
        Stories are inside the "newIDE/app/src/stories" directory.
        <br />A story is a single state of one or more UI components. You can
        have as many stories as you want. Basically a story is like a visual
        test case.
      </Text>
      <AlertMessage kind="info">
        Use Storybook to test discover existing components, check how they work
        and verify that they still work after a change. Add new stories for your
        new components.
      </AlertMessage>
    </Column>
  );
}
