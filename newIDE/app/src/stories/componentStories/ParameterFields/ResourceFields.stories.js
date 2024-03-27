// @flow
import * as React from 'react';

import { testProject } from '../../GDevelopJsInitializerDecorator';
import ValueStateHolder from '../../ValueStateHolder';

import ParameterRenderingService from '../../../EventsSheet/ParameterRenderingService';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { Column, Line } from '../../../UI/Grid';

import AudioResourceField from '../../../EventsSheet/ParameterFields/AudioResourceField';
import ImageResourceField from '../../../EventsSheet/ParameterFields/ImageResourceField';
import VideoResourceField from '../../../EventsSheet/ParameterFields/VideoResourceField';
import BitmapFontResourceField from '../../../EventsSheet/ParameterFields/BitmapFontResourceField';
import FontResourceField from '../../../EventsSheet/ParameterFields/FontResourceField';
import JsonResourceField from '../../../EventsSheet/ParameterFields/JsonResourceField';
import TilemapResourceField from '../../../EventsSheet/ParameterFields/TilemapResourceField';
import Model3DResourceField from '../../../EventsSheet/ParameterFields/Model3DResourceField';
import AtlasResourceField from '../../../EventsSheet/ParameterFields/AtlasResourceField';
import SpineResourceField from '../../../EventsSheet/ParameterFields/SpineResourceField';

export const AllResourceFields = () => (
  <Column expand>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <AudioResourceField
            project={testProject.project}
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
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
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
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
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
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
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
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
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
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
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <TilemapResourceField
            project={testProject.project}
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <Model3DResourceField
            project={testProject.project}
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <AtlasResourceField
            project={testProject.project}
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
          />
        )}
      />
    </Line>
    <Line expand>
      <ValueStateHolder
        initialValue={''}
        render={(value, onChange) => (
          <SpineResourceField
            project={testProject.project}
            scope={{
              project: testProject.project,
              layout: testProject.testLayout,
            }}
            globalObjectsContainer={testProject.project}
            objectsContainer={testProject.testLayout}
            value={value}
            onChange={onChange}
            parameterRenderingService={ParameterRenderingService}
            resourceManagementProps={fakeResourceManagementProps}
          />
        )}
      />
    </Line>
  </Column>
);

export default {
  title: 'ParameterFields',
  component: AllResourceFields,
};
