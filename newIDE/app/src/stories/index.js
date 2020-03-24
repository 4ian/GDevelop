// @flow
import React from 'react';

// Keep first as it creates the `global.gd` object:
import GDevelopJsInitializerDecorator, {
  testProject,
} from './GDevelopJsInitializerDecorator';

import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import Welcome from './Welcome';
import HelpButton from '../UI/HelpButton';
import HelpIcon from '../UI/HelpIcon';
import StartPage from '../MainFrame/Editors/StartPage';
import AboutDialog from '../MainFrame/AboutDialog';
import CreateProjectDialog from '../ProjectCreation/CreateProjectDialog';
import {
  ClosableTabs,
  ClosableTab,
  TabContentContainer,
} from '../UI/ClosableTabs';
import DragHandle from '../UI/DragHandle';
import Background from '../UI/Background';
import HelpFinder from '../HelpFinder';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import LocalFilePicker from '../UI/LocalFilePicker';
import LocalNetworkPreviewDialog from '../Export/LocalExporters/LocalPreviewLauncher/LocalNetworkPreviewDialog';
import TextEditor from '../ObjectEditor/Editors/TextEditor';
import TiledSpriteEditor from '../ObjectEditor/Editors/TiledSpriteEditor';
import PanelSpriteEditor from '../ObjectEditor/Editors/PanelSpriteEditor';
import SpriteEditor from '../ObjectEditor/Editors/SpriteEditor';
import PointsEditor from '../ObjectEditor/Editors/SpriteEditor/PointsEditor';
import CollisionMasksEditor from '../ObjectEditor/Editors/SpriteEditor/CollisionMasksEditor';
import EmptyEditor from '../ObjectEditor/Editors/EmptyEditor';
import ImageThumbnail from '../ResourcesList/ResourceThumbnail/ImageThumbnail';
import ResourceSelector from '../ResourcesList/ResourceSelector';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import ShapePainterEditor from '../ObjectEditor/Editors/ShapePainterEditor';
import ExternalEventsField from '../EventsSheet/ParameterFields/ExternalEventsField';
import LayerField from '../EventsSheet/ParameterFields/LayerField';
import MouseField from '../EventsSheet/ParameterFields/MouseField';
import SceneVariableField from '../EventsSheet/ParameterFields/SceneVariableField';
import ObjectVariableField from '../EventsSheet/ParameterFields/ObjectVariableField';
import KeyField from '../EventsSheet/ParameterFields/KeyField';
import AudioResourceField from '../EventsSheet/ParameterFields/AudioResourceField';
import ExpressionField from '../EventsSheet/ParameterFields/ExpressionField';
import StringField from '../EventsSheet/ParameterFields/StringField';
import ColorExpressionField from '../EventsSheet/ParameterFields/ColorExpressionField';
import TrueFalseField from '../EventsSheet/ParameterFields/TrueFalseField';
import YesNoField from '../EventsSheet/ParameterFields/YesNoField';
import ForceMultiplierField from '../EventsSheet/ParameterFields/ForceMultiplierField';
import ObjectsList from '../ObjectsList';
import ObjectSelector from '../ObjectsList/ObjectSelector';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';
import SerializedObjectDisplay from './SerializedObjectDisplay';
import EventsTree from '../EventsSheet/EventsTree';
import LayoutChooserDialog from '../MainFrame/Editors/LayoutChooserDialog';
import InstructionEditor from '../EventsSheet/InstructionEditor';
import EventsSheet from '../EventsSheet';
import BehaviorsEditor from '../BehaviorsEditor';
import ObjectGroupEditor from '../ObjectGroupEditor';
import ObjectGroupsList from '../ObjectGroupsList';
import muiDecorator from './ThemeDecorator';
import paperDecorator from './PaperDecorator';
import ValueStateHolder from './ValueStateHolder';
import RefGetter from './RefGetter';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import ResourcesLoader from '../ResourcesLoader';
import VariablesList from '../VariablesList';
import ExpressionSelector from '../EventsSheet/InstructionEditor/InstructionOrExpressionSelector/ExpressionSelector';
import InstructionSelector from '../EventsSheet/InstructionEditor/InstructionOrExpressionSelector/InstructionSelector';
import ParameterRenderingService from '../EventsSheet/ParameterRenderingService';
import { ErrorFallbackComponent } from '../UI/ErrorBoundary';
import CreateProfile from '../Profile/CreateProfile';
import ProfileDetails from '../Profile/ProfileDetails';
import LimitDisplayer from '../Profile/LimitDisplayer';
import ResourcePreview from '../ResourcesList/ResourcePreview';
import ResourcesList from '../ResourcesList';
import {
  subscriptionForIndieUser,
  limitsForIndieUser,
  limitsReached,
  noSubscription,
  usagesForIndieUser,
  profileForIndieUser,
  fakeNoSubscriptionUserProfile,
  fakeIndieUserProfile,
  fakeNotAuthenticatedUserProfile,
  fakeAuthenticatedButLoadingUserProfile,
  release,
  releaseWithBreakingChange,
  releaseWithoutDescription,
  erroredCordovaBuild,
  pendingCordovaBuild,
  pendingElectronBuild,
  completeCordovaBuild,
  completeElectronBuild,
  completeWebBuild,
} from '../fixtures/GDevelopServicesTestData';
import debuggerGameDataDump from '../fixtures/DebuggerGameDataDump.json';
import profilerOutput from '../fixtures/ProfilerOutputsTestData.json';
import SubscriptionDetails from '../Profile/SubscriptionDetails';
import UsagesDetails from '../Profile/UsagesDetails';
import SubscriptionDialog from '../Profile/SubscriptionDialog';
import LoginDialog from '../Profile/LoginDialog';
import UserProfileContext from '../Profile/UserProfileContext';
import { SubscriptionCheckDialog } from '../Profile/SubscriptionChecker';
import DebuggerContent from '../Debugger/DebuggerContent';
import BuildProgress from '../Export/Builds/BuildProgress';
import BuildStepsProgress from '../Export/Builds/BuildStepsProgress';
import MeasuresTable from '../Debugger/Profiler/MeasuresTable';
import Profiler from '../Debugger/Profiler';
import SearchPanel from '../EventsSheet/SearchPanel';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Checkbox from '../UI/Checkbox';
import LoaderModal from '../UI/LoaderModal';
import ColorField from '../UI/ColorField';
import EmptyMessage from '../UI/EmptyMessage';
import BackgroundText from '../UI/BackgroundText';
import ObjectField from '../EventsSheet/ParameterFields/ObjectField';
import { getInitialSelection } from '../EventsSheet/SelectionHandler';
import EventsFunctionConfigurationEditor from '../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor';
import EventsFunctionsList from '../EventsFunctionsList';
import EventsFunctionsExtensionEditor from '../EventsFunctionsExtensionEditor';
import OptionsEditorDialog from '../EventsFunctionsExtensionEditor/OptionsEditorDialog';
import ProjectManager from '../ProjectManager';
import AlertMessage from '../UI/AlertMessage';
import ChangelogRenderer from '../MainFrame/Changelog/ChangelogRenderer';
import ChangelogDialog from '../MainFrame/Changelog/ChangelogDialog';
import EventsFunctionExtractorDialog from '../EventsSheet/EventsFunctionExtractor/EventsFunctionExtractorDialog';
import FixedHeightFlexContainer from './FixedHeightFlexContainer';
import EventsBasedBehaviorEditor from '../EventsBasedBehaviorEditor';
import EventsBasedBehaviorEditorDialog from '../EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog';
import BehaviorTypeSelector from '../BehaviorTypeSelector';
import ObjectTypeSelector from '../ObjectTypeSelector';
import NewBehaviorDialog from '../BehaviorsEditor/NewBehaviorDialog';
import ExtensionsSearchDialog from '../ExtensionsSearch/ExtensionsSearchDialog';
import EventsFunctionsExtensionsProvider from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsProvider';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';
import SceneNameField from '../EventsSheet/ParameterFields/SceneNameField';
import InstructionOrObjectSelector from '../EventsSheet/InstructionEditor/InstructionOrObjectSelector';
import SearchBar from '../UI/SearchBar';
import NewInstructionEditorDialog from '../EventsSheet/InstructionEditor/NewInstructionEditorDialog';
import NewInstructionEditorMenu from '../EventsSheet/InstructionEditor/NewInstructionEditorMenu';
import { PopoverButton } from './PopoverButton';
import EffectsList from '../EffectsList';
import SubscriptionPendingDialog from '../Profile/SubscriptionPendingDialog';
import Dialog from '../UI/Dialog';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import NewObjectDialog from '../ObjectsList/NewObjectDialog';
import { Column, Line } from '../UI/Grid';
import DragAndDropTestBed from './DragAndDropTestBed';
import EditorMosaic from '../UI/EditorMosaic';
import FlatButton from '../UI/FlatButton';
import EditorMosaicPlayground from './EditorMosaicPlayground';
import EditorNavigator from '../UI/EditorMosaic/EditorNavigator';
import ChooseEventsFunctionsExtensionEditor from '../EventsFunctionsExtensionEditor/ChooseEventsFunctionsExtensionEditor';
import PropertiesEditor from '../PropertiesEditor';
import OpenFromStorageProviderDialog from '../ProjectsStorage/OpenFromStorageProviderDialog';
import GoogleDriveStorageProvider from '../ProjectsStorage/GoogleDriveStorageProvider';
import LocalFileStorageProvider from '../ProjectsStorage/LocalFileStorageProvider';
import GoogleDriveSaveAsDialog from '../ProjectsStorage/GoogleDriveStorageProvider/GoogleDriveSaveAsDialog';
import OpenConfirmDialog from '../ProjectsStorage/OpenConfirmDialog';
import CreateAccountDialog from '../Profile/CreateAccountDialog';
import BrowserPreviewErrorDialog from '../Export/BrowserExporters/BrowserS3PreviewLauncher/BrowserPreviewErrorDialog';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import ToolbarIcon from '../UI/ToolbarIcon';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import IconButton from '../UI/IconButton';
import FilterList from '@material-ui/icons/FilterList';
import Brush from '@material-ui/icons/Brush';
import RaisedButtonWithMenu from '../UI/RaisedButtonWithMenu';
import fakeResourceExternalEditors from './FakeResourceExternalEditors';
import {
  TextFieldWithButtonLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { emptyPreviewButtonSettings } from '../MainFrame/Toolbar/PreviewButtons';

addDecorator(GDevelopJsInitializerDecorator);

// No i18n in this file

const Placeholder = () => <div>Placeholder component</div>;

const buildFakeMenuTemplate = () => [
  {
    label: 'Option 1',
    click: action('click option 1'),
  },
  { type: 'separator' },
  {
    label: 'Option 2',
    click: action('click option 2'),
  },
];

storiesOf('Welcome', module).add('to Storybook', () => (
  <Welcome showApp={linkTo('Button')} />
));

storiesOf('UI Building Blocks/Buttons', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <Column>
      <Line>
        <Text>Buttons:</Text>
      </Line>
      <Line>
        <RaisedButton label="Raised button" onClick={action('onClick')} />
        <RaisedButton
          label="Primary Raised button"
          primary
          onClick={action('onClick')}
        />
      </Line>
      <Line>
        <FlatButton label="Flat button" onClick={action('onClick')} />
        <FlatButton
          label="Primary Flat button"
          primary
          onClick={action('onClick')}
        />
      </Line>
      <Line>
        <Text>Buttons with menus:</Text>
      </Line>
      <Line>
        <RaisedButton
          label="Traditional Raised button"
          onClick={action('onClick')}
        />
        <RaisedButtonWithMenu
          label="Button with menu"
          buildMenuTemplate={buildFakeMenuTemplate}
        />
        <RaisedButtonWithMenu
          label="... and with icon"
          icon={<Brush />}
          buildMenuTemplate={buildFakeMenuTemplate}
        />
      </Line>
      <Line>
        <Text>Icons with menu:</Text>
      </Line>
      <Line>
        <ElementWithMenu
          element={
            <ToolbarIcon
              src="res/ribbon_default/bug32.png"
              tooltip={'ToolbarIcon with menu'}
            />
          }
          buildMenuTemplate={buildFakeMenuTemplate}
        />
        <ElementWithMenu
          element={
            <IconButton>
              <FilterList />
            </IconButton>
          }
          buildMenuTemplate={buildFakeMenuTemplate}
        />
      </Line>
      <Line>
        <Text>In a mini toolbar:</Text>
      </Line>
      <Line>
        <MiniToolbar>
          <MiniToolbarText>Some text:</MiniToolbarText>
          <IconButton>
            <Brush />
          </IconButton>
          <ElementWithMenu
            element={
              <IconButton>
                <FilterList />
              </IconButton>
            }
            buildMenuTemplate={() => [
              {
                label: 'Option 1',
                click: action('click option 1'),
              },
              { type: 'separator' },
              {
                label: 'Option 2',
                click: action('click option 2'),
              },
            ]}
          />
        </MiniToolbar>
      </Line>
    </Column>
  ));

