// @flow

import * as React from 'react';

import paperDecorator from '../../PaperDecorator';
import EmptyEditor from '../../../ObjectEditor/Editors/EmptyEditor';

export default {
  title: 'ObjectEditor/EmptyEditor',
  component: EmptyEditor,
  decorators: [paperDecorator],
};

export const Default = () => <EmptyEditor renderObjectNameField={() => null} />;
