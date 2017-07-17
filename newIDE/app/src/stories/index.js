import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import Welcome from './Welcome';

import StartPage from '../MainFrame/StartPage';
import AboutDialog from '../MainFrame/AboutDialog';
import LocalCreateDialog from '../ProjectCreation/LocalCreateDialog';
import { Tabs, Tab } from '../UI/Tabs';
import DragHandle from '../UI/DragHandle';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import LocalExport from '../Export/LocalExport';
import LocalMobileExport from '../Export/LocalMobileExport';
import LocalS3Export from '../Export/LocalS3Export';
import TextEditor from '../ObjectEditor/Editors/TextEditor';
import TiledSpriteEditor from '../ObjectEditor/Editors/TiledSpriteEditor';
import PanelSpriteEditor from '../ObjectEditor/Editors/PanelSpriteEditor';
import SpriteEditor from '../ObjectEditor/Editors/SpriteEditor';
import EmptyEditor from '../ObjectEditor/Editors/EmptyEditor';
import ShapePainterEditor from '../ObjectEditor/Editors/ShapePainterEditor';
import AdMobEditor from '../ObjectEditor/Editors/AdMobEditor';
import ObjectsList from '../ObjectsList';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';
import SerializedObjectDisplay from './SerializedObjectDisplay';
import muiDecorator from './MuiDecorator';
import paperDecorator from './PaperDecorator';
import {
  project,
  shapePainterObject,
  adMobObject,
  tiledSpriteObject,
  panelSpriteObject,
  textObject,
  spriteObject,
  testLayout,
  testLayoutInstance1,
} from './TestProject';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

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
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <LocalExport open project={project} onClose={action('close')} />
  ));

storiesOf('LocalS3Export', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <LocalS3Export open project={project} onClose={action('close')} />
  ));

storiesOf('LocalMobileExport', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
      <LocalMobileExport />
  ));

storiesOf('LocalFolderPicker', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <LocalFolderPicker floatingLabelText="Export folder" />
  ))
  .add('full width', () => (
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

storiesOf('DragHandle', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <DragHandle />);

storiesOf('TextEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={textObject}>
      <TextEditor object={textObject} project={project} />
    </SerializedObjectDisplay>
  ));

storiesOf('TiledSpriteEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={tiledSpriteObject}>
      <TiledSpriteEditor object={tiledSpriteObject} project={project} />
    </SerializedObjectDisplay>
  ));

storiesOf('PanelSpriteEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={panelSpriteObject}>
      <PanelSpriteEditor object={panelSpriteObject} project={project} />
    </SerializedObjectDisplay>
  ));

storiesOf('SpriteEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={spriteObject}>
      <SpriteEditor object={spriteObject} project={project} />
    </SerializedObjectDisplay>
  ));

storiesOf('ShapePainterEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={shapePainterObject}>
      <ShapePainterEditor object={shapePainterObject} project={project} />
    </SerializedObjectDisplay>
  ));

storiesOf('AdMobEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={adMobObject}>
      <AdMobEditor object={adMobObject} project={project} />
    </SerializedObjectDisplay>
  ));

storiesOf('EmptyEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EmptyEditor />
  ));

storiesOf('ObjectsList', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testLayout}>
      <div style={{height: 250}}>
        <ObjectsList
          getThumbnail={() => 'res/unknown32.png'}
          project={project}
          objectsContainer={testLayout}
          onEditObject={action('On edit object')}
        />
      </div>
    </SerializedObjectDisplay>
  ));

storiesOf('InstancePropertiesEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testLayout}>
      <InstancePropertiesEditor
        project={project}
        layout={testLayout}
        instances={[testLayoutInstance1]}
      />
    </SerializedObjectDisplay>
  ));
