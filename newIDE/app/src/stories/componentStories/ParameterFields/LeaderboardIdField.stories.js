// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { testProject } from '../../GDevelopJsInitializerDecorator';
import LeaderboardIdField from '../../../EventsSheet/ParameterFields/LeaderboardIdField';
import ValueStateHolder from '../../ValueStateHolder';

const gd: libGDevelop = global.gd;

export default {
  title: 'ParameterFields/LeaderboardIdField',
  component: LeaderboardIdField,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ValueStateHolder
    initialValue={''}
    render={(value, onChange) => (
      <LeaderboardIdField
        project={testProject.project}
        scope={{ layout: testProject.testLayout }}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        value={value}
        onChange={onChange}
      />
    )}
  />
);

export const InitialValidLeaderboard = () => (
  <ValueStateHolder
    initialValue={'"4932ff25-6cd7-4adb-978d-8d2e532b16cf"'}
    render={(value, onChange) => (
      <LeaderboardIdField
        project={testProject.project}
        scope={{ layout: testProject.testLayout }}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        value={value}
        onChange={onChange}
      />
    )}
  />
);

export const InitialInvalidLeaderboard = () => (
  <ValueStateHolder
    initialValue={'"5032ff25-6cd7-4adb-978d-8d2e532b16cf"'}
    render={(value, onChange) => (
      <LeaderboardIdField
        project={testProject.project}
        scope={{ layout: testProject.testLayout }}
        globalObjectsContainer={testProject.project}
        objectsContainer={testProject.testLayout}
        value={value}
        onChange={onChange}
      />
    )}
  />
);
