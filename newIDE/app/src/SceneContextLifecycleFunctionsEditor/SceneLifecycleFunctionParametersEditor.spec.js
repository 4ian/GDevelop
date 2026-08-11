// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer from 'react-test-renderer';

import SceneLifecycleFunctionParametersEditor from './SceneLifecycleFunctionParametersEditor';

jest.mock(
  '../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor/CompactEventsFunctionParametersEditor',
  () => {
    const React = require('react');
    return (props: any): React.Node => (
      <div
        id="compact-function-parameters-editor"
        data-freeze-parameters={props.freezeParameters}
        data-freeze-parameter-descriptions={props.freezeParameterDescriptions}
        data-events-function-name={props.eventsFunction.name}
      />
    );
  }
);

describe('SceneLifecycleFunctionParametersEditor', () => {
  it('reuses the shared parameter editor in fully read-only mode', () => {
    const eventsFunction = ({ name: 'sceneSignal' }: any);
    const renderer = TestRenderer.create(
      <SceneLifecycleFunctionParametersEditor
        project={({}: any)}
        projectScopedContainersAccessor={({}: any)}
        eventsFunction={eventsFunction}
        onWillInstallExtension={() => {}}
        onExtensionInstalled={() => {}}
      />
    );

    expect(
      renderer.root.findByProps({ id: 'compact-function-parameters-editor' })
        .props
    ).toMatchObject({
      'data-freeze-parameters': true,
      'data-freeze-parameter-descriptions': true,
      'data-events-function-name': 'sceneSignal',
    });
  });
});
