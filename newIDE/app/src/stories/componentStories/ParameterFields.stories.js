// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import ExternalEventsAutoComplete from '../../EventsSheet/EventsTree/Renderers/LinkEvent/ExternalEventsAutoComplete';
import LayerField from '../../EventsSheet/ParameterFields/LayerField';
import MouseButtonField from '../../EventsSheet/ParameterFields/MouseButtonField';
import SceneVariableField from '../../EventsSheet/ParameterFields/SceneVariableField';
import ObjectVariableField from '../../EventsSheet/ParameterFields/ObjectVariableField';
import KeyboardKeyField from '../../EventsSheet/ParameterFields/KeyboardKeyField';
import ExpressionField from '../../EventsSheet/ParameterFields/ExpressionField';
import StringField from '../../EventsSheet/ParameterFields/StringField';
import ColorExpressionField from '../../EventsSheet/ParameterFields/ColorExpressionField';
import TrueFalseField from '../../EventsSheet/ParameterFields/TrueFalseField';
import YesNoField from '../../EventsSheet/ParameterFields/YesNoField';
import ForceMultiplierField from '../../EventsSheet/ParameterFields/ForceMultiplierField';
import paperDecorator from '../PaperDecorator';
import ValueStateHolder from '../ValueStateHolder';
import ParameterRenderingService from '../../EventsSheet/ParameterRenderingService';
import SceneNameField from '../../EventsSheet/ParameterFields/SceneNameField';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'ParameterFields',
  decorators: [paperDecorator],
};

export const _ExpressionField = (): React.Node => (
  <ValueStateHolder
    initialValue={'MySpriteObject.X() + MouseX("", 0)'}
    render={(value, onChange) => (
      <ExpressionField
        project={testProject.project}
        scope={{
          project: testProject.project,
          layout: testProject.testLayout,
        }}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        value={value}
        onChange={onChange}
        // $FlowFixMe[incompatible-type]
        parameterRenderingService={ParameterRenderingService}
      />
    )}
  />
);
_ExpressionField.storyName = 'ExpressionField';

export const ExpressionFieldWithErrors = (): React.Node => (
  <ValueStateHolder
    initialValue={
      'Test()+3-Test()+3-Test()+3-Test()+3-Test()+3-Test()+3-Test()+3-Test()+3\n-Test2()+3-/2//2 \n+ 3()'
    }
    render={(value, onChange) => (
      <ExpressionField
        project={testProject.project}
        scope={{
          project: testProject.project,
          layout: testProject.testLayout,
        }}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        value={value}
        onChange={onChange}
        // $FlowFixMe[incompatible-type]
        parameterRenderingService={ParameterRenderingService}
      />
    )}
  />
);
ExpressionFieldWithErrors.storyName = 'ExpressionField (with errors)';

export const _StringField = (): React.Node => (
  <ValueStateHolder
    initialValue={'ToString(0) + "Test" + NewLine() + VariableString(MyVar)'}
    render={(value, onChange) => (
      <StringField
        project={testProject.project}
        scope={{
          project: testProject.project,
          layout: testProject.testLayout,
        }}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        value={value}
        onChange={onChange}
        // $FlowFixMe[incompatible-type]
        parameterRenderingService={ParameterRenderingService}
      />
    )}
  />
);
_StringField.storyName = 'StringField';

export const _ExternalEventsAutoComplete = (): React.Node => (
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
);
_ExternalEventsAutoComplete.storyName = 'ExternalEventsAutoComplete';

export const ExternalEventsAutoCompleteWithoutProject = (): React.Node => (
  <ValueStateHolder
    initialValue={'Test'}
    render={(value, onChange) => (
      <ExternalEventsAutoComplete value={value} onChange={onChange} />
    )}
  />
);
ExternalEventsAutoCompleteWithoutProject.storyName =
  'ExternalEventsAutoComplete (without project)';

export const _LayerField = (): React.Node => (
  <ValueStateHolder
    initialValue={'"GUI"'}
    render={(value, onChange) => (
      <LayerField
        project={testProject.project}
        scope={{
          project: testProject.project,
          layout: testProject.testLayout,
        }}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        value={value}
        onChange={onChange}
      />
    )}
  />
);
_LayerField.storyName = 'LayerField';

