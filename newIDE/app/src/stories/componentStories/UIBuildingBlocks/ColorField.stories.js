// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import paperDecorator from '../../PaperDecorator';
import ColorField from '../../../UI/ColorField';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/ColorField',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <div>
    <ColorField
      floatingLabelText="Particles start color"
      disableAlpha
      fullWidth
      color="100;100;200"
      onChange={() => {}}
    />
    <ColorField
      floatingLabelText="This has a helper text"
      disableAlpha
      fullWidth
      color="100;100;200"
      onChange={() => {}}
      helperMarkdownText="Lorem ipsum **dolor sit amet**, consectetur _adipiscing elit_, [sed do eiusmod](http://example.com) tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    />
    <ColorField
      floatingLabelText="This is not full width"
      disableAlpha
      color="100;100;200"
      onChange={() => {}}
    />
  </div>
);

export { Default as __________Default };
Default.storyName = 'default';
