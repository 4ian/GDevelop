// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import { testProject } from '../../GDevelopJsInitializerDecorator';

import OperatorField from '../../../EventsSheet/ParameterFields/OperatorField';
import ValueStateHolder from '../../ValueStateHolder';

export default {
  title: 'ParameterFields/OperatorField',
  component: OperatorField,
  decorators: [paperDecorator],
};

export const OperatorFieldString = (): React.Node => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <OperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        parameterMetadata={
          testProject.stringRelationalOperatorParameterMetadata
        }
      />
    )}
  />
);
export const OperatorFieldNumber = (): React.Node => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <OperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        parameterMetadata={
          testProject.numberRelationalOperatorParameterMetadata
        }
      />
    )}
  />
);
export const OperatorFieldColor = (): React.Node => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <OperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        parameterMetadata={testProject.colorRelationalOperatorParameterMetadata}
      />
    )}
  />
);
export const OperatorFieldUnknownType = (): React.Node => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <OperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        objectsContainer={testProject.testLayout.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        parameterMetadata={
          testProject.unknownRelationalOperatorParameterMetadata
        }
      />
    )}
  />
);
