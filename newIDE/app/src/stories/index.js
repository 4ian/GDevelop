import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import Welcome from './Welcome';

import StartPage from '../MainFrame/StartPage';
import AboutDialog from '../MainFrame/AboutDialog';
import LocalCreateDialog from '../ProjectCreation/LocalCreateDialog';
import { Tabs, Tab } from '../UI/Tabs';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import LocalExport from '../Export/LocalExport';
import LocalMobileExport from '../Export/LocalMobileExport';
import LocalS3Export from '../Export/LocalS3Export';
import Paper from 'material-ui/Paper';
import muiDecorator from './MuiDecorator';

const fakeProject = {
  getLastCompilationDirectory: () => '/Fake/Directory'
}

const fakeGD = {
  VersionWrapper: {
    fullString: () => "Fake",
    major: () => "Fake",
    minor: () => "Fake",
  },
};
window.gd = fakeGD;

storiesOf('Welcome', module).add('to Storybook', () => (
  <Welcome showApp={linkTo('Button')} />
));

storiesOf('Tabs', module)
  .addDecorator(muiDecorator)
  .add('3 tabs', () => (
    <Tabs>
      <Tab label="Tab 1" onClose={action('Close tab 1')}>
        <div>Tab 1 content</div>
      </Tab>
      <Tab label="Tab 2" onClose={action('Close tab 2')}>
        <div>Tab 2 content</div>
      </Tab>
      <Tab label="Tab 3 with a long label" onClose={action('Close tab 3')}>
        <div>Tab 3 content</div>
      </Tab>
    </Tabs>
  ))
  .add('long labels', () => (
    <Tabs>
      <Tab
        label="Tab 1 with a very very long label"
        onClose={action('Close tab 1')}
      >
        <div>Tab 1 content</div>
      </Tab>
      <Tab label="Small 2" onClose={action('Close tab 2')}>
        <div>Tab 2 content</div>
      </Tab>
      <Tab
        label="Tab 3 with a very very loooong label"
        onClose={action('Close tab 3')}
      >
        <div>Tab 3 content</div>
      </Tab>
      <Tab label="Small 4" onClose={action('Close tab 4')}>
        <div>Tab 4 content</div>
      </Tab>
    </Tabs>
  ));

storiesOf('LocalExport', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <Paper>
      <LocalExport open project={fakeProject} onClose={action('close')} />
    </Paper>
  ));

storiesOf('LocalS3Export', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <Paper>
      <LocalS3Export open project={fakeProject} onClose={action('close')} />
    </Paper>
  ));

storiesOf('LocalMobileExport', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <Paper>
      <LocalMobileExport />
    </Paper>
  ));

storiesOf('LocalFolderPicker', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <Paper>
      <LocalFolderPicker floatingLabelText="Export folder" />
    </Paper>
  )).add('full width', () => (
      <LocalFolderPicker floatingLabelText="Export folder" fullWidth />
  ));

storiesOf('StartPage', module)
  .addDecorator(muiDecorator)
  .add('default', () => <StartPage />);

storiesOf('AboutDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => <AboutDialog open />);


storiesOf('LocalCreateDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => <LocalCreateDialog open />);