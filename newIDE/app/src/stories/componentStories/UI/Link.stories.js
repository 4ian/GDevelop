// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import Link from '../../../UI/Link';
import Text from '../../../UI/Text';
import Window from '../../../Utils/Window';
import { getHelpLink } from '../../../Utils/HelpLink';

export default {
  title: 'UI Building Blocks/Link',
  component: Link,
  decorators: [paperDecorator],
};

export const Default = () => (
  <Text>
    This is a link to{' '}
    <Link
      href="source"
      onClick={() => Window.openExternalURL(getHelpLink('/publishing'))}
    >
      better configure your GDevelop project
    </Link>
    .
  </Text>
);
