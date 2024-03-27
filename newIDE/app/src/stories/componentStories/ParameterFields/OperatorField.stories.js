// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import { testProject } from '../../GDevelopJsInitializerDecorator';

import OperatorField from '../../../EventsSheet/ParameterFields/OperatorField';
import ValueStateHolder from '../../ValueStateHolder';

const gd: libGDevelop = global.gd;

export default {
  title: 'ParameterFields/OperatorField',
  component: OperatorField,
  decorators: [paperDecorator],
};

export const OperatorFieldString = () => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <OperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        parameterMetadata={
          testProject.stringRelationalOperatorParameterMetadata
        }
      />
    )}
  />
);
export const OperatorFieldNumber = () => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <OperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        parameterMetadata={
          testProject.numberRelationalOperatorParameterMetadata
        }
      />
    )}
  />
);
export const OperatorFieldColor = () => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <OperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        parameterMetadata={testProject.colorRelationalOperatorParameterMetadata}
      />
    )}
  />
);
export const OperatorFieldUnknownType = () => (
  <ValueStateHolder
    initialValue=""
    render={(value, onChange) => (
      <OperatorField
        scope={{ project: testProject.project }}
        value={value}
        onChange={onChange}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        parameterMetadata={
          testProject.unknownRelationalOperatorParameterMetadata
        }
      />
    )}
  />
);
