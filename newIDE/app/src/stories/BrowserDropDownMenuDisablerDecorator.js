// @flow
import * as React from 'react';
import { type StoryDecorator } from '@storybook/react';
import WindowUtils from '../Utils/Window';

type GDevelopJsInitializerProps = {|
  children: () => React.Node,
|};

const BrowserDropDownMenuDisabler = ({
  children,
}: GDevelopJsInitializerProps) => {
  React.useEffect(() => {
    WindowUtils.setUpContextMenu();
  }, []);

  return children();
};

const BrowserDropDownMenuDisablerDecorator: StoryDecorator = (
  Story,
  context
) => (
  <BrowserDropDownMenuDisabler>{() => <Story />}</BrowserDropDownMenuDisabler>
);

export default BrowserDropDownMenuDisablerDecorator;
