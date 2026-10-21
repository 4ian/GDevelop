// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import LocalFolderPicker from '../../UI/LocalFolderPicker';
import paperDecorator from '../PaperDecorator';
import ValueStateHolder from '../ValueStateHolder';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'LocalFolderPicker',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <ValueStateHolder
    initialValue={'Test'}
    render={(value, onChange) => (
      <LocalFolderPicker value={value} onChange={onChange} type="export" />
    )}
  />
);

export { Default as _______________Default };
Default.storyName = 'default';

export const FullWidth = (): React.Node => (
  <ValueStateHolder
    initialValue={'Test'}
    render={(value, onChange) => (
      <LocalFolderPicker
        value={value}
        onChange={onChange}
        type="export"
        fullWidth
      />
    )}
  />
);
FullWidth.storyName = 'full width';
