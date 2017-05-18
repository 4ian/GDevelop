import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import Welcome from './Welcome';

import StartPage from '../MainFrame/StartPage';
import {Tabs, Tab} from '../UI/Tabs';
import muiDecorator from './MuiDecorator';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Tabs', module)
  .addDecorator(muiDecorator)
  .add('3 tabs', () =>
    <Tabs>
      <Tab label="Tab 1" onClose={action("Close tab 1")}>
        <div>Tab 1 content</div>
      </Tab>
      <Tab label="Tab 2" onClose={action("Close tab 2")}>
        <div>Tab 2 content</div>
      </Tab>
      <Tab label="Tab 3" onClose={action("Close tab 3")}>
        <div>Tab 3 content</div>
      </Tab>
    </Tabs>
  )

storiesOf('StartPage', module)
  .addDecorator(muiDecorator)
  .add('default', () =>
    <StartPage />
  )