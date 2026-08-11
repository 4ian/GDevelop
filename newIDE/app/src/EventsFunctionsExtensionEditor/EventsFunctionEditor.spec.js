// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer from 'react-test-renderer';

import EventsFunctionEditor, {
  editableEventsFunctionCapabilities,
  fixedEventsFunctionCapabilities,
} from './EventsFunctionEditor';

jest.mock('../EventsSheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any): React.Node => <div {...props} />,
  };
});

const makeProps = (capabilities: any): any => {
  const events = ({}: any);
  const editEventsFunctionParameter = (jest.fn(): any);
  const openEventsBasedEntityPropertyEditorDialog = (jest.fn(): any);
  return {
    props: ({
      project: {},
      scope: {},
      eventsFunction: { getEvents: () => events },
      globalObjectsContainer: {},
      objectsContainer: {},
      projectScopedContainersAccessor: {},
      capabilities,
      setToolbar: jest.fn(),
      onOpenExternalEvents: jest.fn(),
      onOpenLayout: jest.fn(),
      resourceManagementProps: {},
      openInstructionOrExpression: jest.fn(),
      onCreateEventsFunction: jest.fn(),
      onBeginCreateEventsFunction: jest.fn(),
      isActive: true,
      hotReloadPreviewButtonProps: {},
      onWillInstallExtension: jest.fn(),
      onExtensionInstalled: jest.fn(),
      editEventsFunctionParameter,
      openEventsBasedEntityPropertyEditorDialog,
    }: any),
    events,
    editEventsFunctionParameter,
    openEventsBasedEntityPropertyEditorDialog,
  };
};

describe('EventsFunctionEditor', () => {
  it('binds the selected function body and disables structure editing for fixed functions', () => {
    const { props, events } = makeProps(fixedEventsFunctionCapabilities);
    const renderer: any = TestRenderer.create(
      <EventsFunctionEditor {...props} />
    );

    const eventsSheet = renderer.root.findByType('div');
    expect(eventsSheet.props.events).toBe(events);
    expect(eventsSheet.props.editEventsFunctionParameter).toBe(null);
    expect(eventsSheet.props.openEventsBasedEntityPropertyEditorDialog).toBe(
      null
    );
  });

  it('keeps prefab function parameter and property editing enabled', () => {
    const {
      props,
      editEventsFunctionParameter,
      openEventsBasedEntityPropertyEditorDialog,
    } = makeProps(editableEventsFunctionCapabilities);
    const renderer: any = TestRenderer.create(
      <EventsFunctionEditor {...props} />
    );

    const eventsSheet = renderer.root.findByType('div');
    expect(eventsSheet.props.editEventsFunctionParameter).toBe(
      editEventsFunctionParameter
    );
    expect(eventsSheet.props.openEventsBasedEntityPropertyEditorDialog).toBe(
      openEventsBasedEntityPropertyEditorDialog
    );
  });
});
