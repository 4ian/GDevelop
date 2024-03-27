// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import { testProject } from '../../GDevelopJsInitializerDecorator';
import ObjectField from '../../../EventsSheet/ParameterFields/ObjectField';
import ValueStateHolder from '../../ValueStateHolder';

const gd: libGDevelop = global.gd;

export default {
  title: 'ParameterFields/ObjectField',
  component: ObjectField,
  decorators: [paperDecorator],
};

export const Default = () => (
  <ValueStateHolder
    initialValue={'MySpriteObject'}
    render={(value, onChange) => (
      <ObjectField
        project={testProject.project}
        scope={{ project: testProject.project, layout: testProject.testLayout }}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        value={value}
        onChange={onChange}
      />
    )}
  />
);

export const NonExistingObject = () => (
  <ValueStateHolder
    initialValue={'ThisObjectDoesNotExist'}
    render={(value, onChange) => (
      <ObjectField
        project={testProject.project}
        scope={{ project: testProject.project, layout: testProject.testLayout }}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        value={value}
        onChange={onChange}
      />
    )}
  />
);
NonExistingObject.storyName = 'Error: non existing object';

export const WrongObjectType = () => {
  const instructionMetadata = gd.MetadataProvider.getConditionMetadata(
    gd.JsPlatform.get(),
    'AnimationEnded'
  );
  if (instructionMetadata.getParametersCount() !== 1) {
    throw new Error(
      'Unexpected number of parameters for condition "AnimationEnded" (was it properly found?).'
    );
  }
  const parameterMetadata = instructionMetadata.getParameter(0);

  return (
    <ValueStateHolder
      initialValue={'MyTextObject'}
      render={(value, onChange) => (
        <ObjectField
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          instructionMetadata={instructionMetadata}
          parameterMetadata={parameterMetadata}
          parameterIndex={0}
          value={value}
          onChange={onChange}
        />
      )}
    />
  );
};
WrongObjectType.storyName = 'Error: wrong object type';

export const WithRequiredBehavior = () => {
  const instructionMetadata = gd.MetadataProvider.getActionMetadata(
    gd.JsPlatform.get(),
    'EffectCapability::EffectBehavior::EnableEffect'
  );

  return (
    <ValueStateHolder
      initialValue={'MyFakeObjectWithUnsupportedCapability'}
      render={(value, onChange) => (
        <ObjectField
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          instructionMetadata={instructionMetadata}
          parameterIndex={0}
          value={value}
          onChange={onChange}
        />
      )}
    />
  );
};
WithRequiredBehavior.storyName =
  'Error: object not having a required capability';
