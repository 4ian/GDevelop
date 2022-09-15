// @flow
import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { testProject } from '../../GDevelopJsInitializerDecorator';
import ValueStateHolder from '../../ValueStateHolder';

import ParameterRenderingService from '../../../EventsSheet/ParameterRenderingService';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { Column, Line } from '../../../UI/Grid';

import AudioResourceField from '../../../EventsSheet/ParameterFields/AudioResourceField';
import ImageResourceField from '../../../EventsSheet/ParameterFields/ImageResourceField';
import VideoResourceField from '../../../EventsSheet/ParameterFields/VideoResourceField';
import BitmapFontResourceField from '../../../EventsSheet/ParameterFields/BitmapFontResourceField';
import FontResourceField from '../../../EventsSheet/ParameterFields/FontResourceField';
import JsonResourceField from '../../../EventsSheet/ParameterFields/JsonResourceField';

const gd: libGDevelop = global.gd;

export const AllResourceFields = () => (
  <Column expand>
    <Line expand>
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
            resourceManagementProps={{
              resourceSources: [],
              onChooseResource: () => Promise.reject('Unimplemented'),
              resourceExternalEditors: fakeResourceExternalEditors,
            }}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <ImageResourceField
            project={testProject.project}
            scope={{ layout: testProject.testLayout }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={{
              resourceSources: [],
              onChooseResource: () => Promise.reject('Unimplemented'),
              resourceExternalEditors: fakeResourceExternalEditors,
            }}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <VideoResourceField
            project={testProject.project}
            scope={{ layout: testProject.testLayout }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={{
              resourceSources: [],
              onChooseResource: () => Promise.reject('Unimplemented'),
              resourceExternalEditors: fakeResourceExternalEditors,
            }}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <BitmapFontResourceField
            project={testProject.project}
            scope={{ layout: testProject.testLayout }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={{
              resourceSources: [],
              onChooseResource: () => Promise.reject('Unimplemented'),
              resourceExternalEditors: fakeResourceExternalEditors,
            }}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <FontResourceField
            project={testProject.project}
            scope={{ layout: testProject.testLayout }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={{
              resourceSources: [],
              onChooseResource: () => Promise.reject('Unimplemented'),
              resourceExternalEditors: fakeResourceExternalEditors,
            }}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <JsonResourceField
            project={testProject.project}
            scope={{ layout: testProject.testLayout }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={{
              resourceSources: [],
              onChooseResource: () => Promise.reject('Unimplemented'),
              resourceExternalEditors: fakeResourceExternalEditors,
            }}
          />
        )}
      />
    </Line>
  </Column>
);

export default {
  title: 'ParameterFields',
  component: AllResourceFields,
  decorators: [muiDecorator],
};
