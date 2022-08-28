// @flow
import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import GDevelopJsInitializerDecorator, {
  testProject,
} from './GDevelopJsInitializerDecorator';

import { storiesOf, addDecorator } from '@storybook/react';
import { action, configureActions } from '@storybook/addon-actions';

import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import Welcome from './Welcome';
import HelpButton from '../UI/HelpButton';
import HelpIcon from '../UI/HelpIcon';
import AboutDialog from '../MainFrame/AboutDialog';
import DragHandle from '../UI/DragHandle';
import Background from '../UI/Background';
import HelpFinder from '../HelpFinder';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import LocalFilePicker from '../UI/LocalFilePicker';
import LocalNetworkPreviewDialog from '../Export/LocalExporters/LocalPreviewLauncher/LocalNetworkPreviewDialog';
import ExternalEventsAutoComplete from '../EventsSheet/EventsTree/Renderers/LinkEvent/ExternalEventsAutoComplete';
import LayerField from '../EventsSheet/ParameterFields/LayerField';
import MouseField from '../EventsSheet/ParameterFields/MouseField';
import SceneVariableField from '../EventsSheet/ParameterFields/SceneVariableField';
import ObjectVariableField from '../EventsSheet/ParameterFields/ObjectVariableField';
import KeyField from '../EventsSheet/ParameterFields/KeyField';
import ExpressionField from '../EventsSheet/ParameterFields/ExpressionField';
import StringField from '../EventsSheet/ParameterFields/StringField';
import ColorExpressionField from '../EventsSheet/ParameterFields/ColorExpressionField';
import TrueFalseField from '../EventsSheet/ParameterFields/TrueFalseField';
import YesNoField from '../EventsSheet/ParameterFields/YesNoField';
import ForceMultiplierField from '../EventsSheet/ParameterFields/ForceMultiplierField';
import ObjectSelector from '../ObjectsList/ObjectSelector';
import ExternalPropertiesDialog from '../MainFrame/EditorContainers/ExternalPropertiesDialog';
import muiDecorator from './ThemeDecorator';
import paperDecorator from './PaperDecorator';
import ValueStateHolder from './ValueStateHolder';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import InstructionSelector from '../EventsSheet/InstructionEditor/InstructionOrExpressionSelector/InstructionSelector';
import ParameterRenderingService from '../EventsSheet/ParameterRenderingService';
import { ErrorFallbackComponent } from '../UI/ErrorBoundary';
import CreateProfile from '../Profile/CreateProfile';
import AuthenticatedUserProfileDetails from '../Profile/AuthenticatedUserProfileDetails';
import CurrentUsageDisplayer from '../Profile/CurrentUsageDisplayer';
import {
  subscriptionForIndieUser,
  limitsForIndieUser,
  limitsReached,
  noSubscription,
  fakeNoSubscriptionAuthenticatedUser,
  fakeIndieAuthenticatedUser,
  fakeNotAuthenticatedAuthenticatedUser,
  fakeAuthenticatedButLoadingAuthenticatedUser,
  fakeAuthenticatedAndEmailVerifiedUser,
  release,
  releaseWithBreakingChange,
  releaseWithoutDescription,
  geometryMonsterExampleShortHeader,
  fireBulletExtensionShortHeader,
  flashExtensionShortHeader,
} from '../fixtures/GDevelopServicesTestData';
import debuggerGameDataDump from '../fixtures/DebuggerGameDataDump.json';
import profilerOutputsTestData from '../fixtures/ProfilerOutputsTestData.json';
import consoleTestData from '../fixtures/ConsoleTestData';
import SubscriptionDetails from '../Profile/Subscription/SubscriptionDetails';
import SubscriptionDialog from '../Profile/Subscription/SubscriptionDialog';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import DebuggerContent from '../Debugger/DebuggerContent';
import BuildStepsProgress from '../Export/Builds/BuildStepsProgress';
import MeasuresTable from '../Debugger/Profiler/MeasuresTable';
import Profiler from '../Debugger/Profiler';
import SearchPanel from '../EventsSheet/SearchPanel';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import ColorField from '../UI/ColorField';
import EmptyMessage from '../UI/EmptyMessage';
import BackgroundText from '../UI/BackgroundText';
import ProjectManager from '../ProjectManager';
import AlertMessage from '../UI/AlertMessage';
import ChangelogRenderer from '../MainFrame/Changelog/ChangelogRenderer';
import ChangelogDialog from '../MainFrame/Changelog/ChangelogDialog';
import EventsFunctionExtractorDialog from '../EventsSheet/EventsFunctionExtractor/EventsFunctionExtractorDialog';
import FixedHeightFlexContainer from './FixedHeightFlexContainer';
import BehaviorTypeSelector from '../BehaviorTypeSelector';
import ObjectTypeSelector from '../ObjectTypeSelector';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import SemiControlledAutoComplete from '../UI/SemiControlledAutoComplete';
import SemiControlledMultiAutoComplete from '../UI/SemiControlledMultiAutoComplete';
import SceneNameField from '../EventsSheet/ParameterFields/SceneNameField';
import InstructionOrObjectSelector from '../EventsSheet/InstructionEditor/InstructionOrObjectSelector';
import InstructionEditorDialog from '../EventsSheet/InstructionEditor/InstructionEditorDialog';
import InstructionEditorMenu from '../EventsSheet/InstructionEditor/InstructionEditorMenu';
import { PopoverButton } from './PopoverButton';
import SubscriptionPendingDialog from '../Profile/Subscription/SubscriptionPendingDialog';
import EmailVerificationPendingDialog from '../Profile/EmailVerificationPendingDialog';
import Dialog from '../UI/Dialog';
import MiniToolbar, { MiniToolbarText } from '../UI/MiniToolbar';
import { Column, Line } from '../UI/Grid';
import DragAndDropTestBed from './DragAndDropTestBed';
import EditorMosaic from '../UI/EditorMosaic';
import FlatButton from '../UI/FlatButton';
import EditorMosaicPlayground from './EditorMosaicPlayground';
import EditorNavigator from '../UI/EditorMosaic/EditorNavigator';
import PropertiesEditor from '../PropertiesEditor';
import { OpenConfirmDialog } from '../ProjectsStorage/OpenConfirmDialog';
import BrowserPreviewErrorDialog from '../Export/BrowserExporters/BrowserS3PreviewLauncher/BrowserPreviewErrorDialog';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import Brush from '@material-ui/icons/Brush';
import Delete from '@material-ui/icons/Delete';
import fakeResourceExternalEditors from './FakeResourceExternalEditors';
import fakeHotReloadPreviewButtonProps from './FakeHotReloadPreviewButtonProps';
import {
  TextFieldWithButtonLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import ExpressionAutocompletionsDisplayer from '../EventsSheet/ParameterFields/GenericExpressionField/ExpressionAutocompletionsDisplayer';
import {
  getFakePopperJsAnchorElement,
  makeFakeExpressionAutocompletions,
  makeFakeExactExpressionAutocompletion,
} from '../fixtures/TestExpressionAutocompletions';
import AutocompletePicker from '../CommandPalette/CommandPalette/AutocompletePicker';
import {
  type NamedCommand,
  type CommandOption,
} from '../CommandPalette/CommandManager';
import HotReloadPreviewButton from '../HotReload/HotReloadPreviewButton';
import HotReloadLogsDialog from '../HotReload/HotReloadLogsDialog';
import ScrollView from '../UI/ScrollView';
import '../UI/Theme/Global/Scrollbar.css';
import '../UI/Theme/Global/Animation.css';
import {
  Accordion,
  AccordionActions,
  AccordionHeader,
  AccordionBody,
} from '../UI/Accordion';
import ProjectPropertiesDialog from '../ProjectManager/ProjectPropertiesDialog';
import { LoadingScreenEditor } from '../ProjectManager/LoadingScreenEditor';
import PreferencesDialog from '../MainFrame/Preferences/PreferencesDialog';
import {
  ExtensionsAccordion,
  ExamplesAccordion,
} from '../Profile/ContributionsDetails';
import ListIcon from '../UI/ListIcon';
import subscriptionSuggestionDecorator from './SubscriptionSuggestionDecorator';

configureActions({
  depth: 2,
  limit: 20,
});

addDecorator(GDevelopJsInitializerDecorator);

// No i18n in this file

storiesOf('Welcome', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('to Storybook', () => <Welcome />);

storiesOf('UI Building Blocks/SelectField', module)
  .addDecorator(paperDecorator)
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
  .add('default, with (markdown) helper text and floating label', () => (
    <ValueStateHolder
      initialValue={'1'}
      render={(value, onChange) => (
        <SelectField
          value={value}
          onChange={(e, i, newValue: string) => onChange(newValue)}
          fullWidth
          helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
          floatingLabelText="This is a floating label"
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
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => {
    const [value, setValue] = React.useState('Hello World');

    return (
      <React.Fragment>
        <SemiControlledTextField value={value} onChange={setValue} />
        <p>State value is {value}</p>
      </React.Fragment>
    );
  })
  .add('default (commitOnBlur)', () => {
    const [value, setValue] = React.useState('Hello World');

    return (
      <React.Fragment>
        <SemiControlledTextField
          value={value}
          onChange={setValue}
          commitOnBlur
        />
        <p>State value is {value}</p>
      </React.Fragment>
    );
  })
  .add('example that is storing a float in the state', () => {
    const [value, setValue] = React.useState(12.35);

    return (
      <React.Fragment>
        <SemiControlledTextField
          value={value.toString()}
          onChange={newValue => setValue(parseFloat(newValue))}
        />
        <p>
          State value is {value} ({typeof value})
        </p>
      </React.Fragment>
    );
  })
  .add('example that is storing a float in the state (commitOnBlur)', () => {
    const [value, setValue] = React.useState(12.35);

    return (
      <React.Fragment>
        <SemiControlledTextField
          value={value.toString()}
          onChange={newValue => setValue(parseFloat(newValue))}
          commitOnBlur
        />
        <p>
          State value is {value} ({typeof value})
        </p>
      </React.Fragment>
    );
  })
  .add('reduced margin, in a MiniToolbar', () => {
    const [value, setValue] = React.useState('Some value');

    return (
      <React.Fragment>
        <MiniToolbar>
          <MiniToolbarText firstChild>Please enter something:</MiniToolbarText>
          <SemiControlledTextField
            margin="none"
            value={value}
            onChange={setValue}
            commitOnBlur
          />
        </MiniToolbar>
        <p>State value is {value}</p>
      </React.Fragment>
    );
  })
  .add('with a (markdown) helper text', () => {
    const [value, setValue] = React.useState('Hello World!');

    return (
      <React.Fragment>
        <SemiControlledTextField
          helperMarkdownText="This is some help text that can be written in **markdown**. This is *very* useful for emphasis and can even be used to add [links](http://example.com)."
          value={value}
          onChange={setValue}
        />
        <p>State value is {value}</p>
      </React.Fragment>
    );
  })
  .add('forceSetValue and forceSetSelection', () => {
    const [value, setValue] = React.useState('Hello World!');
    const field = React.useRef(null);

    return (
      <React.Fragment>
        <SemiControlledTextField
          ref={field}
          value={value}
          onChange={setValue}
        />
        <p>State value is {value}</p>
        <p>
          Clicking on these buttons will focus the field, then do the action
          after 1 second.
        </p>
        <RaisedButton
          onClick={() => {
            field.current && field.current.focus();
            setTimeout(
              () =>
                field.current &&
                field.current.forceSetValue('Forced Hello World'),
              1000
            );
          }}
          label="Force change the value"
        />
        <RaisedButton
          onClick={() => {
            field.current && field.current.focus();
            setTimeout(
              () => field.current && field.current.forceSetSelection(2, 4),
              1000
            );
          }}
          label="Change the selection"
        />
      </React.Fragment>
    );
  });

storiesOf('UI Building Blocks/DragAndDrop', module).add('test bed', () => (
  <DragAndDropContextProvider>
    <DragAndDropTestBed />
  </DragAndDropContextProvider>
));

storiesOf('UI Building Blocks/SemiControlledAutoComplete', module)
  .addDecorator(paperDecorator)
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
  .add('default, with translatable elements and a separator', () => (
    <ValueStateHolder
      initialValue={''}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledAutoComplete
            value={value}
            onChange={onChange}
            dataSource={[
              {
                text: '',
                value: '',
                translatableValue: 'Click me',
                onClick: action('Click me clicked'),
              },
              {
                type: 'separator',
              },
              {
                text: '',
                value: '',
                translatableValue: 'Or click me',
                onClick: action('Click me clicked'),
              },
            ]}
          />
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
  .add(
    'default, with onClick, long texts and renderIcon for some elements',
    () => (
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
                  renderIcon: () => <Brush />,
                },
                {
                  text: '',
                  value: 'Click me 2',
                  onClick: action('Click me 2 clicked'),
                  renderIcon: () => (
                    <ListIcon iconSize={24} src={'res/icon128.png'} />
                  ),
                },
                {
                  text: '',
                  value: 'Click me 3',
                  onClick: action('Click me 3 clicked'),
                },
                {
                  type: 'separator',
                },
              ].concat(
                [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                  text:
                    i % 2
                      ? `Choice ${i}`
                      : `A Veeeeeerrrryyyyyy Looooong Choooooooooooiiiiiiiiice ${i}`,
                  value:
                    i % 2
                      ? `Choice ${i}`
                      : `A Veeeeeerrrryyyyyy Looooong Choooooooooooiiiiiiiiice ${i}`,
                  renderIcon: i % 3 ? () => <Brush /> : undefined,
                }))
              )}
            />
            <p>State value is {value}</p>
          </React.Fragment>
        )}
      />
    )
  )
  .add('in a dialog, with onClick for some elements', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <Dialog open title="some title">
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
            <MiniToolbarText firstChild>Please make a choice:</MiniToolbarText>
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
  ))
  .add('with a floating label', () => (
    <ValueStateHolder
      initialValue={'Choice 6'}
      render={(value, onChange) => (
        <React.Fragment>
          <SemiControlledAutoComplete
            value={value}
            onChange={onChange}
            floatingLabelText="This is a floating label"
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

storiesOf('UI Building Blocks/SemiControlledMultiAutoComplete', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ValueStateHolder
      initialValue={[
        { text: 'Choice 6', value: 'choice-6' },
        { text: 'Choice 1', value: 'choice-1' },
      ]}
      render={(value, onChange) => (
        <ValueStateHolder
          initialValue={null}
          render={(inputValue, onInputChange) => (
            <React.Fragment>
              <SemiControlledMultiAutoComplete
                value={value}
                onChange={(event, value) => onChange(value)}
                dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                  text: `Choice ${i}`,
                  value: `choice-${i}`,
                }))}
                onInputChange={(event, value) => onInputChange(value)}
                inputValue={inputValue}
                loading={false}
                helperText="This is an autocomplete"
                hintText="Start typing!"
              />
              <p>
                values are{' '}
                {value.map(v => `(${v.text} - ${v.value})`).join(', ')}
              </p>
            </React.Fragment>
          )}
        />
      )}
    />
  ))
  .add('loading', () => (
    <ValueStateHolder
      initialValue={[
        { text: 'Choice 6', value: 'choice-6' },
        { text: 'Choice 1', value: 'choice-1' },
      ]}
      render={(value, onChange) => (
        <ValueStateHolder
          initialValue={null}
          render={(inputValue, onInputChange) => (
            <React.Fragment>
              <SemiControlledMultiAutoComplete
                value={value}
                onChange={(event, value) => onChange(value)}
                dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                  text: `Choice ${i}`,
                  value: `choice-${i}`,
                }))}
                onInputChange={(event, value) => onInputChange(value)}
                inputValue={inputValue}
                loading
                helperText="This is an autocomplete"
                hintText="Start typing!"
              />
              <p>
                values are{' '}
                {value.map(v => `(${v.text} - ${v.value})`).join(', ')}
              </p>
            </React.Fragment>
          )}
        />
      )}
    />
  ))
  .add('errored', () => (
    <ValueStateHolder
      initialValue={[
        { text: 'Choice 6', value: 'choice-6' },
        { text: 'Choice 1', value: 'choice-1' },
      ]}
      render={(value, onChange) => (
        <ValueStateHolder
          initialValue={null}
          render={(inputValue, onInputChange) => (
            <React.Fragment>
              <SemiControlledMultiAutoComplete
                value={value}
                onChange={(event, value) => onChange(value)}
                dataSource={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({
                  text: `Choice ${i}`,
                  value: `choice-${i}`,
                }))}
                onInputChange={(event, value) => onInputChange(value)}
                inputValue={inputValue}
                loading={false}
                helperText="This is an autocomplete"
                hintText="Start typing!"
                error="There's been an error."
              />
              <p>
                values are{' '}
                {value.map(v => `(${v.text} - ${v.value})`).join(', ')}
              </p>
            </React.Fragment>
          )}
        />
      )}
    />
  ));

