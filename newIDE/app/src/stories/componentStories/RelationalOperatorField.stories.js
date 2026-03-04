// @flow
import * as React from 'react';

import paperDecorator from '../PaperDecorator';

import { testProject } from '../GDevelopJsInitializerDecorator';

import RelationalOperatorField from '../../EventsSheet/ParameterFields/RelationalOperatorField';
import ValueStateHolder from '../ValueStateHolder';

export default {
  title: 'ParameterFields/RelationalOperatorField',
  component: RelationalOperatorField,
  decorators: [paperDecorator],
};

export const RelationalOperatorFieldString = (): React.Node => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <RelationalOperatorField
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
export const RelationalOperatorFieldNumber = (): React.Node => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <RelationalOperatorField
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
export const RelationalOperatorFieldColor = (): React.Node => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <RelationalOperatorField
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
export const RelationalOperatorFieldUnknownType = (): React.Node => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <RelationalOperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project.getObjects()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        objectsContainer={testProject.testLayout.getObjects()}
        parameterMetadata={
          testProject.unknownRelationalOperatorParameterMetadata
        }
      />
    )}
  />
);