storiesOf('UI Building Blocks/SelectField', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ValueStateHolder
      initialValue={'1'}
      render={(value, onChange) => (
        <SelectField
          value={value}
          onChange={(e, i, newValue: string) => onChange(newValue)}
          fullWidth
        >
          <SelectOption value="1" primaryText="Choice 1" />
          <SelectOption value="2" primaryText="Choice 2" />
          <SelectOption value="3" primaryText="Choice 3" />
          <SelectOption value="4" primaryText="Choice 4" />
        </SelectField>
      )}
    />
  ))
  .add('default, with (markdown) helper text', () => (
    <ValueStateHolder
      initialValue={'1'}
      render={(value, onChange) => (
        <SelectField
          value={value}
          onChange={(e, i, newValue: string) => onChange(newValue)}
          fullWidth
          helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
        >
          <SelectOption value="1" primaryText="Choice 1" />
          <SelectOption value="2" primaryText="Choice 2" />
          <SelectOption value="3" primaryText="Choice 3" />
          <SelectOption value="4" primaryText="Choice 4" />
        </SelectField>
      )}
    />
  ))
  .add('margin=none', () => (
    <ValueStateHolder
      initialValue={'1'}
      render={(value, onChange) => (
        <SelectField
          margin="none"
          value={value}
          onChange={(e, i, newValue: string) => onChange(newValue)}
          fullWidth
        >
          <SelectOption value="1" primaryText="Choice 1" />
          <SelectOption value="2" primaryText="Choice 2" />
          <SelectOption value="3" primaryText="Choice 3" />
          <SelectOption value="4" primaryText="Choice 4" />
        </SelectField>
      )}
    />
  ));

storiesOf('UI Building Blocks/SemiControlledTextField', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ValueStateHolder
      initialValue={'Hello World'}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledTextField value={value} onChange={onChange} />
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ))
  .add('default (commitOnBlur)', () => (
    <ValueStateHolder
      initialValue={'Hello World'}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledTextField
            value={value}
            onChange={onChange}
            commitOnBlur
          />
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ))
  .add('example that is storing a float in the state', () => (
    <ValueStateHolder
      initialValue={12.35}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledTextField
            value={value.toString()}
            onChange={newValue => onChange(parseFloat(newValue))}
          />
          <p>
            State value is {value} ({typeof value})
          </p>
        </React.Fragment>
      )}
    />
  ))
  .add('example that is storing a float in the state (commitOnBlur)', () => (
    <ValueStateHolder
      initialValue={12.35}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledTextField
            value={value.toString()}
            onChange={newValue => onChange(parseFloat(newValue))}
            commitOnBlur
          />
          <p>
            State value is {value} ({typeof value})
          </p>
        </React.Fragment>
      )}
    />
  ))
  .add('reduced margin, in a MiniToolbar', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <React.Fragment>
          <MiniToolbar>
            <MiniToolbarText>Please enter something:</MiniToolbarText>
            <SemiControlledTextField
              margin="none"
              value={value}
              onChange={onChange}
              commitOnBlur
            />
          </MiniToolbar>
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ))
  .add('with a (markdown) helper text', () => (
    <ValueStateHolder
      initialValue={'Hello World'}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledTextField
            helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
            value={value}
            onChange={onChange}
          />
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ));

storiesOf('UI Building Blocks/DragAndDrop', module).add('test bed', () => (
  <DragAndDropContextProvider>
    <DragAndDropTestBed />
  </DragAndDropContextProvider>
));

storiesOf('UI Building Blocks/SemiControlledAutoComplete', module)
  .addDecorator(muiDecorator)
  .add('default, with text', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledAutoComplete
            value={value}
            onChange={onChange}
            dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
              text: `Choice ${i}`,
              value: `Choice ${i}`,
            }))}
          />
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ))
  .add('default, with error', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledAutoComplete
            value={value}
            onChange={onChange}
            dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
              text: `Choice ${i}`,
              value: `Choice ${i}`,
            }))}
            errorText={'There was an error somewhere'}
          />
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ))
  .add('default, with onClick for some elements', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledAutoComplete
            value={value}
            onChange={onChange}
            dataSource={[
              {
                text: '',
                value: 'Click me 1',
                onClick: action('Click me 1 clicked'),
              },
              {
                text: '',
                value: 'Click me 2',
                onClick: action('Click me 2 clicked'),
              },
              {
                type: 'separator',
              },
            ].concat(
              [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                text: `Choice ${i}`,
                value: `Choice ${i}`,
              }))
            )}
          />
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ))
  .add('in a dialog, with onClick for some elements', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <Dialog open>
          <SemiControlledAutoComplete
            value={value}
            onChange={onChange}
            dataSource={[
              {
                text: '',
                value: 'Click me 1',
                onClick: action('Click me 1 clicked'),
              },
              {
                text: '',
                value: 'Click me 2',
                onClick: action('Click me 2 clicked'),
              },
              {
                type: 'separator',
              },
            ].concat(
              [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                text: `Choice ${i}`,
                value: `Choice ${i}`,
              }))
            )}
          />
          <p>State value is {value}</p>
        </Dialog>
      )}
    />
  ))
  .add('reduced margin, in a MiniToolbar', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <React.Fragment>
          <MiniToolbar>
            <MiniToolbarText>Please make a choice:</MiniToolbarText>
            <SemiControlledAutoComplete
              margin="none"
              value={value}
              onChange={onChange}
              dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                text: `Choice ${i}`,
                value: `Choice ${i}`,
              }))}
            />
          </MiniToolbar>
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ))
  .add('with a (markdown) helper text', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledAutoComplete
            value={value}
            onChange={onChange}
            helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
            dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
              text: `Choice ${i}`,
              value: `Choice ${i}`,
            }))}
          />
          <p>State value is {value}</p>
        </React.Fragment>
      )}
    />
  ));

storiesOf('UI Building Blocks/SearchBar', module)
  .addDecorator(muiDecorator)
  .add('empty', () => (
    <SearchBar
      value=""
      onChange={action('change')}
      onRequestSearch={action('request search')}
    />
  ))
  .add('with text', () => (
    <SearchBar
      value="123"
      onChange={action('change')}
      onRequestSearch={action('request search')}
    />
  ))
  .add('disabled', () => (
    <SearchBar
      value="123"
      onChange={action('change')}
      onRequestSearch={action('request search')}
      disabled
    />
  ))
  .add('with tags', () => (
    <SearchBar
      value="123"
      onChange={action('change')}
      onRequestSearch={action('request search')}
      buildTagsMenuTemplate={() => [
        {
          type: 'checkbox',
          label: 'Tag 1',
          checked: false,
          click: () => {},
        },
        {
          type: 'checkbox',
          label: 'Tag 2 (checked)',
          checked: true,
          click: () => {},
        },
        {
          type: 'checkbox',
          label: 'Tag 3',
          checked: false,
          click: () => {},
        },
      ]}
    />
  ));

storiesOf('UI Building Blocks/Layout/ResponsiveLineStackLayout', module)
  .addDecorator(muiDecorator)
  .add('Default', () => (
    <ResponsiveLineStackLayout>
      <div>Some Div</div>
      <span>Some Span</span>
      <RaisedButton label="Raised Button" onClick={action('on click')} />
      <RaisedButton label="Raised Button" onClick={action('on click')} />
      <FlatButton label="Flat Button" onClick={action('on click')} />
    </ResponsiveLineStackLayout>
  ))
  .add('Default with null items', () => (
    <ResponsiveLineStackLayout>
      {null}
      {null}
      <div>Some Div</div>
      {null}
      {null}
      <span>Some Span</span>
      <RaisedButton label="Raised Button" onClick={action('on click')} />
      <RaisedButton label="Raised Button" onClick={action('on click')} />
      <FlatButton label="Flat Button" onClick={action('on click')} />
      {null}
      {null}
    </ResponsiveLineStackLayout>
  ))
  .add('alignItems=center', () => (
    <ResponsiveLineStackLayout alignItems="center">
      <div>Some Div</div>
      <span>Some Span</span>
      <RaisedButton label="Raised Button" onClick={action('on click')} />
    </ResponsiveLineStackLayout>
  ));

