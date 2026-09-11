// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import { testProject } from '../../GDevelopJsInitializerDecorator';

import StringWithSelectorField from '../../../EventsSheet/ParameterFields/StringWithSelectorField';
import ParameterRenderingService from '../../../EventsSheet/ParameterRenderingService';
import ValueStateHolder from '../../ValueStateHolder';
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
