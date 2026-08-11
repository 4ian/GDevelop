// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';
import PreferencesContext, {
  initialPreferences,
} from '../MainFrame/Preferences/PreferencesContext';
import { usePersistedCollapsedSection } from './UsePersistedCollapsedSection';

describe('usePersistedCollapsedSection', () => {
  it('handles panel state that only contains a scroll position', () => {
    const project = ({
      getProjectUuid: () => 'project-id',
    }: any);
    const getEditorStateForProject = () => ({
      editorTabs: null,
      propertiesPanel: {
        'instances-of-object': {
          'object-id': {
            scrollPosition: 42,
          },
        },
      },
    });
    const preferences = ({
      ...initialPreferences,
      getEditorStateForProject,
    }: any);
    let isSectionFolded = null;
    let renderer = null;

    const HookCapture = () => {
      ({ isSectionFolded } = usePersistedCollapsedSection({
        project,
        persistedPanelStateType: 'instances-of-object',
        persistedPanelStateId: 'object-id',
      }));
      return null;
    };

    act(() => {
      renderer = TestRenderer.create(
        <PreferencesContext.Provider value={preferences}>
          <HookCapture />
        </PreferencesContext.Provider>
      );
    });
    if (!isSectionFolded) throw new Error('Hook was not captured.');

    expect(isSectionFolded('properties')).toBe(false);

    act(() => {
      if (renderer) renderer.unmount();
    });
  });
});
