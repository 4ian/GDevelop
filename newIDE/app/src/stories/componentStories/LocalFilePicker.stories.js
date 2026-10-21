// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../GDevelopJsInitializerDecorator';
import LocalFilePicker from '../../UI/LocalFilePicker';
import paperDecorator from '../PaperDecorator';
import ValueStateHolder from '../ValueStateHolder';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'LocalFilePicker',
  decorators: [paperDecorator],
};

export const _FullWidth = (): React.Node => (
  <ValueStateHolder
    initialValue={'/test/myfile.txt'}
    render={(value, onChange) => (
      <LocalFilePicker
        title="File picker title"
        message="File picker message"
        filters={[
          {
            name: 'Compressed file',
            extensions: ['zip'],
          },
        ]}
        value={value}
        defaultPath={'/'}
        onChange={onChange}
        fullWidth
      />
    )}
  />
);
_FullWidth.storyName = 'full width';