storiesOf('UI Building Blocks/Layout/Grid', module)
  .addDecorator(muiDecorator)
  .add('Line and ScrollView in a fixed height container', () => (
    <FixedHeightFlexContainer height={100}>
      <Column expand>
        <Line overflow="hidden">
          <ScrollView>
            <Text>123</Text>
            <Text>456</Text>
            <Text>789</Text>
            <Text>123</Text>
            <Text>456</Text>
            <Text>789</Text>
          </ScrollView>
          <ScrollView>
            <Text>123</Text>
            <Text>456</Text>
            <Text>789</Text>
            <Text>123</Text>
            <Text>456</Text>
            <Text>789</Text>
          </ScrollView>
        </Line>
      </Column>
    </FixedHeightFlexContainer>
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
  .addDecorator(paperDecorator)
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
          multiline
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

storiesOf('UI Building Blocks/Accordion', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <React.Fragment>
      {[0, 1, 2].map(idx => (
        <Accordion key={idx}>
          <AccordionHeader
            actions={[
              <IconButton
                key="delete"
                size="small"
                onClick={ev => {
                  ev.stopPropagation();
                  action('Header action')();
                }}
              >
                <Delete />
              </IconButton>,
            ]}
          >
            <Text>
              {idx === 0 ? 'Simple accordion' : null}
              {idx === 1 ? 'Accordion with no body padding' : null}
              {idx === 2 ? 'Accordion with actions' : null}
            </Text>
          </AccordionHeader>
          <AccordionBody disableGutters={idx === 1}>
            <Text>
              This is a quadrilateral. A quadrilateral has four points. If yours
              has more, count again - you may be misled.
            </Text>
          </AccordionBody>
          {idx === 2 && (
            <AccordionActions
              actions={[
                <FlatButton
                  primary
                  label="Count"
                  onClick={action('Primary action')}
                />,
              ]}
              secondaryActions={[
                <FlatButton
                  label="Ignore"
                  onClick={action('Secondary action')}
                />,
              ]}
            />
          )}
        </Accordion>
      ))}
    </React.Fragment>
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

storiesOf('UI Building Blocks/Text', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <Column>
      <Text size="title">Title text</Text>
      <Text size="body">
        Usual body text. For most usages. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua.
      </Text>
      <Text size="body2">
        Smaller text. For rare use cases. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua.
      </Text>
    </Column>
  ))
  .add('on a Background', () => (
    <Background>
      <Column>
        <Text size="title">Title text</Text>
        <Text size="body">
          Usual body text. For most usages. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua.
        </Text>
        <Text size="body2">
          Smaller text. For rare use cases. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua.
        </Text>
      </Column>
    </Background>
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
  .add('long text with icon', () => (
    <AlertMessage
      kind="info"
      renderLeftIcon={() => (
        <img
          src="res/tutorial_icons/tween-behavior.jpg"
          alt=""
          style={{
            maxWidth: 128,
            maxHeight: 128,
          }}
        />
      )}
      onHide={() => {}}
    >
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
  ))
  .add('error', () => (
    <AlertMessage kind="error">Hello World, this is an alert text</AlertMessage>
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
        color="100;100;200"
        onChange={() => {}}
      />
      <ColorField
        floatingLabelText="This has a helper text"
        disableAlpha
        fullWidth
        color="100;100;200"
        onChange={() => {}}
        helperMarkdownText="Lorem ipsum **dolor sit amet**, consectetur _adipiscing elit_, [sed do eiusmod](http://example.com) tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      />
      <ColorField
        floatingLabelText="This is not full width"
        disableAlpha
        color="100;100;200"
        onChange={() => {}}
      />
    </div>
  ));

storiesOf('UI Building Blocks/EditorMosaic', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EditorMosaicPlayground
      renderButtons={({ openEditor }) => (
        <FlatButton
          onClick={() => openEditor('thirdEditor', 'end', 65, 'column')}
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
            onClick={() => openEditor('firstEditor', 'end', 65, 'column')}
            label="Open the 1st secondary editor"
          />
          <FlatButton
            onClick={() => openEditor('secondEditor', 'end', 65, 'column')}
            label="Open the 2nd secondary editor"
          />
          <FlatButton
            onClick={() => openEditor('thirdEditor', 'end', 65, 'column')}
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
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <EditorMosaicPlayground
      renderButtons={({ openEditor }) => (
        <React.Fragment>
          <FlatButton
            onClick={() => openEditor('thirdEditor', 'end', 65, 'column')}
            label="Open the third editor"
          />
          <FlatButton
            onClick={() =>
              openEditor('noTransitionsEditor', 'end', 65, 'column')
            }
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

storiesOf('UI Building Blocks/HelpButton', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <HelpButton helpPagePath="/test" />);

storiesOf('UI Building Blocks/HelpIcon', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <HelpIcon helpPagePath="/test" />);

storiesOf('HelpFinder', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => <HelpFinder open onClose={action('close')} />);

storiesOf('PropertiesEditor', module)
  .addDecorator(paperDecorator)
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
        },
        {
          name: 'Some field with edit buttons',
          valueType: 'string',
          getValue: instance => 'Click to test',
          setValue: (instance, newValue) => {},
          onEditButtonBuildMenuTemplate: () => [
            {
              label: 'Option 1',
              click: action('Option 1'),
            },
            {
              label: 'Option 2',
              click: action('Option 2'),
            },
          ],
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
          getDescription: () =>
            'This is a description. It can be fairly long and even have some *Markdown*, including [links](http://example.com).',
        },
        {
          name: 'Some field with edit buttons',
          valueType: 'string',
          getValue: instance => 'Click to test',
          setValue: (instance, newValue) => {},
          onEditButtonBuildMenuTemplate: () => [
            {
              label: 'Option 1',
              click: action('Option 1'),
            },
            {
              label: 'Option 2',
              click: action('Option 2'),
            },
          ],
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
  .add('ExternalEventsAutoComplete', () => (
    <ValueStateHolder
      initialValue={'Test'}
      render={(value, onChange) => (
        <ExternalEventsAutoComplete
          project={testProject.project}
          value={value}
          onChange={onChange}
        />
      )}
    />
  ))
  .add('ExternalEventsAutoComplete (without project)', () => (
    <ValueStateHolder
      initialValue={'Test'}
      render={(value, onChange) => (
        <ExternalEventsAutoComplete value={value} onChange={onChange} />
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
          scope={{}}
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

storiesOf('ExpressionAutcompletionsDisplayer', module)
  .addDecorator(muiDecorator)
  .add('autocompletions (first selected)', () => (
    <ExpressionAutocompletionsDisplayer
      project={testProject.project}
      expressionAutocompletions={makeFakeExpressionAutocompletions()}
      remainingCount={3}
      // $FlowExpectedError
      anchorEl={getFakePopperJsAnchorElement()}
      onChoose={action('chosen')}
      selectedCompletionIndex={0}
      parameterRenderingService={ParameterRenderingService}
      onScroll={() => {}}
    />
  ))
  .add('autocompletions (expression selected)', () => (
    <ExpressionAutocompletionsDisplayer
      project={testProject.project}
      expressionAutocompletions={makeFakeExpressionAutocompletions()}
      remainingCount={3}
      // $FlowExpectedError
      anchorEl={getFakePopperJsAnchorElement()}
      onChoose={action('chosen')}
      selectedCompletionIndex={6}
      parameterRenderingService={ParameterRenderingService}
      onScroll={() => {}}
    />
  ))
  .add('empty autocompletions (because exact expression)', () => (
    <ExpressionAutocompletionsDisplayer
      project={testProject.project}
      expressionAutocompletions={makeFakeExactExpressionAutocompletion()}
      remainingCount={0}
      // $FlowExpectedError
      anchorEl={getFakePopperJsAnchorElement()}
      onChoose={action('chosen')}
      selectedCompletionIndex={0}
      parameterRenderingService={ParameterRenderingService}
      onScroll={() => {}}
    />
  ))
  .add('empty autocompletions (nothing shown)', () => (
    <ExpressionAutocompletionsDisplayer
      project={testProject.project}
      expressionAutocompletions={[]}
      remainingCount={0}
      // $FlowExpectedError
      anchorEl={getFakePopperJsAnchorElement()}
      onChoose={action('chosen')}
      selectedCompletionIndex={0}
      parameterRenderingService={ParameterRenderingService}
      onScroll={() => {}}
    />
  ));

storiesOf('BuildStepsProgress', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('BuildStepsProgress (not started)', () => (
    <BuildStepsProgress
      exportStep={''}
      build={null}
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
        gameId: 'game-id',
        userId: 'fake-user-id',
        type: 'electron-build',
        status: 'pending',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }}
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
        gameId: 'game-id',
        userId: 'fake-user-id',
        type: 'cordova-build',
        status: 'error',
        logsKey: '/fake-error.log',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }}
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
        gameId: 'game-id',
        userId: 'fake-user-id',
        type: 'cordova-build',
        status: 'complete',
        logsKey: '/fake-error.log',
        apkKey: '/fake-game.apk',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }}
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
      stepMaxProgress={100}
      stepCurrentProgress={20}
      errored={false}
      hasBuildStep={false}
    />
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
          profilerOutput={profilerOutputsTestData}
          profilingInProgress={false}
          logsManager={consoleTestData}
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
          profilerOutput={profilerOutputsTestData}
          profilingInProgress={true}
          logsManager={consoleTestData}
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
          profilerOutput={profilerOutputsTestData}
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
          profilerOutput={profilerOutputsTestData}
          profilingInProgress={true}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  ));

storiesOf('MeasuresTable', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <div style={{ height: 250 }}>
      <MeasuresTable
        profilerMeasures={profilerOutputsTestData.framesAverageMeasures}
      />
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

storiesOf('OpenConfirmDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <OpenConfirmDialog
      onClose={action('on close')}
      onConfirm={action('on confirm')}
    />
  ));

storiesOf('ExternalPropertiesDialog', module)
  .addDecorator(muiDecorator)
  .add('with layout selection', () => (
    <ExternalPropertiesDialog
      title="Configure the properties"
      open
      onChoose={action('on choose')}
      onClose={action('on close')}
      project={testProject.project}
    />
  ))
  .add('with help texts', () => (
    <ExternalPropertiesDialog
      title="Configure the properties"
      open
      onChoose={action('on choose')}
      onClose={action('on close')}
      project={testProject.project}
      helpTexts={[
        'This is a help text, remember to read it.',
        "And there's another one!",
      ]}
    />
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
      onCloseSearchPanel={() => {}}
      searchFocusOffset={null}
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
      onCloseSearchPanel={() => {}}
      searchFocusOffset={null}
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
      onCloseSearchPanel={() => {}}
      searchFocusOffset={null}
    />
  ))
  .add('3 results with focus on the second', () => (
    <SearchPanel
      onSearchInEvents={() => {}}
      onReplaceInEvents={() => {}}
      resultsCount={3}
      hasEventSelected={false}
      onGoToNextSearchResult={action('next')}
      onGoToPreviousSearchResult={action('previous')}
      onCloseSearchPanel={() => {}}
      searchFocusOffset={1}
    />
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
  .add('"KeyPressed" condition chosen, scope: layout', () => (
    <ValueStateHolder
      initialValue={'free-instructions'}
      render={(value, onChange) => (
        <I18n>
          {({ i18n }) => (
            <FixedHeightFlexContainer height={400}>
              <InstructionOrObjectSelector
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }} // TODO
                project={testProject.project}
                scope={{ layout: testProject.testLayout }}
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
                onClickMore={action('See new behaviors')}
                i18n={i18n}
              />
            </FixedHeightFlexContainer>
          )}
        </I18n>
      )}
    />
  ))
  .add('"MySpriteObject" object chosen, scope: layout', () => (
    <ValueStateHolder
      initialValue={'objects'}
      render={(value, onChange) => (
        <I18n>
          {({ i18n }) => (
            <FixedHeightFlexContainer height={400}>
              <InstructionOrObjectSelector
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }} // TODO
                project={testProject.project}
                scope={{ layout: testProject.testLayout }}
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
                onClickMore={action('See new behaviors')}
                i18n={i18n}
              />
            </FixedHeightFlexContainer>
          )}
        </I18n>
      )}
    />
  ));

storiesOf('InstructionEditorDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('Existing condition (scope: in a layout)', () => (
    <InstructionEditorDialog
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
      canPasteInstructions={true}
      onPasteInstructions={action('paste instructions')}
    />
  ))
  .add('Existing condition (scope: without layout)', () => (
    <InstructionEditorDialog
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
      canPasteInstructions={true}
      onPasteInstructions={action('paste instructions')}
    />
  ))
  .add('New condition (scope: without layout)', () => (
    <Column>
      <Text>
        Remember to test the search, which search across objects and all
        instructions - including object instructions (so that object
        instructions can be created either by selecting an object first or by
        searching for it).
      </Text>
      <InstructionEditorDialog
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
        canPasteInstructions={true}
        onPasteInstructions={action('paste instructions')}
      />
    </Column>
  ));

storiesOf('InstructionEditorMenu', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <Column>
      <Text>
        Remember to test the search, which search across objects and all
        instructions - including object instructions (so that object
        instructions can be created either by selecting an object first or by
        searching for it).
      </Text>
      <PopoverButton>
        {({ buttonElement, onClose }) => (
          <InstructionEditorMenu
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
            openInstructionOrExpression={action(
              'open instruction or expression'
            )}
            onCancel={onClose}
            onSubmit={onClose}
            anchorEl={buttonElement}
            canPasteInstructions={true}
            onPasteInstructions={action('paste instructions')}
          />
        )}
      </PopoverButton>
    </Column>
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

storiesOf('Profile/CreateProfile', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <CreateProfile
      onLogin={action('onLogin')}
      onCreateAccount={action('onCreateAccount')}
    />
  ));

storiesOf('CurrentUsageDisplayer', module)
  .addDecorator(subscriptionSuggestionDecorator)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <CurrentUsageDisplayer
      subscription={subscriptionForIndieUser}
      currentUsage={limitsForIndieUser.limits['cordova-build']}
      onChangeSubscription={action('on change subscription callback')}
    />
  ))
  .add('limit reached', () => (
    <CurrentUsageDisplayer
      subscription={subscriptionForIndieUser}
      currentUsage={limitsReached.limits['cordova-build']}
      onChangeSubscription={action('on change subscription callback')}
    />
  ))
  .add('limit reached without subscription', () => (
    <CurrentUsageDisplayer
      subscription={noSubscription}
      currentUsage={limitsReached.limits['cordova-build']}
      onChangeSubscription={action('on change subscription callback')}
    />
  ));

storiesOf('AuthenticatedUserProfileDetails', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('profile', () => (
    <AuthenticatedUserProfileDetails
      authenticatedUser={fakeIndieAuthenticatedUser}
      onEditProfile={action('edit profile')}
      onChangeEmail={action('change email')}
    />
  ))
  .add('loading', () => (
    <AuthenticatedUserProfileDetails
      authenticatedUser={fakeAuthenticatedButLoadingAuthenticatedUser}
      onEditProfile={action('edit profile')}
      onChangeEmail={action('change email')}
    />
  ));

storiesOf('Subscription/SubscriptionDetails', module)
  .addDecorator(subscriptionSuggestionDecorator)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <SubscriptionDetails
      subscription={subscriptionForIndieUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  ))
  .add('no subscription', () => (
    <SubscriptionDetails
      subscription={noSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  ))
  .add('loading manage subscription', () => (
    <SubscriptionDetails
      subscription={subscriptionForIndieUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={true}
    />
  ));

storiesOf('Subscription/SubscriptionDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('not authenticated', () => (
    <AuthenticatedUserContext.Provider
      value={fakeNotAuthenticatedAuthenticatedUser}
    >
      <SubscriptionDialog
        open
        onClose={action('on close')}
        analyticsMetadata={{ reason: 'Debugger' }}
      />
    </AuthenticatedUserContext.Provider>
  ))
  .add('authenticated but loading', () => (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedButLoadingAuthenticatedUser}
    >
      <SubscriptionDialog
        open
        onClose={action('on close')}
        analyticsMetadata={{ reason: 'Debugger' }}
      />
    </AuthenticatedUserContext.Provider>
  ))
  .add('authenticated user with subscription', () => (
    <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
      <SubscriptionDialog
        open
        onClose={action('on close')}
        analyticsMetadata={{ reason: 'Debugger' }}
      />
    </AuthenticatedUserContext.Provider>
  ))
  .add('authenticated user with no subscription', () => (
    <AuthenticatedUserContext.Provider
      value={fakeNoSubscriptionAuthenticatedUser}
    >
      <SubscriptionDialog
        open
        onClose={action('on close')}
        analyticsMetadata={{ reason: 'Debugger' }}
      />
    </AuthenticatedUserContext.Provider>
  ));

storiesOf('Subscription/SubscriptionPendingDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default (no subscription)', () => (
    <SubscriptionPendingDialog
      authenticatedUser={fakeNoSubscriptionAuthenticatedUser}
      onClose={action('on close')}
    />
  ))
  .add('authenticated user with subscription', () => (
    <SubscriptionPendingDialog
      authenticatedUser={fakeIndieAuthenticatedUser}
      onClose={action('on close')}
    />
  ));

storiesOf('EmailVerificationPendingDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('non verified user - loading', () => (
    <EmailVerificationPendingDialog
      authenticatedUser={fakeIndieAuthenticatedUser}
      onClose={action('on close')}
    />
  ))
  .add('verified user', () => (
    <EmailVerificationPendingDialog
      authenticatedUser={fakeAuthenticatedAndEmailVerifiedUser}
      onClose={action('on close')}
    />
  ));

storiesOf('Profile/ContributionsDetails', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <>
      <ExtensionsAccordion
        extensions={[fireBulletExtensionShortHeader, flashExtensionShortHeader]}
        extensionError={null}
      />
      <ExamplesAccordion
        examples={[geometryMonsterExampleShortHeader]}
        exampleError={null}
      />
    </>
  ))
  .add('no contributions', () => (
    <>
      <ExtensionsAccordion extensions={[]} extensionError={null} />
      <ExamplesAccordion examples={[]} exampleError={null} />
    </>
  ))
  .add('with errors', () => (
    <>
      <ExtensionsAccordion extensions={[]} extensionError={new Error()} />
      <ExamplesAccordion examples={[]} exampleError={new Error()} />
    </>
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

storiesOf('ProjectManager', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ProjectManager
      project={testProject.project}
      onSaveProjectProperties={async () => true}
      onChangeProjectName={action('onChangeProjectName')}
      onOpenExternalEvents={action('onOpenExternalEvents')}
      onOpenLayout={action('onOpenLayout')}
      onOpenExternalLayout={action('onOpenExternalLayout')}
      onOpenEventsFunctionsExtension={action('onOpenEventsFunctionsExtension')}
      onInstallExtension={action('onInstallExtension')}
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
      onOpenGamesDashboard={action('onOpenGamesDashboard')}
      onOpenResources={action('onOpenResources')}
      onOpenPlatformSpecificAssets={action('onOpenPlatformSpecificAssets')}
      eventsFunctionsExtensionsError={null}
      onReloadEventsFunctionsExtensions={action(
        'onReloadEventsFunctionsExtensions'
      )}
      freezeUpdate={false}
      hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
    />
  ))
  .add('Error in functions', () => (
    <ProjectManager
      project={testProject.project}
      onSaveProjectProperties={async () => true}
      onChangeProjectName={action('onChangeProjectName')}
      onOpenExternalEvents={action('onOpenExternalEvents')}
      onOpenLayout={action('onOpenLayout')}
      onOpenExternalLayout={action('onOpenExternalLayout')}
      onOpenEventsFunctionsExtension={action('onOpenEventsFunctionsExtension')}
      onInstallExtension={action('onInstallExtension')}
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
      onOpenGamesDashboard={action('onOpenGamesDashboard')}
      onOpenResources={action('onOpenResources')}
      onOpenPlatformSpecificAssets={action('onOpenPlatformSpecificAssets')}
      eventsFunctionsExtensionsError={
        new Error('Fake error during code generation')
      }
      onReloadEventsFunctionsExtensions={action(
        'onReloadEventsFunctionsExtensions'
      )}
      freezeUpdate={false}
      hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
    />
  ));

storiesOf('BehaviorTypeSelector', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default, for a base object', () => (
    <BehaviorTypeSelector
      project={testProject.project}
      value={''}
      onChange={action('change')}
      objectType=""
    />
  ))
  .add('with a non existing behavior selected, for a base object', () => (
    <BehaviorTypeSelector
      project={testProject.project}
      value={'MyCustomExtension::BehaviorThatIsNotYetLoaded'}
      onChange={action('change')}
      objectType=""
    />
  ))
  .add('default, for a text object', () => (
    <BehaviorTypeSelector
      project={testProject.project}
      value={''}
      onChange={action('change')}
      objectType="TextObject::Text"
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

storiesOf('CommandPalette', module)
  .addDecorator(muiDecorator)
  .add('commands', () => (
    <I18n>
      {({ i18n }) => (
        <AutocompletePicker
          i18n={i18n}
          items={
            ([
              {
                name: 'OPEN_PROJECT',
                handler: () => {},
              },
              {
                name: 'OPEN_PROJECT_PROPERTIES',
                handler: () => {},
              },
              {
                name: 'EDIT_OBJECT',
                handler: () => {},
              },
            ]: Array<NamedCommand>)
          }
          onClose={() => {}}
          onSelect={action('Open command')}
          placeholder="Start typing a command..."
        />
      )}
    </I18n>
  ))
  .add('command options', () => (
    <I18n>
      {({ i18n }) => (
        <AutocompletePicker
          i18n={i18n}
          items={
            ([
              {
                text: 'Player',
                handler: () => {},
                iconSrc: 'res/unknown32.png',
              },
              {
                text: 'Platform',
                handler: () => {},
                iconSrc: 'res/unknown32.png',
              },
              {
                text: 'Enemy',
                handler: () => {},
                iconSrc: 'res/unknown32.png',
              },
            ]: Array<CommandOption>)
          }
          onClose={() => {}}
          onSelect={action('Select command option')}
          placeholder="Edit object..."
        />
      )}
    </I18n>
  ));

storiesOf('HotReloadPreviewButton', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <HotReloadPreviewButton
      hasPreviewsRunning={false}
      launchProjectDataOnlyPreview={() => {}}
      launchProjectWithLoadingScreenPreview={() => {}}
    />
  ))
  .add('with preview(s) running', () => (
    <HotReloadPreviewButton
      hasPreviewsRunning={true}
      launchProjectDataOnlyPreview={() => {}}
      launchProjectWithLoadingScreenPreview={() => {}}
    />
  ));

storiesOf('HotReloadLogsDialog', module)
  .addDecorator(muiDecorator)
  .add('with an error', () => (
    <HotReloadLogsDialog
      logs={[
        {
          kind: 'error',
          message: 'Oops, something could not be hot-reloaded.',
        },
      ]}
      onClose={() => {}}
      onLaunchNewPreview={() => {}}
    />
  ))
  .add('without an error', () => (
    <HotReloadLogsDialog
      logs={[
        {
          kind: 'info',
          message: 'Everything is fine',
        },
      ]}
      onClose={() => {}}
      onLaunchNewPreview={() => {}}
    />
  ));

storiesOf('ProjectPropertiesDialog', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <ProjectPropertiesDialog
      open
      initialTab="properties"
      project={testProject.project}
      onClose={action('onClose')}
      onApply={async () => true}
      onPropertiesApplied={action('onPropertiesApplied')}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
    />
  ));

storiesOf('ProjectPropertiesDialog/LoadingScreenEditor', module)
  .addDecorator(paperDecorator)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <LoadingScreenEditor
      loadingScreen={testProject.project.getLoadingScreen()}
      onLoadingScreenUpdated={action('onLoadingscreenUpdated')}
      onChangeSubscription={action('onChangeSubscription')}
      project={testProject.project}
      resourceSources={[]}
      onChooseResource={() => Promise.reject('unimplemented')}
      resourceExternalEditors={fakeResourceExternalEditors}
    />
  ));

storiesOf('PreferencesDialog', module)
  .addDecorator(muiDecorator)
  .add('default', () => (
    <I18n>
      {({ i18n }) => (
        <PreferencesDialog i18n={i18n} onClose={action('onClose')} />
      )}
    </I18n>
  ));