export const LayerFieldWithoutProjectAndLayout = (): React.Node => (
  <ValueStateHolder
    initialValue={'"GUI"'}
    render={(value, onChange) => (
      <LayerField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
LayerFieldWithoutProjectAndLayout.storyName =
  'LayerField (without project and layout)';

export const _SceneNameField = (): React.Node => (
  <ValueStateHolder
    initialValue={'"TestLayout"'}
    render={(value, onChange) => (
      <SceneNameField
        project={testProject.project}
        scope={{
          project: testProject.project,
          layout: testProject.testLayout,
        }}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        value={value}
        onChange={onChange}
      />
    )}
  />
);
_SceneNameField.storyName = 'SceneNameField';

export const SceneNameFieldWithoutProjectAndLayout = (): React.Node => (
  <ValueStateHolder
    initialValue={'"TestLayout"'}
    render={(value, onChange) => (
      <SceneNameField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
SceneNameFieldWithoutProjectAndLayout.storyName =
  'SceneNameField (without project and layout)';

export const _KeyboardKeyField = (): React.Node => (
  <ValueStateHolder
    initialValue={'"Space"'}
    render={(value, onChange) => (
      <KeyboardKeyField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
_KeyboardKeyField.storyName = 'KeyboardKeyField';

export const _MouseButtonField = (): React.Node => (
  <ValueStateHolder
    initialValue={'"Left"'}
    render={(value, onChange) => (
      <MouseButtonField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
_MouseButtonField.storyName = 'MouseButtonField';

export const _SceneVariableField = (): React.Node => (
  <ValueStateHolder
    initialValue={'Variable1'}
    render={(value, onChange) => (
      <SceneVariableField
        project={testProject.project}
        scope={{
          project: testProject.project,
          layout: testProject.testLayout,
        }}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        value={value}
        onChange={onChange}
      />
    )}
  />
);
_SceneVariableField.storyName = 'SceneVariableField';

export const SceneVariableFieldWithoutLayoutAndProject = (): React.Node => (
  <ValueStateHolder
    initialValue={'Variable1'}
    render={(value, onChange) => (
      <SceneVariableField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
SceneVariableFieldWithoutLayoutAndProject.storyName =
  'SceneVariableField (without layout and project)';

export const ObjectVariableFieldWithoutExpressionLayoutAndProject = (): React.Node => (
  <ValueStateHolder
    initialValue={'Variable1'}
    render={(value, onChange) => (
      <ObjectVariableField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
ObjectVariableFieldWithoutExpressionLayoutAndProject.storyName =
  'ObjectVariableField (without expression, layout and project)';

export const ParameterColorField = (): React.Node => (
  <ValueStateHolder
    initialValue={'"123;342;345"'}
    render={(value, onChange) => (
      <ColorExpressionField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
ParameterColorField.storyName = 'ParameterColorField';

export const ParameterColorFieldInline = (): React.Node => (
  <ValueStateHolder
    initialValue={'"123;342;345"'}
    render={(value, onChange) => (
      <ColorExpressionField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        isInline
      />
    )}
  />
);
ParameterColorFieldInline.storyName = 'ParameterColorField (inline)';

export const _TrueFalseField = (): React.Node => (
  <ValueStateHolder
    initialValue={''}
    render={(value, onChange) => (
      <TrueFalseField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        isInline
      />
    )}
  />
);
_TrueFalseField.storyName = 'TrueFalseField';

export const _YesNoField = (): React.Node => (
  <ValueStateHolder
    initialValue={''}
    render={(value, onChange) => (
      <YesNoField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        isInline
      />
    )}
  />
);
_YesNoField.storyName = 'YesNoField';

export const _ForceMultiplierField = (): React.Node => (
  <ValueStateHolder
    initialValue={''}
    render={(value, onChange) => (
      <ForceMultiplierField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
_ForceMultiplierField.storyName = 'ForceMultiplierField';

export const ForceMultiplierFieldWithADeprecatedValue = (): React.Node => (
  <ValueStateHolder
    initialValue={'0.8'}
    render={(value, onChange) => (
      <ForceMultiplierField
        project={testProject.project}
        scope={{
          project: testProject.project,
        }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    )}
  />
);
ForceMultiplierFieldWithADeprecatedValue.storyName =
  'ForceMultiplierField (with a deprecated value)';
