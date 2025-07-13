// @flow
import * as React from 'react';
import TabsTitlebar from './TabsTitlebar';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import { DraggableEditorTabs } from './EditorTabs/DraggableEditorTabs';
import {
  getEditors,
  getCurrentTab,
  getCurrentTabIndex,
  type EditorTabsState,
  type EditorTab,
} from './EditorTabs/EditorTabsHandler';

/*
 * EditorsPane is a thin wrapper that gathers together:
 *  - the TabsTitlebar (and the draggable tabs inside it)
 *  - the main Toolbar
 *  - the rendering of the editors contained in the current pane.
 *
 * It is intentionally kept “dumb”: all the real logic still sits in
 * MainFrame, and is passed down through props. This allows MainFrame to
 * continue owning the business logic while giving us the flexibility to
 * later instantiate several panes or move tabs between them.
 */

type Props = {|
  // State of the tabs for this pane
  editorTabs: EditorTabsState,
  // Visibility/hide logic shared with MainFrame
  tabsTitleBarAndEditorToolbarHidden: boolean,
  // Title-bar props
  toggleProjectManager: () => void,
  hasAskAiOpened: boolean,
  onOpenAskAi: () => void,
  // Tab actions
  onChangeEditorTab: (id: number) => void,
  onCloseEditorTab: (editorTab: EditorTab) => void,
  onCloseOtherEditorTabs: (editorTab: EditorTab) => void,
  onCloseAllEditorTabs: () => void,
  onEditorTabActivated: (editorTab: EditorTab) => void,
  onDropEditorTab: (sourceEditorTab: EditorTab, destinationEditorTab: EditorTab) => void,
  // Toolbar props
  toolbarRef: { current: ?ToolbarInterface },
  toolbarProps: Object,
  // Renderer for a single editor tab content (kept in MainFrame)
  renderEditorTab: (editorTab: EditorTab, isCurrentTab: boolean) => React.Node,
|};

const EditorsPane = ({
  editorTabs,
  tabsTitleBarAndEditorToolbarHidden,
  toggleProjectManager,
  hasAskAiOpened,
  onOpenAskAi,
  onChangeEditorTab,
  onCloseEditorTab,
  onCloseOtherEditorTabs,
  onCloseAllEditorTabs,
  onEditorTabActivated,
  onDropEditorTab,
  toolbarRef,
  toolbarProps,
  renderEditorTab,
}: Props): React.Node => {
  return (
    <>
      <TabsTitlebar
        hidden={tabsTitleBarAndEditorToolbarHidden}
        toggleProjectManager={toggleProjectManager}
        renderTabs={(onEditorTabHovered, onEditorTabClosing) => (
          <DraggableEditorTabs
            hideLabels={false}
            editorTabs={editorTabs}
            onClickTab={(id: number) => onChangeEditorTab(id)}
            onCloseTab={(editorTab: EditorTab) => {
              onEditorTabClosing();
              onCloseEditorTab(editorTab);
            }}
            onCloseOtherTabs={(editorTab: EditorTab) => {
              onEditorTabClosing();
              onCloseOtherEditorTabs(editorTab);
            }}
            onCloseAll={() => {
              onEditorTabClosing();
              onCloseAllEditorTabs();
            }}
            onTabActivated={(editorTab: EditorTab) =>
              onEditorTabActivated(editorTab)
            }
            onDropTab={onDropEditorTab}
            onHoverTab={(
              editorTab: ?EditorTab,
              options: {| isLabelTruncated: boolean |}
            ) => onEditorTabHovered(editorTab, options)}
          />
        )}
        hasAskAiOpened={hasAskAiOpened}
        onOpenAskAi={onOpenAskAi}
      />
      <Toolbar
        ref={toolbarRef}
        hidden={tabsTitleBarAndEditorToolbarHidden}
        showProjectButtons={
          !['start page', 'debugger', 'ask-ai', null].includes(
            getCurrentTab(editorTabs) ? getCurrentTab(editorTabs).key : null
          )
        }
        {...toolbarProps}
      />
      {getEditors(editorTabs).map((editorTab, id) =>
        renderEditorTab(editorTab, getCurrentTabIndex(editorTabs) === id)
      )}
    </>
  );
};

export default EditorsPane;