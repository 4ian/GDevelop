// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import { testProject } from '../../GDevelopJsInitializerDecorator';

import StringWithSelectorField from '../../../EventsSheet/ParameterFields/StringWithSelectorField';
import ParameterRenderingService from '../../../EventsSheet/ParameterRenderingService';
import ValueStateHolder from '../../ValueStateHolder';
import AlertProvider from '../../../UI/Alert/AlertProvider';
import { allEasingNames } from '../../../Utils/Easings';

export default {
  title: 'ParameterFields/StringWithSelectorField',
  component: StringWithSelectorField,
  decorators: [paperDecorator],
};

// GDevelop.js is only loaded when stories are rendered, so the metadata
// must be created lazily.
const useParameterMetadata = (
  type: string,
  description: string,
  choices: Array<string> | null
): gdParameterMetadata =>
  React.useMemo(
    () => {
      const gd: libGDevelop = global.gd;
      const parameterMetadata = new gd.ParameterMetadata();
      parameterMetadata.setType(type);
      parameterMetadata.setDescription(description);
      if (choices) parameterMetadata.setExtraInfo(JSON.stringify(choices));
      return parameterMetadata;
    },
    [type, description, choices]
  );

const genericChoices = ['First choice', 'Second choice', 'Third choice'];

const Field = ({
  initialValue,
  parameterMetadata,
  isInline,
}: {|
  initialValue: string,
  parameterMetadata: gdParameterMetadata,
  isInline?: boolean,
|}) => {
  // Use the rendering service to get the field, like the instruction editor
  // does (a list of easings is displayed with a preview).
  const ParameterComponent = ParameterRenderingService.getParameterComponent(
    parameterMetadata.getType(),
    parameterMetadata
  );
  return (
    <AlertProvider>
      <ValueStateHolder
        initialValue={initialValue}
        render={(value, onChange) => (
          <ParameterComponent
            project={testProject.project}
            scope={{ project: testProject.project }}
            value={value}
            onChange={onChange}
            globalObjectsContainer={testProject.project.getObjects()}
            objectsContainer={testProject.testLayout.getObjects()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            parameterMetadata={parameterMetadata}
            isInline={isInline}
          />
        )}
      />
    </AlertProvider>
  );
};

export const Default = (): React.Node => {
  const parameterMetadata = useParameterMetadata(
    'stringWithSelector',
    'Choice',
    genericChoices
  );
  return (
    <Field
      initialValue='"Second choice"'
      parameterMetadata={parameterMetadata}
    />
  );
};

export const EasingsDeclaredAsStringWithSelector = (): React.Node => {
  const parameterMetadata = useParameterMetadata(
    'stringWithSelector',
    'Easing',
    allEasingNames
  );
  return (
    <Field
      initialValue='"easeInOutQuad"'
      parameterMetadata={parameterMetadata}
    />
  );
};

export const EasingsInline = (): React.Node => {
  const parameterMetadata = useParameterMetadata('easing', 'Easing', null);
  return (
    <Field
      initialValue='"bounce"'
      parameterMetadata={parameterMetadata}
      isInline
    />
  );
};

export const Easings = (): React.Node => {
  const parameterMetadata = useParameterMetadata('easing', 'Easing', null);
  return (
    <Field initialValue='"easeOutBack"' parameterMetadata={parameterMetadata} />
  );
};

export const EasingCustomCurve = (): React.Node => {
  const parameterMetadata = useParameterMetadata('easing', 'Easing', null);
  return (
    <Field
      initialValue='"cubic-bezier(.91,.17,.08,.88)"'
      parameterMetadata={parameterMetadata}
    />
  );
};

export const EasingExpression = (): React.Node => {
  const parameterMetadata = useParameterMetadata('easing', 'Easing', null);
  return (
    <Field
      initialValue='"cubic-bezier(" + ToString(Variable(X1)) + ",.1,.25,1)"'
      parameterMetadata={parameterMetadata}
    />
  );
};

// The test project is shared by all the stories: the named easing is removed
// when the story is left.
const useTestProjectNamedEasing = (name: string): boolean => {
  const [isInserted, setIsInserted] = React.useState(false);
  React.useEffect(
    () => {
      const namedEasings = testProject.project.getNamedEasings();
      const namedEasing = namedEasings.insertNewNamedEasing(name, 0);
      namedEasing.setX1(0.34);
      namedEasing.setY1(1.56);
      namedEasing.setX2(0.64);
      namedEasing.setY2(1);
      setIsInserted(true);
      return () => namedEasings.removeNamedEasing(name);
    },
    [name]
  );
  return isInserted;
};

export const EasingNamedEasing = (): React.Node => {
  const parameterMetadata = useParameterMetadata('easing', 'Easing', null);
  const isNamedEasingInserted = useTestProjectNamedEasing('PopupOpen');
  if (!isNamedEasingInserted) return null;
  return (
    <Field initialValue='"PopupOpen"' parameterMetadata={parameterMetadata} />
  );
};

export const EasingUnknownNamedEasing = (): React.Node => {
  const parameterMetadata = useParameterMetadata('easing', 'Easing', null);
  return (
    <Field
      initialValue='"DeletedEasing"'
      parameterMetadata={parameterMetadata}
    />
  );
};