storiesOf('UI Building Blocks/Layout/TextFieldWithButtonLayout', module)
  .addDecorator(muiDecorator)
  .add('Empty text field', () => (
    <TextFieldWithButtonLayout
      renderTextField={() => (
        <SemiControlledTextField
          floatingLabelText="Hello world"
          value=""
          onChange={() => {}}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Empty text field, margin=none', () => (
    <TextFieldWithButtonLayout
      margin="none"
      renderTextField={() => (
        <SemiControlledTextField
          margin="none"
          floatingLabelText="Hello world"
          value=""
          onChange={() => {}}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Empty auto complete field', () => (
    <TextFieldWithButtonLayout
      renderTextField={() => (
        <SemiControlledAutoComplete
          floatingLabelText="Hello world"
          value={''}
          onChange={() => {}}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Empty auto complete field, noFloatingLabelText', () => (
    <TextFieldWithButtonLayout
      noFloatingLabelText
      renderTextField={() => (
        <SemiControlledAutoComplete
          value={''}
          onChange={() => {}}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Empty auto complete field, margin=none', () => (
    <TextFieldWithButtonLayout
      margin="none"
      renderTextField={() => (
        <SemiControlledAutoComplete
          margin="none"
          floatingLabelText="Hello world"
          value={''}
          onChange={() => {}}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Empty auto complete field, margin=none, noFloatingLabelText', () => (
    <TextFieldWithButtonLayout
      margin="none"
      noFloatingLabelText
      renderTextField={() => (
        <SemiControlledAutoComplete
          margin="none"
          value={''}
          onChange={() => {}}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add(
    'Empty auto complete field, margin=none, noFloatingLabelText, with a small IconButton',
    () => (
      <TextFieldWithButtonLayout
        margin="none"
        noFloatingLabelText
        renderTextField={() => (
          <SemiControlledAutoComplete
            margin="none"
            value={''}
            onChange={() => {}}
            dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
              text: `Choice ${i}`,
              value: `Choice ${i}`,
            }))}
          />
        )}
        renderButton={style => (
          <IconButton size="small">
            <Brush />
          </IconButton>
        )}
      />
    )
  )
  .add('Filled text field', () => (
    <TextFieldWithButtonLayout
      renderTextField={() => (
        <SemiControlledTextField
          floatingLabelText="Hello"
          value="123"
          onChange={() => {}}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Filled text field, full width', () => (
    <TextFieldWithButtonLayout
      renderTextField={() => (
        <SemiControlledTextField
          floatingLabelText="Hello"
          value="123"
          onChange={() => {}}
          fullWidth
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Filled multiline text field', () => (
    <TextFieldWithButtonLayout
      renderTextField={() => (
        <SemiControlledTextField
          floatingLabelText="Hello"
          multiLine
          value={'123\n456\n789\nblablabla bla bla'}
          onChange={() => {}}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Filled auto complete field', () => (
    <TextFieldWithButtonLayout
      renderTextField={() => (
        <SemiControlledAutoComplete
          floatingLabelText="Hello world"
          value={'Choice 5'}
          onChange={() => {}}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ))
  .add('Filled auto complete field, full width', () => (
    <TextFieldWithButtonLayout
      renderTextField={() => (
        <SemiControlledAutoComplete
          floatingLabelText="Hello world"
          value={'Choice 5'}
          onChange={() => {}}
          dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
            text: `Choice ${i}`,
            value: `Choice ${i}`,
          }))}
          fullWidth
        />
      )}
      renderButton={style => (
        <RaisedButton style={style} label="Button" onClick={() => {}} />
      )}
    />
  ));

storiesOf('UI Building Blocks/Background', module)
  .addDecorator(muiDecorator)
  .add('default', () => <Background>Hello world</Background>);

storiesOf('UI Building Blocks/LoaderModal', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <LoaderModal show />);

storiesOf('UI Building Blocks/Checkbox', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <div style={{ display: 'flex' }}>
      <Checkbox label={'My label'} checked={true} />
      <Checkbox label={'My label 2'} checked={false} />
    </div>
  ));

storiesOf('UI Building Blocks/PlaceholderMessage', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <PlaceholderMessage>
      <p>
        Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit
      </p>
    </PlaceholderMessage>
  ));

storiesOf('UI Building Blocks/PlaceholderLoader', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <PlaceholderLoader />);

storiesOf('UI Building Blocks/DragHandle', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <DragHandle />);

storiesOf('UI Building Blocks/EmptyMessage', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EmptyMessage>
      Hello World, this is an empty message, which is centered.
    </EmptyMessage>
  ));

storiesOf('UI Building Blocks/BackgroundText', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <BackgroundText>Hello World, this is a background text</BackgroundText>
  ));

storiesOf('UI Building Blocks/AlertMessage', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <AlertMessage kind="info">Hello World, this is an alert text</AlertMessage>
  ))
  .add('default with button', () => (
    <AlertMessage kind="info" onHide={() => {}}>
      Hello World, this is an alert text
    </AlertMessage>
  ))
  .add('long text', () => (
    <AlertMessage kind="info">
      Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at
      cibo erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat
      nostrum eos ne, elit virtute appetere cu sea. Ut nec erat maluisset
      argumentum, duo integre propriae ut. Sed cu eius sonet verear, ne sit
      legendos senserit. Ne mel mundi perpetua dissentiunt. Nec ei nusquam
      inimicus.
    </AlertMessage>
  ))
  .add('long text with button', () => (
    <AlertMessage kind="info" onHide={() => {}}>
      Hello World, this is a long alert text. Lorem ipsum dolor sit amet, at
      cibo erroribus sed, sea in meis laoreet. Has modus epicuri ne, dicat
      nostrum eos ne, elit virtute appetere cu sea. Ut nec erat maluisset
      argumentum, duo integre propriae ut. Sed cu eius sonet verear, ne sit
      legendos senserit. Ne mel mundi perpetua dissentiunt. Nec ei nusquam
      inimicus.
    </AlertMessage>
  ))
  .add('warning', () => (
    <AlertMessage kind="warning">
      Hello World, this is an alert text
    </AlertMessage>
  ));

storiesOf('UI Building Blocks/ColorField', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <div>
      <ColorField
        floatingLabelText="Particles start color"
        disableAlpha
        fullWidth
        color={{
          r: 100,
          g: 100,
          b: 200,
          a: 255,
        }}
        onChangeComplete={() => {}}
      />
      <ColorField
        floatingLabelText="This has a helper text"
        disableAlpha
        fullWidth
        color={{
          r: 100,
          g: 100,
          b: 200,
          a: 255,
        }}
        onChangeComplete={() => {}}
        helperMarkdownText="Lorem ipsum **dolor sit amet**, consectetur _adipiscing elit_, [sed do eiusmod](http://example.com) tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      />
      <ColorField
        floatingLabelText="This is not full width"
        disableAlpha
        color={{
          r: 100,
          g: 100,
          b: 200,
          a: 255,
        }}
        onChangeComplete={() => {}}
      />
    </div>
  ));

storiesOf('UI Building Blocks/EditorMosaic', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EditorMosaicPlayground
      renderButtons={({ openEditor }) => (
        <FlatButton
          onClick={() => openEditor('thirdEditor', 'end', 65)}
          label="Open the third editor"
        />
      )}
      renderEditorMosaic={({ editorRef }) => (
        <EditorMosaic
          ref={editorRef}
          editors={{
            firstEditor: {
              type: 'primary',
              title: t`First editor`,
              toolbarControls: [],
              renderEditor: () => (
                <div>
                  This is the first editor (left), with title bar but no
                  controls to close the window.
                </div>
              ),
            },
            secondEditor: {
              type: 'primary',
              noTitleBar: true,
              renderEditor: () => (
                <div>
                  This is the second editor ("central"), without title bar.
                </div>
              ),
            },
            thirdEditor: {
              type: 'secondary',
              title: t`Third editor`,
              renderEditor: () => <div>This is the third editor (bottom).</div>,
            },
          }}
          initialNodes={{
            direction: 'column',
            first: {
              direction: 'row',
              first: 'firstEditor',
              second: 'secondEditor',
              splitPercentage: 25,
            },
            second: 'thirdEditor',
            splitPercentage: 65,
          }}
        />
      )}
    />
  ))
  .add('limit to one secondary editor', () => (
    <EditorMosaicPlayground
      renderButtons={({ openEditor }) => (
        <React.Fragment>
          <FlatButton
            onClick={() => openEditor('firstEditor', 'end', 65)}
            label="Open the 1st secondary editor"
          />
          <FlatButton
            onClick={() => openEditor('secondEditor', 'end', 65)}
            label="Open the 2nd secondary editor"
          />
          <FlatButton
            onClick={() => openEditor('thirdEditor', 'end', 65)}
            label="Open the 3rd secondary editor"
          />
        </React.Fragment>
      )}
      renderEditorMosaic={({ editorRef }) => (
        <EditorMosaic
          limitToOneSecondaryEditor
          ref={editorRef}
          editors={{
            firstEditor: {
              type: 'secondary',
              title: t`1st secondary editor`,
              renderEditor: () => <div>This is a secondary editor.</div>,
            },
            secondEditor: {
              type: 'secondary',
              title: t`2nd secondary editor`,
              renderEditor: () => <div>This is another secondary editor.</div>,
            },
            thirdEditor: {
              type: 'secondary',
              title: t`3rd secondary editor`,
              renderEditor: () => (
                <div>This is yet another secondary editor.</div>
              ),
            },
            mainEditor: {
              type: 'primary',
              noTitleBar: true,
              renderEditor: () => (
                <div>This is the main editor, always shown</div>
              ),
            },
          }}
          initialNodes={{
            direction: 'row',
            first: 'mainEditor',
            second: 'firstEditor',
            splitPercentage: 65,
          }}
        />
      )}
    />
  ));

storiesOf('UI Building Blocks/EditorNavigator', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EditorMosaicPlayground
      renderButtons={({ openEditor }) => (
        <React.Fragment>
          <FlatButton
            onClick={() => openEditor('thirdEditor', 'end', 65)}
            label="Open the third editor"
          />
          <FlatButton
            onClick={() => openEditor('noTransitionsEditor', 'end', 65)}
            label="Open the editor without transitions"
          />
        </React.Fragment>
      )}
      renderEditorMosaic={({ editorRef }) => (
        <EditorNavigator
          ref={editorRef}
          initialEditorName="firstEditor"
          transitions={{
            firstEditor: {
              nextLabel: 'Second Editor',
              nextEditor: 'secondEditor',
            },
            secondEditor: {
              previousEditor: 'firstEditor',
              nextLabel: 'Third Editor',
              nextEditor: 'thirdEditor',
            },
            thirdEditor: {
              previousEditor: 'secondEditor',
            },
          }}
          editors={{
            firstEditor: {
              type: 'primary',
              title: t`First editor`,
              toolbarControls: [],
              renderEditor: () => <div>This is the first editor.</div>,
            },
            secondEditor: {
              type: 'primary',
              noTitleBar: true,
              renderEditor: () => <div>This is the second editor.</div>,
            },
            thirdEditor: {
              type: 'secondary',
              title: t`Third editor`,
              renderEditor: () => <div>This is the third editor.</div>,
            },
            noTransitionsEditor: {
              type: 'secondary',
              title: t`Editor without transitions`,
              renderEditor: () => (
                <div>This is an editor without transitions.</div>
              ),
            },
          }}
          onEditorChanged={action('Editor was changed')}
        />
      )}
    />
  ));

storiesOf('UI Building Blocks/ClosableTabs', module)
  .addDecorator(muiDecorator)
  .add('3 tabs', () => (
    <ValueStateHolder
      initialValue={0}
      render={(value, onChange) => (
        <FixedHeightFlexContainer height={400}>
          <Column expand>
            <ClosableTabs>
              <ClosableTab
                onActivated={action('Tab 1 activated')}
                closable
                active={value === 0}
                onClick={() => onChange(0)}
                label="Tab 1"
                onClose={action('Close tab 1')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
              <ClosableTab
                onActivated={action('Tab 2 activated')}
                closable
                active={value === 1}
                onClick={() => onChange(1)}
                label="Tab 2"
                onClose={action('Close tab 2')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
              <ClosableTab
                onActivated={action('Tab 3 activated')}
                closable
                active={value === 2}
                onClick={() => onChange(2)}
                label="Tab 3 with a long label"
                onClose={action('Close tab 3')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
            </ClosableTabs>
            {
              <TabContentContainer active={value === 0}>
                <div
                  style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
                >
                  Tab 1 content
                </div>
              </TabContentContainer>
            }
            {
              <TabContentContainer active={value === 1}>
                <div
                  style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
                >
                  Tab 2 content
                </div>
              </TabContentContainer>
            }
            {
              <TabContentContainer active={value === 2}>
                <div
                  style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
                >
                  Tab 3 content
                </div>
              </TabContentContainer>
            }
          </Column>
        </FixedHeightFlexContainer>
      )}
    />
  ))
  .add('long labels', () => (
    <ValueStateHolder
      initialValue={0}
      render={(value, onChange) => (
        <FixedHeightFlexContainer height={400}>
          <Column expand>
            <ClosableTabs>
              <ClosableTab
                onActivated={action('Tab 1 activated')}
                closable
                active={value === 0}
                label="Tab 1 with a very very long label"
                onClose={action('Close tab 1')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
                onClick={() => onChange(0)}
              />
              <ClosableTab
                onActivated={action('Tab 2 activated')}
                closable
                active={value === 1}
                onClick={() => onChange(1)}
                label="Small 2"
                onClose={action('Close tab 2')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
              <ClosableTab
                onActivated={action('Tab 3 activated')}
                closable
                active={value === 2}
                onClick={() => onChange(2)}
                label="Tab 3 with a very very loooooooooooooooooooooooooooooooooooooooooong label"
                onClose={action('Close tab 3')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
              <ClosableTab
                onActivated={action('Tab 4 activated')}
                closable
                active={value === 3}
                onClick={() => onChange(3)}
                label="Small 4"
                onClose={action('Close tab 4')}
                onCloseAll={action('Close all')}
                onCloseOthers={action('Close others')}
              />
            </ClosableTabs>
            {
              <TabContentContainer active={value === 0}>
                <div
                  style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
                >
                  Tab 1 content
                </div>
              </TabContentContainer>
            }
            {
              <TabContentContainer active={value === 1}>
                <div
                  style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
                >
                  Tab 2 content
                </div>
              </TabContentContainer>
            }
            {
              <TabContentContainer active={value === 2}>
                <div
                  style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
                >
                  Tab 3 content
                </div>
              </TabContentContainer>
            }
            {
              <TabContentContainer active={value === 3}>
                <div
                  style={{ backgroundColor: 'green', height: '100%', flex: 1 }}
                >
                  Tab 4 content
                </div>
              </TabContentContainer>
            }
          </Column>
        </FixedHeightFlexContainer>
      )}
    />
  ))
  .add('with ObjectsList (to check scrolling)', () => (
    <ValueStateHolder
      initialValue={0}
      render={(value, onChange) => (
        <DragAndDropContextProvider>
          <FixedHeightFlexContainer height={400}>
            <Column expand>
              <ClosableTabs>
                <ClosableTab
                  onActivated={action('Tab 1 activated')}
                  closable
                  active={value === 0}
                  label="Tab 1"
                  onClick={() => onChange(0)}
                  onClose={action('Close tab 1')}
                  onCloseAll={action('Close all')}
                  onCloseOthers={action('Close others')}
                />
                <ClosableTab
                  onActivated={action('Tab 2 activated')}
                  closable
                  active={value === 1}
                  label="Tab 2"
                  onClick={() => onChange(1)}
                  onClose={action('Close tab 2')}
                  onCloseAll={action('Close all')}
                  onCloseOthers={action('Close others')}
                />
                <ClosableTab
                  onActivated={action('Tab 3 activated')}
                  closable
                  active={value === 2}
                  label="Tab 3"
                  onClick={() => onChange(2)}
                  onClose={action('Close tab 3')}
                  onCloseAll={action('Close all')}
                  onCloseOthers={action('Close others')}
                />
              </ClosableTabs>
              {
                <TabContentContainer active={value === 0}>
                  <div
                    style={{
                      backgroundColor: 'green',
                      height: '100%',
                      flex: 1,
                    }}
                  >
                    The second tab has a list of objects. Check that the
                    scrolling position is maintained while navigating between
                    tabs.
                  </div>
                </TabContentContainer>
              }
              {
                <TabContentContainer active={value === 1}>
                  <ObjectsList
                    getThumbnail={() => 'res/unknown32.png'}
                    project={testProject.project}
                    objectsContainer={testProject.testLayout}
                    onEditObject={action('On edit object')}
                    selectedObjectNames={[]}
                    selectedObjectTags={[]}
                    onChangeSelectedObjectTags={() => {}}
                    getAllObjectTags={() => []}
                    canRenameObject={() => true}
                    onDeleteObject={(objectWithContext, cb) => cb(true)}
                    onRenameObject={(objectWithContext, newName, cb) =>
                      cb(true)
                    }
                    onObjectCreated={() => {}}
                    onObjectSelected={() => {}}
                  />
                </TabContentContainer>
              }
              {
                <TabContentContainer active={value === 2}>
                  <div
                    style={{
                      backgroundColor: 'green',
                      height: '100%',
                      flex: 1,
                    }}
                  >
                    Tab 3 content
                  </div>
                </TabContentContainer>
              }
            </Column>
          </FixedHeightFlexContainer>
        </DragAndDropContextProvider>
      )}
    />
  ));

storiesOf('UI Building Blocks/HelpButton', module)
  .addDecorator(muiDecorator)
  .add('default', () => <HelpButton helpPagePath="/test" />);

storiesOf('UI Building Blocks/HelpIcon', module)
  .addDecorator(muiDecorator)
  .add('default', () => <HelpIcon helpPagePath="/test" />);

storiesOf('HelpFinder', module)
  .addDecorator(muiDecorator)
  .add('default', () => <HelpFinder open onClose={action('close')} />);

storiesOf('PropertiesEditor', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <PropertiesEditor
      schema={[
        {
          name: 'Object name',
          valueType: 'string',
          disabled: true,
          getValue: instance => 'Disabled field',
          setValue: (instance, newValue) => {},
          onEditButtonClick: instance => action('edit button clicked'),
        },
        {
          name: 'Position',
          type: 'row',
          children: [
            {
              name: 'X',
              valueType: 'number',
              getValue: instance => 10,
              setValue: (instance, newValue) => {},
            },
            {
              name: 'Y',
              valueType: 'number',
              getValue: instance => 20.1234,
              setValue: (instance, newValue) => {},
            },
          ],
        },
        {
          name: 'Angle',
          valueType: 'number',
          getValue: instance => 90.123456,
          setValue: (instance, newValue) => {},
        },
        {
          name: 'Checked checkbox',
          valueType: 'boolean',
          getValue: instance => true,
          setValue: (instance, newValue) => {},
        },
        {
          name: 'Unchecked checkbox',
          valueType: 'boolean',
          getValue: instance => false,
          setValue: (instance, newValue) => {},
        },
      ]}
      instances={[{ name: 'instance1' }, { name: 'instance2' }]}
    />
  ))
  .add('with descriptions and extra descriptions', () => (
    <PropertiesEditor
      schema={[
        {
          name: 'Object name',
          valueType: 'string',
          disabled: true,
          getValue: instance => 'Disabled field',
          setValue: (instance, newValue) => {},
          onEditButtonClick: instance => action('edit button clicked'),
          getDescription: () =>
            'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
        },
        {
          name: 'Position',
          type: 'row',
          children: [
            {
              name: 'X',
              valueType: 'number',
              getValue: instance => 10,
              setValue: (instance, newValue) => {},
              getDescription: () =>
                'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
            },
            {
              name: 'Y',
              valueType: 'number',
              getValue: instance => 20.1234,
              setValue: (instance, newValue) => {},
              getDescription: () =>
                'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
            },
          ],
        },
        {
          name: 'Angle',
          valueType: 'number',
          getValue: instance => 90.123456,
          setValue: (instance, newValue) => {},
          getDescription: () =>
            'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
        },
        {
          name: 'Checked checkbox',
          valueType: 'boolean',
          getValue: instance => true,
          setValue: (instance, newValue) => {},
          getDescription: () =>
            'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
        },
        {
          name: 'Unchecked checkbox',
          valueType: 'boolean',
          getValue: instance => false,
          setValue: (instance, newValue) => {},
          getDescription: () =>
            'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
        },
      ]}
      instances={[{ name: 'instance1' }, { name: 'instance2' }]}
    />
  ));

storiesOf('ParameterFields', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('AudioResourceField', () => (
    <ValueStateHolder
      initialValue={''}
      render={(value, onChange) => (
        <AudioResourceField
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
          parameterRenderingService={ParameterRenderingService}
          resourceSources={[]}
          onChooseResource={() => Promise.reject('unimplemented')}
          resourceExternalEditors={fakeResourceExternalEditors}
        />
      )}
    />
  ))
  .add('ExpressionField', () => (
    <ValueStateHolder
      initialValue={'MySpriteObject.X() + MouseX("", 0)'}
      render={(value, onChange) => (
        <ExpressionField
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
          parameterRenderingService={ParameterRenderingService}
        />
      )}
    />
  ))
  .add('ExpressionField (with errors)', () => (
    <ValueStateHolder
      initialValue={
        'Test()+3-Test()+3-Test()+3-Test()+3-Test()+3-Test()+3-Test()+3-Test()+3\n-Test2()+3-/2//2 \n+ 3()'
      }
      render={(value, onChange) => (
        <ExpressionField
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
          parameterRenderingService={ParameterRenderingService}
        />
      )}
    />
  ))
  .add('StringField', () => (
    <ValueStateHolder
      initialValue={'ToString(0) + "Test" + NewLine() + VariableString(MyVar)'}
      render={(value, onChange) => (
        <StringField
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
          parameterRenderingService={ParameterRenderingService}
        />
      )}
    />
  ))
  .add('ObjectField', () => (
    <ValueStateHolder
      initialValue={'MySpriteObject'}
      render={(value, onChange) => (
        <ObjectField
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
        />
      )}
    />
  ))
  .add('ExternalEventsField', () => (
    <ValueStateHolder
      initialValue={'Test'}
      render={(value, onChange) => (
        <ExternalEventsField
          project={testProject.project}
          scope={{}}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
        />
      )}
    />
  ))
  .add('ExternalEventsField (without project)', () => (
    <ValueStateHolder
      initialValue={'Test'}
      render={(value, onChange) => (
        <ExternalEventsField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('LayerField', () => (
    <ValueStateHolder
      initialValue={'"GUI"'}
      render={(value, onChange) => (
        <LayerField
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
        />
      )}
    />
  ))
  .add('LayerField (without project and layout)', () => (
    <ValueStateHolder
      initialValue={'"GUI"'}
      render={(value, onChange) => (
        <LayerField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('SceneNameField', () => (
    <ValueStateHolder
      initialValue={'"TestLayout"'}
      render={(value, onChange) => (
        <SceneNameField
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
        />
      )}
    />
  ))
  .add('SceneNameField (without project and layout)', () => (
    <ValueStateHolder
      initialValue={'"TestLayout"'}
      render={(value, onChange) => (
        <SceneNameField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('KeyField', () => (
    <ValueStateHolder
      initialValue={'Space'}
      render={(value, onChange) => (
        <KeyField
          project={testProject.project}
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('MouseField', () => (
    <ValueStateHolder
      initialValue={'Left'}
      render={(value, onChange) => (
        <MouseField
          project={testProject.project}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('SceneVariableField', () => (
    <ValueStateHolder
      initialValue={'Variable1'}
      render={(value, onChange) => (
        <SceneVariableField
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
        />
      )}
    />
  ))
  .add('SceneVariableField (without layout and project)', () => (
    <ValueStateHolder
      initialValue={'Variable1'}
      render={(value, onChange) => (
        <SceneVariableField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('ObjectVariableField (without expression, layout and project)', () => (
    <ValueStateHolder
      initialValue={'Variable1'}
      render={(value, onChange) => (
        <ObjectVariableField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('ParameterColorField', () => (
    <ValueStateHolder
      initialValue={'"123;342;345"'}
      render={(value, onChange) => (
        <ColorExpressionField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('ParameterColorField (inline)', () => (
    <ValueStateHolder
      initialValue={'"123;342;345"'}
      render={(value, onChange) => (
        <ColorExpressionField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          isInline
        />
      )}
    />
  ))
  .add('TrueFalseField', () => (
    <ValueStateHolder
      initialValue={''}
      render={(value, onChange) => (
        <TrueFalseField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          isInline
        />
      )}
    />
  ))
  .add('YesNoField', () => (
    <ValueStateHolder
      initialValue={''}
      render={(value, onChange) => (
        <YesNoField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          isInline
        />
      )}
    />
  ))
  .add('ForceMultiplierField', () => (
    <ValueStateHolder
      initialValue={''}
      render={(value, onChange) => (
        <ForceMultiplierField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ))
  .add('ForceMultiplierField (with a deprecated value)', () => (
    <ValueStateHolder
      initialValue={'0.8'}
      render={(value, onChange) => (
        <ForceMultiplierField
          scope={{}}
          value={value}
          onChange={onChange}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
        />
      )}
    />
  ));

storiesOf('BuildStepsProgress', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('BuildStepsProgress (not started)', () => (
    <BuildStepsProgress
      exportStep={''}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={0}
      stepCurrentProgress={0}
      errored={false}
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (not started) (without build step)', () => (
    <BuildStepsProgress
      exportStep={''}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={0}
      stepCurrentProgress={0}
      errored={false}
      hasBuildStep={false}
    />
  ))
  .add('BuildStepsProgress (export)', () => (
    <BuildStepsProgress
      exportStep={'export'}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={0}
      stepCurrentProgress={0}
      errored={false}
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (resources-download)', () => (
    <BuildStepsProgress
      exportStep={'resources-download'}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={27}
      stepCurrentProgress={16}
      errored={false}
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (export) (errored)', () => (
    <BuildStepsProgress
      exportStep={'export'}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={0}
      stepCurrentProgress={0}
      errored={true}
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (compress)', () => (
    <BuildStepsProgress
      exportStep={'compress'}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={0}
      stepCurrentProgress={0}
      errored={false}
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (upload)', () => (
    <BuildStepsProgress
      exportStep={'upload'}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={100}
      stepCurrentProgress={20}
      errored={false}
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (upload) (errored)', () => (
    <BuildStepsProgress
      exportStep={'upload'}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={100}
      stepCurrentProgress={20}
      errored
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (waiting-for-build)', () => (
    <BuildStepsProgress
      exportStep={'waiting-for-build'}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={100}
      stepCurrentProgress={20}
      errored={false}
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (build)', () => (
    <BuildStepsProgress
      exportStep={'build'}
      build={{
        id: 'fake-build-id',
        userId: 'fake-user-id',
        type: 'electron-build',
        status: 'pending',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }}
      onDownload={action('download')}
      stepMaxProgress={100}
      stepCurrentProgress={20}
      errored={false}
      showSeeAllMyBuildsExplanation
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (build) (errored)', () => (
    <BuildStepsProgress
      exportStep={'build'}
      build={{
        id: 'fake-build-id',
        userId: 'fake-user-id',
        type: 'cordova-build',
        status: 'error',
        logsKey: '/fake-error.log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }}
      onDownload={action('download')}
      stepMaxProgress={100}
      stepCurrentProgress={20}
      errored
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (build) (complete)', () => (
    <BuildStepsProgress
      exportStep={'done'}
      build={{
        id: 'fake-build-id',
        userId: 'fake-user-id',
        type: 'cordova-build',
        status: 'complete',
        logsKey: '/fake-error.log',
        apkKey: '/fake-game.apk',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }}
      onDownload={action('download')}
      stepMaxProgress={100}
      stepCurrentProgress={20}
      errored={false}
      hasBuildStep
    />
  ))
  .add('BuildStepsProgress (done) (without build step)', () => (
    <BuildStepsProgress
      exportStep={'done'}
      build={null}
      onDownload={action('download')}
      stepMaxProgress={100}
      stepCurrentProgress={20}
      errored={false}
      hasBuildStep={false}
    />
  ));

storiesOf('BuildProgress', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('errored', () => (
    <BuildProgress
      build={erroredCordovaBuild}
      onDownload={action('download')}
    />
  ))
  .add('pending (electron-build)', () => (
    <BuildProgress
      build={{ ...pendingElectronBuild, updatedAt: Date.now() }}
      onDownload={action('download')}
    />
  ))
  .add('pending (cordova-build)', () => (
    <BuildProgress
      build={{ ...pendingCordovaBuild, updatedAt: Date.now() }}
      onDownload={action('download')}
    />
  ))
  .add('pending and very old (cordova-build)', () => (
    <BuildProgress
      build={{
        ...pendingCordovaBuild,
        updatedAt: Date.now() - 1000 * 3600 * 24,
      }}
      onDownload={action('download')}
    />
  ))
  .add('complete (cordova-build)', () => (
    <BuildProgress
      build={completeCordovaBuild}
      onDownload={action('download')}
    />
  ))
  .add('complete (electron-build)', () => (
    <BuildProgress
      build={completeElectronBuild}
      onDownload={action('download')}
    />
  ))
  .add('complete (web-build)', () => (
    <BuildProgress build={completeWebBuild} onDownload={action('download')} />
  ));

storiesOf('LocalFolderPicker', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ValueStateHolder
      initialValue={'Test'}
      render={(value, onChange) => (
        <LocalFolderPicker value={value} onChange={onChange} type="export" />
      )}
    />
  ))
  .add('full width', () => (
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
  ));

storiesOf('LocalFilePicker', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('full width', () => (
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
  ));

storiesOf('StartPage', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <StartPage onOpenLanguageDialog={action('open language dialog')} />
  ));

storiesOf('DebuggerContent', module)
  .addDecorator(muiDecorator)
  .add('with data', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={550}>
        <DebuggerContent
          gameData={debuggerGameDataDump}
          onPause={action('on pause')}
          onPlay={action('on play')}
          onRefresh={action('on refresh')}
          onEdit={() => false}
          onCall={() => false}
          onStartProfiler={action('start profiler')}
          onStopProfiler={action('stop profiler')}
          profilerOutput={profilerOutput}
          profilingInProgress={false}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ))
  .add('without data', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={550}>
        <DebuggerContent
          gameData={null}
          onPause={action('on pause')}
          onPlay={action('on play')}
          onRefresh={action('on refresh')}
          onEdit={() => false}
          onCall={() => false}
          onStartProfiler={action('start profiler')}
          onStopProfiler={action('stop profiler')}
          profilerOutput={profilerOutput}
          profilingInProgress={true}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ));

storiesOf('Profiler', module)
  .addDecorator(muiDecorator)
  .add('without profiler output', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={550}>
        <Profiler
          onStart={action('start profiler')}
          onStop={action('stop profiler')}
          profilerOutput={null}
          profilingInProgress={false}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ))
  .add('without profiler output, while profiling', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={550}>
        <Profiler
          onStart={action('start profiler')}
          onStop={action('stop profiler')}
          profilerOutput={null}
          profilingInProgress={true}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ))
  .add('with profiler output', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={550}>
        <Profiler
          onStart={action('start profiler')}
          onStop={action('stop profiler')}
          profilerOutput={profilerOutput}
          profilingInProgress={false}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ))
  .add('with profiler output, while profiling', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={550}>
        <Profiler
          onStart={action('start profiler')}
          onStop={action('stop profiler')}
          profilerOutput={profilerOutput}
          profilingInProgress={true}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ));

storiesOf('MeasuresTable', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <div style={{ height: 250 }}>
      <MeasuresTable profilerMeasures={profilerOutput.framesAverageMeasures} />
    </div>
  ));

storiesOf('AboutDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <AboutDialog
      open
      onClose={action('close')}
      updateStatus={{ message: '', status: 'unknown' }}
    />
  ));

storiesOf('CreateProjectDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <CreateProjectDialog
      open
      examplesComponent={Placeholder}
      startersComponent={Placeholder}
      onClose={action('onClose')}
      onCreate={action('onCreate')}
      onOpen={action('onOpen')}
    />
  ));

storiesOf('OpenFromStorageProviderDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <OpenFromStorageProviderDialog
      storageProviders={[GoogleDriveStorageProvider, LocalFileStorageProvider]}
      onChooseProvider={action('onChooseProvider')}
      onClose={action('onClose')}
      onCreateNewProject={action('onCreateNewProject')}
    />
  ));

storiesOf(
  'StorageProviders/GoogleDriveStorageProvider/GoogleDriveSaveAsDialog',
  module
)
  .addDecorator(muiDecorator)
  .add('default, fake picked file, save working', () => (
    <GoogleDriveSaveAsDialog
      onShowFilePicker={() =>
        Promise.resolve({
          type: 'FILE',
          id: 'fake-id',
          name: 'Fake Google Drive file',
          parentId: 'fake-parent-id',
        })
      }
      onCancel={action('cancel')}
      onSave={() => Promise.resolve()}
    />
  ))
  .add('default, fake picked folder, save working', () => (
    <GoogleDriveSaveAsDialog
      onShowFilePicker={() =>
        Promise.resolve({
          type: 'FOLDER',
          id: 'fake-id',
          name: 'Fake Google Drive file',
        })
      }
      onCancel={action('cancel')}
      onSave={() => Promise.resolve()}
    />
  ))
  .add('default, error when picking file/folder', () => (
    <GoogleDriveSaveAsDialog
      onShowFilePicker={() => Promise.reject(new Error('fake-error'))}
      onCancel={action('cancel')}
      onSave={() => Promise.resolve()}
    />
  ))
  .add('default, error while saving', () => (
    <GoogleDriveSaveAsDialog
      onShowFilePicker={() =>
        Promise.resolve({
          type: 'FILE',
          id: 'fake-id',
          name: 'Fake Google Drive file',
          parentId: 'fake-parent-id',
        })
      }
      onCancel={action('cancel')}
      onSave={() => Promise.reject(new Error('fake-error'))}
    />
  ));

storiesOf('OpenConfirmDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <OpenConfirmDialog
      onClose={action('on close')}
      onConfirm={action('on confirm')}
    />
  ));

storiesOf('LayoutChooserDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <LayoutChooserDialog open project={testProject.project} />
  ));

storiesOf('EventsTree', module)
  .addDecorator(muiDecorator)
  .add('default, medium screen (no scope)', () => (
    <DragAndDropContextProvider>
      <div className="gd-events-sheet">
        <FixedHeightFlexContainer height={500}>
          <EventsTree
            events={testProject.testLayout.getEvents()}
            project={testProject.project}
            scope={{ layout: testProject.testLayout }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            selection={getInitialSelection()}
            onAddNewInstruction={action('add new instruction')}
            onPasteInstructions={action('paste instructions')}
            onMoveToInstruction={action('move to instruction')}
            onMoveToInstructionsList={action('move instruction to list')}
            onInstructionClick={action('instruction click')}
            onInstructionDoubleClick={action('instruction double click')}
            onInstructionContextMenu={action('instruction context menu')}
            onAddInstructionContextMenu={action(
              'instruction list context menu'
            )}
            onParameterClick={action('parameter click')}
            onEventClick={action('event click')}
            onEventContextMenu={action('event context menu')}
            onAddNewEvent={action('add new event')}
            onOpenExternalEvents={action('open external events')}
            onOpenLayout={action('open layout')}
            searchResults={null}
            searchFocusOffset={null}
            onEventMoved={() => {}}
            showObjectThumbnails={true}
            screenType={'normal'}
            windowWidth={'medium'}
          />
        </FixedHeightFlexContainer>
      </div>
    </DragAndDropContextProvider>
  ))
  .add('default, small screen (no scope)', () => (
    <DragAndDropContextProvider>
      <div className="gd-events-sheet">
        <FixedHeightFlexContainer height={500}>
          <EventsTree
            events={testProject.testLayout.getEvents()}
            project={testProject.project}
            scope={{ layout: testProject.testLayout }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            selection={getInitialSelection()}
            onAddNewInstruction={action('add new instruction')}
            onPasteInstructions={action('paste instructions')}
            onMoveToInstruction={action('move to instruction')}
            onMoveToInstructionsList={action('move instruction to list')}
            onInstructionClick={action('instruction click')}
            onInstructionDoubleClick={action('instruction double click')}
            onInstructionContextMenu={action('instruction context menu')}
            onAddInstructionContextMenu={action(
              'instruction list context menu'
            )}
            onParameterClick={action('parameter click')}
            onEventClick={action('event click')}
            onEventContextMenu={action('event context menu')}
            onAddNewEvent={action('add new event')}
            onOpenExternalEvents={action('open external events')}
            onOpenLayout={action('open layout')}
            searchResults={null}
            searchFocusOffset={null}
            onEventMoved={() => {}}
            showObjectThumbnails={true}
            screenType={'normal'}
            windowWidth={'small'}
          />
        </FixedHeightFlexContainer>
      </div>
    </DragAndDropContextProvider>
  ));

storiesOf('EventsSheet', module)
  .addDecorator(muiDecorator)
  .add('default (no scope)', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={500}>
        <EventsSheet
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          events={testProject.testLayout.getEvents()}
          onOpenExternalEvents={action('Open external events')}
          resourceSources={[]}
          onChooseResource={source =>
            action('Choose resource from source', source)
          }
          resourceExternalEditors={fakeResourceExternalEditors}
          onOpenDebugger={action('open debugger')}
          onOpenLayout={action('open layout')}
          onOpenSettings={action('open settings')}
          onPreview={action('preview')}
          setToolbar={() => {}}
          showNetworkPreviewButton={false}
          showPreviewButton={false}
          openInstructionOrExpression={action('open instruction or expression')}
          onCreateEventsFunction={action('create events function')}
          previewButtonSettings={emptyPreviewButtonSettings}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ))
  .add('empty (no events) (no scope)', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={500}>
        <EventsSheet
          project={testProject.project}
          scope={{ layout: testProject.emptyLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.emptyLayout}
          events={testProject.emptyLayout.getEvents()}
          onOpenExternalEvents={action('Open external events')}
          resourceSources={[]}
          onChooseResource={source =>
            action('Choose resource from source', source)
          }
          resourceExternalEditors={fakeResourceExternalEditors}
          onOpenDebugger={action('open debugger')}
          onOpenLayout={action('open layout')}
          onOpenSettings={action('open settings')}
          onPreview={action('preview')}
          setToolbar={() => {}}
          showNetworkPreviewButton={false}
          showPreviewButton={false}
          openInstructionOrExpression={action('open instruction or expression')}
          onCreateEventsFunction={action('create events function')}
          previewButtonSettings={emptyPreviewButtonSettings}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ));

storiesOf('EventsSheet/EventsFunctionExtractorDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EventsFunctionExtractorDialog
      project={testProject.project}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      serializedEvents={testProject.testSerializedEvents}
      onClose={action('close')}
      onCreate={action('create')}
    />
  ))
  .add('with a lot of parameters', () => (
    <EventsFunctionExtractorDialog
      project={testProject.project}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      serializedEvents={testProject.testSerializedEventsWithLotsOfObjects}
      onClose={action('close')}
      onCreate={action('create')}
    />
  ));

storiesOf('SearchPanel', module)
  .addDecorator(muiDecorator)
  .add('default (no search done)', () => (
    <SearchPanel
      onSearchInEvents={() => {}}
      onReplaceInEvents={() => {}}
      resultsCount={null}
      hasEventSelected={false}
      onGoToNextSearchResult={action('next')}
      onGoToPreviousSearchResult={action('previous')}
    />
  ))
  .add('default (no results)', () => (
    <SearchPanel
      onSearchInEvents={() => {}}
      onReplaceInEvents={() => {}}
      resultsCount={0}
      hasEventSelected={false}
      onGoToNextSearchResult={action('next')}
      onGoToPreviousSearchResult={action('previous')}
    />
  ))
  .add('3 results', () => (
    <SearchPanel
      onSearchInEvents={() => {}}
      onReplaceInEvents={() => {}}
      resultsCount={3}
      hasEventSelected={false}
      onGoToNextSearchResult={action('next')}
      onGoToPreviousSearchResult={action('previous')}
    />
  ));

storiesOf('ExpressionSelector', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('number (with focusOnMount) (no scope)', () => (
    <FixedHeightFlexContainer height={400}>
      <ExpressionSelector
        selectedType=""
        expressionType="number"
        onChoose={action('Expression chosen')}
        focusOnMount
        scope={{}}
      />
    </FixedHeightFlexContainer>
  ))
  .add('string (with focusOnMount) (no scope)', () => (
    <FixedHeightFlexContainer height={400}>
      <ExpressionSelector
        selectedType=""
        expressionType="string"
        onChoose={action('(String) Expression chosen')}
        focusOnMount
        scope={{}}
      />
    </FixedHeightFlexContainer>
  ));

storiesOf('InstructionSelector', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('conditions (no scope)', () => (
    <FixedHeightFlexContainer height={400}>
      <InstructionSelector
        selectedType=""
        onChoose={action('Instruction chosen')}
        isCondition
        scope={{}}
      />
    </FixedHeightFlexContainer>
  ))
  .add('actions (no scope)', () => (
    <FixedHeightFlexContainer height={400}>
      <InstructionSelector
        selectedType=""
        onChoose={action('Instruction chosen')}
        isCondition={false}
        scope={{}}
      />
    </FixedHeightFlexContainer>
  ));

storiesOf('InstructionOrObjectSelector', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('"KeyPressed" condition chosen, ', () => (
    <ValueStateHolder
      initialValue={'free-instructions'}
      render={(value, onChange) => (
        <FixedHeightFlexContainer height={400}>
          <InstructionOrObjectSelector
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }} // TODO
            project={testProject.project}
            currentTab={value}
            onChangeTab={onChange}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            isCondition
            chosenInstructionType={'KeyPressed'}
            onChooseInstruction={action('instruction chosen')}
            chosenObjectName={null}
            onChooseObject={action('choose object')}
            focusOnMount
          />
        </FixedHeightFlexContainer>
      )}
    />
  ))
  .add('"MySpriteObject" object chosen, ', () => (
    <ValueStateHolder
      initialValue={'objects'}
      render={(value, onChange) => (
        <FixedHeightFlexContainer height={400}>
          <InstructionOrObjectSelector
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }} // TODO
            project={testProject.project}
            currentTab={value}
            onChangeTab={onChange}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            isCondition
            chosenInstructionType={''}
            onChooseInstruction={action('instruction chosen')}
            chosenObjectName={'MySpriteObject'}
            onChooseObject={action('choose object')}
            focusOnMount
          />
        </FixedHeightFlexContainer>
      )}
    />
  ));

storiesOf('InstructionEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default (no scope)', () => (
    <FixedHeightFlexContainer height={400}>
      <InstructionEditor
        project={testProject.project}
        scope={{ layout: testProject.testLayout }}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        isCondition
        instruction={testProject.testInstruction}
        resourceExternalEditors={fakeResourceExternalEditors}
        onChooseResource={() => {
          action('onChooseResource');
          return Promise.reject();
        }}
        resourceSources={[]}
        openInstructionOrExpression={action('open instruction or expression')}
      />
    </FixedHeightFlexContainer>
  ))
  .add('without layout (no scope)', () => (
    <FixedHeightFlexContainer height={400}>
      <InstructionEditor
        project={testProject.project}
        scope={{ layout: null }}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        isCondition
        instruction={testProject.testInstruction}
        resourceExternalEditors={fakeResourceExternalEditors}
        onChooseResource={() => {
          action('onChooseResource');
          return Promise.reject();
        }}
        resourceSources={[]}
        openInstructionOrExpression={action('open instruction or expression')}
      />
    </FixedHeightFlexContainer>
  ));

storiesOf('NewInstructionEditorDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('Existing condition (scope: in a layout)', () => (
    <NewInstructionEditorDialog
      open
      project={testProject.project}
      scope={{ layout: testProject.testLayout }}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      isCondition
      isNewInstruction={false}
      instruction={testProject.testInstruction}
      resourceExternalEditors={fakeResourceExternalEditors}
      onChooseResource={() => {
        action('onChooseResource');
        return Promise.reject();
      }}
      resourceSources={[]}
      openInstructionOrExpression={action('open instruction or expression')}
      onCancel={action('cancel')}
      onSubmit={action('submit')}
    />
  ))
  .add('Existing condition (scope: without layout)', () => (
    <NewInstructionEditorDialog
      open
      project={testProject.project}
      scope={{ layout: null }}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      isCondition
      isNewInstruction={false}
      instruction={testProject.testInstruction}
      resourceExternalEditors={fakeResourceExternalEditors}
      onChooseResource={() => {
        action('onChooseResource');
        return Promise.reject();
      }}
      resourceSources={[]}
      openInstructionOrExpression={action('open instruction or expression')}
      onCancel={action('cancel')}
      onSubmit={action('submit')}
    />
  ))
  .add('New condition (scope: without layout)', () => (
    <NewInstructionEditorDialog
      open
      project={testProject.project}
      scope={{ layout: null }}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      isCondition
      isNewInstruction={true}
      instruction={testProject.testInstruction}
      resourceExternalEditors={fakeResourceExternalEditors}
      onChooseResource={() => {
        action('onChooseResource');
        return Promise.reject();
      }}
      resourceSources={[]}
      openInstructionOrExpression={action('open instruction or expression')}
      onCancel={action('cancel')}
      onSubmit={action('submit')}
    />
  ));

storiesOf('NewInstructionEditorMenu', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <PopoverButton>
      {({ buttonElement, onClose }) => (
        <NewInstructionEditorMenu
          open
          project={testProject.project}
          scope={{ layout: testProject.testLayout }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          isCondition
          isNewInstruction={false}
          instruction={testProject.testInstruction}
          resourceExternalEditors={fakeResourceExternalEditors}
          onChooseResource={() => {
            action('onChooseResource');
            return Promise.reject();
          }}
          resourceSources={[]}
          openInstructionOrExpression={action('open instruction or expression')}
          onCancel={onClose}
          onSubmit={onClose}
          anchorEl={buttonElement}
        />
      )}
    </PopoverButton>
  ));

storiesOf('TextEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testProject.textObject}>
      <TextEditor
        object={testProject.textObject}
        project={testProject.project}
        resourceSources={[]}
        onChooseResource={source =>
          action('Choose resource from source', source)
        }
        resourceExternalEditors={fakeResourceExternalEditors}
      />
    </SerializedObjectDisplay>
  ));

storiesOf('TiledSpriteEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testProject.tiledSpriteObject}>
      <TiledSpriteEditor
        object={testProject.tiledSpriteObject}
        project={testProject.project}
        resourceSources={[]}
        onChooseResource={source =>
          action('Choose resource from source', source)
        }
        resourceExternalEditors={fakeResourceExternalEditors}
      />
    </SerializedObjectDisplay>
  ));

storiesOf('PanelSpriteEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testProject.panelSpriteObject}>
      <PanelSpriteEditor
        object={testProject.panelSpriteObject}
        project={testProject.project}
        resourceSources={[]}
        onChooseResource={source =>
          action('Choose resource from source', source)
        }
        resourceExternalEditors={fakeResourceExternalEditors}
      />
    </SerializedObjectDisplay>
  ));

storiesOf('SpriteEditor and related editors', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('SpriteEditor', () => (
    <SerializedObjectDisplay object={testProject.spriteObject}>
      <SpriteEditor
        object={testProject.spriteObject}
        project={testProject.project}
        resourceSources={[]}
        onChooseResource={source =>
          action('Choose resource from source', source)
        }
        resourceExternalEditors={fakeResourceExternalEditors}
      />
    </SerializedObjectDisplay>
  ))
  .add('PointsEditor', () => (
    <SerializedObjectDisplay object={testProject.spriteObject}>
      <PointsEditor
        object={testProject.spriteObject}
        project={testProject.project}
        resourcesLoader={ResourcesLoader}
      />
    </SerializedObjectDisplay>
  ))
  .add('CollisionMasksEditor', () => (
    <SerializedObjectDisplay object={testProject.spriteObject}>
      <CollisionMasksEditor
        object={testProject.spriteObject}
        project={testProject.project}
        resourcesLoader={ResourcesLoader}
      />
    </SerializedObjectDisplay>
  ));

storiesOf('ShapePainterEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testProject.shapePainterObject}>
      <ShapePainterEditor
        object={testProject.shapePainterObject}
        project={testProject.project}
      />
    </SerializedObjectDisplay>
  ));

storiesOf('ImageThumbnail', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ImageThumbnail
      project={testProject.project}
      resourceName="res/icon128.png"
      resourcesLoader={ResourcesLoader}
    />
  ))
  .add('selectable', () => (
    <ImageThumbnail
      selectable
      project={testProject.project}
      resourceName="res/icon128.png"
      resourcesLoader={ResourcesLoader}
    />
  ));

storiesOf('EmptyEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <EmptyEditor />);

storiesOf('ObjectsList', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <DragAndDropContextProvider>
      <SerializedObjectDisplay object={testProject.testLayout}>
        <div style={{ height: 250 }}>
          <ObjectsList
            getThumbnail={() => 'res/unknown32.png'}
            project={testProject.project}
            objectsContainer={testProject.testLayout}
            onEditObject={action('On edit object')}
            onObjectCreated={action('On object created')}
            selectedObjectNames={[]}
            selectedObjectTags={[]}
            onChangeSelectedObjectTags={selectedObjectTags => {}}
            getAllObjectTags={() => []}
            canRenameObject={() => true}
            onDeleteObject={(objectWithContext, cb) => cb(true)}
            onRenameObject={(objectWithContext, newName, cb) => cb(true)}
            onObjectSelected={() => {}}
          />
        </div>
      </SerializedObjectDisplay>
    </DragAndDropContextProvider>
  ))
  .add('with tags', () => (
    <DragAndDropContextProvider>
      <SerializedObjectDisplay object={testProject.testLayout}>
        <div style={{ height: 250 }}>
          <ObjectsList
            getThumbnail={() => 'res/unknown32.png'}
            project={testProject.project}
            objectsContainer={testProject.testLayout}
            onEditObject={action('On edit object')}
            onObjectCreated={action('On object created')}
            selectedObjectNames={[]}
            selectedObjectTags={['Tag1', 'Tag2']}
            onChangeSelectedObjectTags={action(
              'on change selected object tags'
            )}
            getAllObjectTags={() => [
              'Tag1',
              'Tag2',
              'Looooooooooong Tag 3',
              'Unselected Tag 4',
            ]}
            canRenameObject={() => true}
            onDeleteObject={(objectWithContext, cb) => cb(true)}
            onRenameObject={(objectWithContext, newName, cb) => cb(true)}
            onObjectSelected={() => {}}
          />
        </div>
      </SerializedObjectDisplay>
    </DragAndDropContextProvider>
  ));

storiesOf('ObjectSelector', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('without groups', () => (
    <ValueStateHolder
      initialValue={''}
      render={(value, onChange) => (
        <ObjectSelector
          project={testProject.project}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
          onChoose={action('onChoose in ObjectSelector')}
          noGroups
          hintText="Choose an object to add to the group"
          fullWidth
          openOnFocus
        />
      )}
    />
  ))
  .add('with groups', () => (
    <ValueStateHolder
      initialValue={''}
      render={(value, onChange) => (
        <ObjectSelector
          project={testProject.project}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
          onChoose={action('onChoose in ObjectSelector')}
          hintText="Choose an object or a group"
          fullWidth
          openOnFocus
        />
      )}
    />
  ));

storiesOf('InstancePropertiesEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testProject.testLayout}>
      <InstancePropertiesEditor
        project={testProject.project}
        layout={testProject.testLayout}
        instances={[testProject.testLayoutInstance1]}
        editInstanceVariables={action('edit instance variables')}
        editObjectVariables={action('edit object variables')}
        onEditObjectByName={action('edit object')}
      />
    </SerializedObjectDisplay>
  ));

storiesOf('ObjectGroupEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ObjectGroupEditor
      project={testProject.project}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      group={testProject.group2}
    />
  ));

storiesOf('ObjectGroupsList', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testProject.testLayout}>
      <div style={{ height: 250 }}>
        <ObjectGroupsList
          globalObjectGroups={testProject.project.getObjectGroups()}
          objectGroups={testProject.testLayout.getObjectGroups()}
          onEditGroup={() => {}}
          canRenameGroup={() => true}
        />
      </div>
    </SerializedObjectDisplay>
  ));

storiesOf('BehaviorsEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testProject.spriteObjectWithBehaviors}>
      <BehaviorsEditor
        project={testProject.project}
        object={testProject.spriteObjectWithBehaviors}
      />
    </SerializedObjectDisplay>
  ));

storiesOf('VariablesList', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SerializedObjectDisplay object={testProject.testLayout}>
      <VariablesList
        variablesContainer={testProject.testLayout.getVariables()}
      />
    </SerializedObjectDisplay>
  ));

const fakeError = new Error('Fake error for storybook');
storiesOf('ErrorBoundary', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ErrorFallbackComponent componentStack="Fake stack" error={fakeError} />
  ));

storiesOf('Changelog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('no breaking changes in this version (but in a previous)', () => (
    <ChangelogRenderer
      releases={[release, releaseWithBreakingChange]}
      error={null}
      currentReleaseName="5.0.0-beta62"
    />
  ))
  .add('breaking changes in this version', () => (
    <ChangelogRenderer
      releases={[releaseWithBreakingChange]}
      error={null}
      currentReleaseName="5.0.0-beta60"
    />
  ))
  .add('release without a description', () => (
    <ChangelogRenderer
      releases={[releaseWithoutDescription]}
      error={null}
      currentReleaseName="5.0.0-beta60"
    />
  ))
  .add('loading', () => (
    <ChangelogRenderer
      releases={null}
      error={null}
      currentReleaseName="5.0.0-beta62"
    />
  ))
  .add('with error', () => (
    <ChangelogRenderer
      releases={null}
      error={new Error('Fake error')}
      currentReleaseName="5.0.0-beta62"
    />
  ))
  .add('complete changelog dialog', () => (
    <ChangelogDialog open onClose={action('close dialog')} />
  ));

storiesOf('CreateProfile', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <CreateProfile
      onLogin={action('onLogin')}
      onCreateAccount={action('onCreateAccount')}
    />
  ));

storiesOf('LimitDisplayer', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <LimitDisplayer
      subscription={subscriptionForIndieUser}
      limit={limitsForIndieUser['cordova-build']}
      onChangeSubscription={action('change subscription')}
    />
  ))
  .add('limit reached', () => (
    <LimitDisplayer
      subscription={subscriptionForIndieUser}
      limit={limitsReached['cordova-build']}
      onChangeSubscription={action('change subscription')}
    />
  ))
  .add('limit reached without subscription', () => (
    <LimitDisplayer
      subscription={noSubscription}
      limit={limitsReached['cordova-build']}
      onChangeSubscription={action('change subscription')}
    />
  ));

storiesOf('ProfileDetails', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('profile', () => <ProfileDetails profile={profileForIndieUser} />)
  .add('loading', () => <ProfileDetails profile={null} />);

storiesOf('SubscriptionDetails', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SubscriptionDetails
      subscription={subscriptionForIndieUser}
      onChangeSubscription={action('change subscription')}
    />
  ))
  .add('limit reached', () => (
    <SubscriptionDetails
      subscription={noSubscription}
      onChangeSubscription={action('change subscription')}
    />
  ));

storiesOf('UsagesDetails', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <UsagesDetails usages={usagesForIndieUser} />)
  .add('empty', () => <UsagesDetails usages={[]} />);

storiesOf('SubscriptionDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('not authenticated', () => (
    <UserProfileContext.Provider value={fakeNotAuthenticatedUserProfile}>
      <SubscriptionDialog open onClose={action('on close')} />
    </UserProfileContext.Provider>
  ))
  .add('authenticated but loading', () => (
    <UserProfileContext.Provider value={fakeAuthenticatedButLoadingUserProfile}>
      <SubscriptionDialog open onClose={action('on close')} />
    </UserProfileContext.Provider>
  ))
  .add('authenticated user with subscription', () => (
    <UserProfileContext.Provider value={fakeIndieUserProfile}>
      <SubscriptionDialog open onClose={action('on close')} />
    </UserProfileContext.Provider>
  ))
  .add('authenticated user with no subscription', () => (
    <UserProfileContext.Provider value={fakeNoSubscriptionUserProfile}>
      <SubscriptionDialog open onClose={action('on close')} />
    </UserProfileContext.Provider>
  ));

storiesOf('SubscriptionPendingDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default (no subscription)', () => (
    <SubscriptionPendingDialog
      userProfile={fakeNoSubscriptionUserProfile}
      onClose={action('on close')}
    />
  ))
  .add('authenticated user with subscription', () => (
    <SubscriptionPendingDialog
      userProfile={fakeIndieUserProfile}
      onClose={action('on close')}
    />
  ));

storiesOf('Profile/LoginDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <LoginDialog
      onClose={action('on close')}
      loginInProgress={false}
      onGoToCreateAccount={action('on go to create account')}
      onLogin={action('on login')}
      onForgotPassword={action('on forgot password')}
      onCloseResetPasswordDialog={action('on close reset password dialog')}
      resetPasswordDialogOpen={false}
      forgotPasswordInProgress={false}
      error={null}
    />
  ))
  .add('login in progress', () => (
    <LoginDialog
      onClose={action('on close')}
      loginInProgress
      onGoToCreateAccount={action('on go to create account')}
      onLogin={action('on login')}
      onForgotPassword={action('on forgot password')}
      onCloseResetPasswordDialog={action('on close reset password dialog')}
      resetPasswordDialogOpen={false}
      forgotPasswordInProgress={false}
      error={null}
    />
  ))
  .add('weak-password error', () => (
    <LoginDialog
      onClose={action('on close')}
      loginInProgress={false}
      onGoToCreateAccount={action('on go to create account')}
      onLogin={action('on login')}
      onForgotPassword={action('on forgot password')}
      onCloseResetPasswordDialog={action('on close reset password dialog')}
      resetPasswordDialogOpen={false}
      forgotPasswordInProgress={false}
      error={{
        code: 'auth/weak-password',
      }}
    />
  ))
  .add('invalid-email error', () => (
    <LoginDialog
      onClose={action('on close')}
      loginInProgress={false}
      onGoToCreateAccount={action('on go to create account')}
      onLogin={action('on login')}
      onForgotPassword={action('on forgot password')}
      onCloseResetPasswordDialog={action('on close reset password dialog')}
      resetPasswordDialogOpen={false}
      forgotPasswordInProgress={false}
      error={{
        code: 'auth/invalid-email',
      }}
    />
  ))
  .add('Reset password', () => (
    <LoginDialog
      onClose={action('on close')}
      loginInProgress={false}
      onGoToCreateAccount={action('on go to create account')}
      onLogin={action('on login')}
      onForgotPassword={action('on forgot password')}
      onCloseResetPasswordDialog={action('on close reset password dialog')}
      forgotPasswordInProgress={false}
      resetPasswordDialogOpen
      error={null}
    />
  ));

storiesOf('Profile/CreateAccountDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <CreateAccountDialog
      onClose={action('on close')}
      createAccountInProgress={false}
      onGoToLogin={action('on go to create account')}
      onCreateAccount={action('on login')}
      error={null}
    />
  ))
  .add('login in progress', () => (
    <CreateAccountDialog
      onClose={action('on close')}
      createAccountInProgress
      onGoToLogin={action('on go to create account')}
      onCreateAccount={action('on login')}
      error={null}
    />
  ))
  .add('weak-password error', () => (
    <CreateAccountDialog
      onClose={action('on close')}
      createAccountInProgress={false}
      onGoToLogin={action('on go to create account')}
      onCreateAccount={action('on login')}
      error={{
        code: 'auth/weak-password',
      }}
    />
  ))
  .add('invalid-email error', () => (
    <CreateAccountDialog
      onClose={action('on close')}
      createAccountInProgress={false}
      onGoToLogin={action('on go to create account')}
      onCreateAccount={action('on login')}
      error={{
        code: 'auth/invalid-email',
      }}
    />
  ));

storiesOf('LocalNetworkPreviewDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <LocalNetworkPreviewDialog
      open
      url="192.168.0.1:2929"
      error={null}
      onRunPreviewLocally={action('on run preview locally')}
      onExport={action('on export')}
      onClose={action('on close')}
    />
  ))
  .add('waiting for url', () => (
    <LocalNetworkPreviewDialog
      open
      url=""
      error={null}
      onRunPreviewLocally={action('on run preview locally')}
      onExport={action('on export')}
      onClose={action('on close')}
    />
  ))
  .add('error', () => (
    <LocalNetworkPreviewDialog
      open
      url="192.168.0.1:2929"
      error={{ message: 'Oops' }}
      onRunPreviewLocally={action('on run preview locally')}
      onExport={action('on export')}
      onClose={action('on close')}
    />
  ));

storiesOf('BrowserPreviewErrorDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('generic error', () => (
    <BrowserPreviewErrorDialog
      error={new Error('fake error')}
      onClose={action('on close')}
    />
  ))
  .add('networking error', () => (
    <BrowserPreviewErrorDialog
      error={
        // $FlowFixMe - mocking an Error with "code field"
        {
          code: 'NetworkingError',
          message: "Oops, you're offline",
        }
      }
      onClose={action('on close')}
    />
  ));

storiesOf('SubscriptionCheckDialog', module)
  .addDecorator(muiDecorator)
  .add('default (try mode)', () => (
    <RefGetter onRef={ref => ref.checkHasSubscription()}>
      <SubscriptionCheckDialog
        title="Preview over wifi"
        id="Preview over wifi"
        userProfile={fakeNoSubscriptionUserProfile}
        onChangeSubscription={action('change subscription')}
        mode="try"
      />
    </RefGetter>
  ))
  .add('default (mandatory mode)', () => (
    <RefGetter onRef={ref => ref.checkHasSubscription()}>
      <SubscriptionCheckDialog
        title="Preview over wifi"
        id="Preview over wifi"
        userProfile={fakeNoSubscriptionUserProfile}
        onChangeSubscription={action('change subscription')}
        mode="mandatory"
      />
    </RefGetter>
  ));

storiesOf('ResourcePreview', module)
  .addDecorator(muiDecorator)
  .add('not existing/missing resource', () => (
    <ResourcePreview
      project={testProject.project}
      resourceName="resource-that-does-not-exists-in-the-project"
      resourcesLoader={ResourcesLoader}
    />
  ))
  .add('image resource', () => (
    <ResourcePreview
      project={testProject.project}
      resourceName="icon128.png"
      resourcesLoader={ResourcesLoader}
    />
  ))
  .add('audio resource', () => (
    <ResourcePreview
      project={testProject.project}
      resourceName="fake-audio1.mp3"
      resourcesLoader={ResourcesLoader}
    />
  ));

storiesOf('ResourceSelector (and ResourceSelectorWithThumbnail)', module)
  .addDecorator(muiDecorator)
  .add('image resource (not existing/missing resource)', () => (
    <ResourceSelector
      resourceKind="image"
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      initialResourceName="resource-that-does-not-exists-in-the-project"
      onChange={action('on change')}
      resourcesLoader={ResourcesLoader}
    />
  ))
  .add('image resource', () => (
    <ResourceSelector
      resourceKind="image"
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      initialResourceName="icon128.png"
      onChange={action('on change')}
      resourcesLoader={ResourcesLoader}
    />
  ))
  .add('image resource, no margin', () => (
    <ResourceSelector
      margin="none"
      resourceKind="image"
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      initialResourceName="icon128.png"
      onChange={action('on change')}
      resourcesLoader={ResourcesLoader}
    />
  ))
  .add('image resource, with thumbnail', () => (
    <ResourceSelectorWithThumbnail
      resourceKind="image"
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      resourceName="icon128.png"
      onChange={action('on change')}
    />
  ))
  .add('audio resource', () => (
    <ResourceSelector
      resourceKind="audio"
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      initialResourceName="fake-audio1.mp3"
      onChange={action('on change')}
      resourcesLoader={ResourcesLoader}
    />
  ))
  .add('font resource, with reset button', () => (
    <ResourceSelector
      canBeReset
      resourceKind="font"
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      initialResourceName="font.otf"
      onChange={action('on change')}
      resourcesLoader={ResourcesLoader}
    />
  ))
  .add('font resource, no margin, with reset button', () => (
    <ResourceSelector
      canBeReset
      margin="none"
      resourceKind="font"
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('Unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
      initialResourceName="font.otf"
      onChange={action('on change')}
      resourcesLoader={ResourcesLoader}
    />
  ));

storiesOf('ResourcesList', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <div style={{ height: 200 }}>
      <ValueStateHolder
        initialValue={null}
        render={(value, onChange) => (
          <ResourcesList
            onSelectResource={onChange}
            selectedResource={value}
            onDeleteResource={() => {}}
            onRenameResource={() => {}}
            project={testProject.project}
          />
        )}
      />
    </div>
  ));

storiesOf('EventsFunctionConfigurationEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default, for a free function (i.e: no behavior)', () => (
    <FixedHeightFlexContainer height={500}>
      <EventsFunctionConfigurationEditor
        project={testProject.project}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        helpPagePath="/events/functions"
        eventsFunction={testProject.testEventsFunction}
        eventsBasedBehavior={null}
        onParametersOrGroupsUpdated={action(
          'Parameters or groups were updated'
        )}
      />
    </FixedHeightFlexContainer>
  ))
  .add('default, for an events based behavior function', () => (
    <FixedHeightFlexContainer height={500}>
      <EventsFunctionConfigurationEditor
        project={testProject.project}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        helpPagePath="/events/functions"
        eventsFunction={testProject.testBehaviorEventsFunction}
        eventsBasedBehavior={testProject.testEventsBasedBehavior}
        onParametersOrGroupsUpdated={action(
          'Parameters or groups were updated'
        )}
      />
    </FixedHeightFlexContainer>
  ))
  .add('default, for an events based behavior lifecycle function', () => (
    <FixedHeightFlexContainer height={500}>
      <EventsFunctionConfigurationEditor
        project={testProject.project}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        helpPagePath="/events/functions"
        eventsFunction={testProject.testBehaviorLifecycleEventsFunction}
        eventsBasedBehavior={testProject.testEventsBasedBehavior}
        onParametersOrGroupsUpdated={action(
          'Parameters or groups were updated'
        )}
      />
    </FixedHeightFlexContainer>
  ));

storiesOf('EventsFunctionsList', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <FixedHeightFlexContainer height={500}>
      <EventsFunctionsList
        project={testProject.project}
        eventsFunctionsContainer={testProject.testEventsFunctionsExtension}
        selectedEventsFunction={testProject.testEventsFunctionsExtension.getEventsFunctionAt(
          1
        )}
        onSelectEventsFunction={action('select')}
        onDeleteEventsFunction={(eventsFunction, cb) => cb(true)}
        onAddEventsFunction={cb => cb({ functionType: 0, name: null })}
        onEventsFunctionAdded={() => {}}
        onRenameEventsFunction={(eventsFunction, newName, cb) => cb(true)}
        canRename={() => true}
      />
    </FixedHeightFlexContainer>
  ));

storiesOf('EventsFunctionsExtensionEditor/index', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={500}>
        <EventsFunctionsExtensionEditor
          project={testProject.project}
          eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
          setToolbar={() => {}}
          resourceSources={[]}
          onChooseResource={source =>
            action('Choose resource from source', source)
          }
          resourceExternalEditors={fakeResourceExternalEditors}
          openInstructionOrExpression={action('open instruction or expression')}
          initiallyFocusedFunctionName={null}
          initiallyFocusedBehaviorName={null}
          onCreateEventsFunction={action('on create events function')}
          previewButtonSettings={emptyPreviewButtonSettings}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ));

storiesOf(
  'EventsFunctionsExtensionEditor/ChooseEventsFunctionsExtensionEditor',
  module
)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <FixedHeightFlexContainer height={500}>
      <ChooseEventsFunctionsExtensionEditor
        eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
        onEditBehaviors={action('edit behaviors')}
        onEditFreeFunctions={action('edit free functions')}
        onEditExtensionOptions={action('edit extension options')}
      />
    </FixedHeightFlexContainer>
  ));

storiesOf('EventsFunctionsExtensionEditor/OptionsEditorDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <I18n>
      {({ i18n }) => (
        <EventsFunctionsExtensionsProvider
          i18n={i18n}
          eventsFunctionCodeWriter={null}
          eventsFunctionsExtensionWriter={null}
          eventsFunctionsExtensionOpener={null}
        >
          <OptionsEditorDialog
            eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
            open
            onClose={action('close')}
          />
        </EventsFunctionsExtensionsProvider>
      )}
    </I18n>
  ));

storiesOf('EventsBasedBehaviorEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EventsBasedBehaviorEditor
      project={testProject.project}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      onPropertiesUpdated={action('properties updated')}
      onTabChanged={action('tab changed')}
      onRenameProperty={action('property rename')}
    />
  ))
  .add('events based behavior without functions', () => (
    <EventsBasedBehaviorEditor
      project={testProject.project}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEmptyEventsBasedBehavior}
      onPropertiesUpdated={action('properties updated')}
      onTabChanged={action('tab changed')}
      onRenameProperty={action('property rename')}
    />
  ));

storiesOf('EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EventsBasedBehaviorEditorDialog
      project={testProject.project}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      onApply={action('apply')}
      onRenameProperty={action('property rename')}
    />
  ))
  .add('events based behavior without functions', () => (
    <EventsBasedBehaviorEditorDialog
      project={testProject.project}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEmptyEventsBasedBehavior}
      onApply={action('apply')}
      onRenameProperty={action('property rename')}
    />
  ));

storiesOf('ProjectManager', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ProjectManager
      project={testProject.project}
      onOpenExternalEvents={action('onOpenExternalEvents')}
      onOpenLayout={action('onOpenLayout')}
      onOpenExternalLayout={action('onOpenExternalLayout')}
      onOpenEventsFunctionsExtension={action('onOpenEventsFunctionsExtension')}
      onAddLayout={action('onAddLayout')}
      onAddExternalLayout={action('onAddExternalLayout')}
      onAddEventsFunctionsExtension={action('onAddEventsFunctionsExtension')}
      onAddExternalEvents={action('onAddExternalEvents')}
      onDeleteLayout={action('onDeleteLayout')}
      onDeleteExternalLayout={action('onDeleteExternalLayout')}
      onDeleteEventsFunctionsExtension={action(
        'onDeleteEventsFunctionsExtension'
      )}
      onDeleteExternalEvents={action('onDeleteExternalEvents')}
      onRenameLayout={action('onRenameLayout')}
      onRenameExternalLayout={action('onRenameExternalLayout')}
      onRenameEventsFunctionsExtension={action(
        'onRenameEventsFunctionsExtension'
      )}
      onRenameExternalEvents={action('onRenameExternalEvents')}
      onSaveProject={action('onSaveProject')}
      onSaveProjectAs={action('onSaveProjectAs')}
      onCloseProject={action('onCloseProject')}
      onExportProject={action('onExportProject')}
      onOpenPreferences={action('onOpenPreferences')}
      onOpenProfile={action('onOpenProfile')}
      onOpenResources={action('onOpenResources')}
      onOpenPlatformSpecificAssets={action('onOpenPlatformSpecificAssets')}
      onChangeSubscription={action('onChangeSubscription')}
      eventsFunctionsExtensionsError={null}
      onReloadEventsFunctionsExtensions={action(
        'onReloadEventsFunctionsExtensions'
      )}
      freezeUpdate={false}
    />
  ))
  .add('Error in functions', () => (
    <ProjectManager
      project={testProject.project}
      onOpenExternalEvents={action('onOpenExternalEvents')}
      onOpenLayout={action('onOpenLayout')}
      onOpenExternalLayout={action('onOpenExternalLayout')}
      onOpenEventsFunctionsExtension={action('onOpenEventsFunctionsExtension')}
      onAddLayout={action('onAddLayout')}
      onAddExternalLayout={action('onAddExternalLayout')}
      onAddEventsFunctionsExtension={action('onAddEventsFunctionsExtension')}
      onAddExternalEvents={action('onAddExternalEvents')}
      onDeleteLayout={action('onDeleteLayout')}
      onDeleteExternalLayout={action('onDeleteExternalLayout')}
      onDeleteEventsFunctionsExtension={action(
        'onDeleteEventsFunctionsExtension'
      )}
      onDeleteExternalEvents={action('onDeleteExternalEvents')}
      onRenameLayout={action('onRenameLayout')}
      onRenameExternalLayout={action('onRenameExternalLayout')}
      onRenameEventsFunctionsExtension={action(
        'onRenameEventsFunctionsExtension'
      )}
      onRenameExternalEvents={action('onRenameExternalEvents')}
      onSaveProject={action('onSaveProject')}
      onSaveProjectAs={action('onSaveProjectAs')}
      onCloseProject={action('onCloseProject')}
      onExportProject={action('onExportProject')}
      onOpenPreferences={action('onOpenPreferences')}
      onOpenProfile={action('onOpenProfile')}
      onOpenResources={action('onOpenResources')}
      onOpenPlatformSpecificAssets={action('onOpenPlatformSpecificAssets')}
      onChangeSubscription={action('onChangeSubscription')}
      eventsFunctionsExtensionsError={
        new Error('Fake error during code generation')
      }
      onReloadEventsFunctionsExtensions={action(
        'onReloadEventsFunctionsExtensions'
      )}
      freezeUpdate={false}
    />
  ));

storiesOf('BehaviorTypeSelector', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <BehaviorTypeSelector
      project={testProject.project}
      value={''}
      onChange={action('change')}
    />
  ))
  .add('with a non existing behavior selected', () => (
    <BehaviorTypeSelector
      project={testProject.project}
      value={'MyCustomExtension::BehaviorThatIsNotYetLoaded'}
      onChange={action('change')}
    />
  ));

storiesOf('ObjectTypeSelector', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default (Sprite selected)', () => (
    <ObjectTypeSelector
      project={testProject.project}
      value={'Sprite'}
      onChange={action('change')}
    />
  ))
  .add('custom label (Sprite selected)', () => (
    <ObjectTypeSelector
      project={testProject.project}
      value={'Sprite'}
      floatingLabelText="Choose the object type to use"
      onChange={action('change')}
    />
  ));

storiesOf('NewBehaviorDialog', module)
  .addDecorator(muiDecorator)
  .add('default, for a Sprite object', () => (
    <NewBehaviorDialog
      open
      project={testProject.project}
      objectType={'Sprite'}
      onClose={action('on close')}
      onChoose={action('on choose')}
    />
  ));

storiesOf('ExtensionsSearchDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <I18n>
      {({ i18n }) => (
        <EventsFunctionsExtensionsProvider
          i18n={i18n}
          eventsFunctionCodeWriter={null}
          eventsFunctionsExtensionWriter={null}
          eventsFunctionsExtensionOpener={null}
        >
          <ExtensionsSearchDialog
            project={testProject.project}
            onClose={action('on close')}
          />
        </EventsFunctionsExtensionsProvider>
      )}
    </I18n>
  ));

storiesOf('EffectsList', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('with some effects', () => (
    <EffectsList
      project={testProject.project}
      resourceExternalEditors={fakeResourceExternalEditors}
      onChooseResource={() => {
        action('onChooseResource');
        return Promise.reject();
      }}
      resourceSources={[]}
      effectsContainer={testProject.layerWithEffects}
      onEffectsUpdated={action('effects updated')}
    />
  ))
  .add('with an effect without effect type', () => (
    <EffectsList
      project={testProject.project}
      resourceExternalEditors={fakeResourceExternalEditors}
      onChooseResource={() => {
        action('onChooseResource');
        return Promise.reject();
      }}
      resourceSources={[]}
      effectsContainer={testProject.layerWithEffectWithoutEffectType}
      onEffectsUpdated={action('effects updated')}
    />
  ))
  .add('without effects', () => (
    <EffectsList
      project={testProject.project}
      resourceExternalEditors={fakeResourceExternalEditors}
      onChooseResource={() => {
        action('onChooseResource');
        return Promise.reject();
      }}
      resourceSources={[]}
      effectsContainer={testProject.layerWithoutEffects}
      onEffectsUpdated={action('effects updated')}
    />
  ));

storiesOf('NewObjectDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <NewObjectDialog
      open
      project={testProject.project}
      onClose={action('close')}
      onChoose={action('choose')}
    />
  ));
