import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import Welcome from './Welcome';
import HelpButton from '../UI/HelpButton';
import StartPage from '../MainFrame/Editors/StartPage';
import AboutDialog from '../MainFrame/AboutDialog';
import CreateProjectDialog from '../ProjectCreation/CreateProjectDialog';
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
import PointsEditor from '../ObjectEditor/Editors/SpriteEditor/PointsEditor';
import EmptyEditor from '../ObjectEditor/Editors/EmptyEditor';
import ShapePainterEditor from '../ObjectEditor/Editors/ShapePainterEditor';
import AdMobEditor from '../ObjectEditor/Editors/AdMobEditor';
import ObjectsList from '../ObjectsList';
import ObjectSelector from '../ObjectsList/ObjectSelector';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';
import SerializedObjectDisplay from './SerializedObjectDisplay';
import EventsTree from '../EventsSheet/EventsTree';
import LayoutChooserDialog from '../MainFrame/Editors/LayoutChooserDialog';
import InstructionEditor from '../EventsSheet/InstructionEditor';
import EventsSheet from '../EventsSheet';
import BehaviorsEditor from '../BehaviorsEditor';
import ObjectsGroupEditor from '../ObjectsGroupEditor';
import ObjectsGroupsList from '../ObjectsGroupsList';
import muiDecorator from './MuiDecorator';
import paperDecorator from './PaperDecorator';
import DragDropContextProvider from '../Utils/DragDropHelpers/DragDropContextProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { makeTestProject } from '../fixtures/TestProject';

const gd = global.gd;
const {
  project,
  shapePainterObject,
  adMobObject,
  tiledSpriteObject,
  panelSpriteObject,
  textObject,
  spriteObject,
  testLayout,
  testLayoutInstance1,
  testInstruction,
  spriteObjectWithBehaviors,
  group2,
} = makeTestProject(gd);

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const Placeholder = () => <div>Placeholder component</div>;

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

storiesOf('HelpButton', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <HelpButton helpPagePath="/test" />
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
  .add('default', () => <LocalMobileExport />);

storiesOf('LocalFolderPicker', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <LocalFolderPicker floatingLabelText="Export folder" />)
  .add('full width', () => (
    <LocalFolderPicker floatingLabelText="Export folder" fullWidth />
  ));

storiesOf('StartPage', module)
  .addDecorator(muiDecorator)
  .add('default', () => <StartPage />);

storiesOf('AboutDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => <AboutDialog open />);

storiesOf('CreateProjectDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => <CreateProjectDialog open examplesComponent={Placeholder} />);

storiesOf('LayoutChooserDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => <LayoutChooserDialog open project={project} />);

storiesOf('DragHandle', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <DragHandle />);

storiesOf('EventsTree', module).add('default', () => (
  <DragDropContextProvider>
    <div className="gd-events-sheet">
      <EventsTree
        events={testLayout.getEvents()}
        selectedEvents={[]}
        selectedInstructions={[]}
      />
    </div>
  </DragDropContextProvider>
));

storiesOf('EventsSheet', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <DragDropContextProvider>
      <EventsSheet
        project={project}
        layout={testLayout}
        events={testLayout.getEvents()}
      />
    </DragDropContextProvider>
  ));

storiesOf('InstructionEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <InstructionEditor
      project={project}
      layout={testLayout}
      isCondition
      instruction={testInstruction}
    />
  ));

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

storiesOf('SpriteEditor and related editors', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('SpriteEditor', () => (
    <SerializedObjectDisplay object={spriteObject}>
      <SpriteEditor object={spriteObject} project={project} />
    </SerializedObjectDisplay>
  )).add('PointsEditor', () => (
    <SerializedObjectDisplay object={spriteObject}>
      <PointsEditor object={spriteObject} />
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
  .add('default', () => <EmptyEditor />);

storiesOf('ObjectsList', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testLayout}>
      <div style={{ height: 250 }}>
        <ObjectsList
          getThumbnail={() => 'res/unknown32.png'}
          project={project}
          objectsContainer={testLayout}
          onEditObject={action('On edit object')}
        />
      </div>
    </SerializedObjectDisplay>
  ));

storiesOf('ObjectSelector', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('without groups', () => (
    <ObjectSelector
      project={project}
      layout={testLayout}
      value=""
      onChoose={action('onChoose in ObjectSelector')}
      noGroups
      hintText="Choose an object to add to the group"
      fullWidth
      openOnFocus
    />
  ))
  .add('with groups', () => (
    <ObjectSelector
      project={project}
      layout={testLayout}
      value=""
      onChoose={action('onChoose in ObjectSelector')}
      hintText="Choose an object or a group"
      fullWidth
      openOnFocus
    />
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

storiesOf('ObjectsGroupEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ObjectsGroupEditor project={project} layout={testLayout} group={group2} />
  ));

storiesOf('ObjectsGroupsList', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testLayout}>
      <div style={{ height: 250 }}>
        <ObjectsGroupsList
          project={project}
          objectsContainer={testLayout}
          onEditGroup={() => {}}
        />
      </div>
    </SerializedObjectDisplay>
  ));

storiesOf('BehaviorsEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={spriteObjectWithBehaviors}>
      <BehaviorsEditor project={project} object={spriteObjectWithBehaviors} />
    </SerializedObjectDisplay>
  ));
