// @flow

import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import EmptyEditor from '../../../ObjectEditor/Editors/EmptyEditor';

export default {
  title: 'ObjectEditor/EmptyEditor',
  component: EmptyEditor,
  decorators: [muiDecorator, paperDecorator],
};

export const Default = () => <EmptyEditor />;
