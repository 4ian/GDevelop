// @flow
import * as React from 'react';
import { Column } from './Grid';
import { Tabs } from './Tabs';

const styles = {
  editorsContainer: {
    display: 'flex',
    flex: 1,
    // Prevent a tall editor (e.g. a code editor) from overflowing the tabs.
    minHeight: 0,
    position: 'relative',
  },
  editorContainer: {
    display: 'flex',
    flex: 1,
  },
  hiddenEditorContainer: {
    display: 'none',
  },
};

export type EditorBottomTab<TabName> = {|
  value: TabName,
  label: React.Node,
  renderEditor: () => React.Node,
|};

type Props<TabName> = {|
  tabs: Array<EditorBottomTab<TabName>>,
  currentTab: TabName,
  onChangeTab: TabName => void,
|};

/**
 * Display one editor at a time, switched with tabs shown at the bottom —
 * for small screens, where editors can't be shown side by side (in an
 * `EditorMosaic`). All editors stay mounted (only hidden), so their internal
 * state (scroll position, cursor...) survives tab switches.
 */
const EditorBottomTabsSwitcher = <TabName: string>({
  tabs,
  currentTab,
  onChangeTab,
}: Props<TabName>): React.Node => {
  return (
    <Column expand noMargin>
      <div style={styles.editorsContainer}>
        {tabs.map(tab => (
          <div
            key={tab.value}
            style={
              tab.value === currentTab
                ? styles.editorContainer
                : styles.hiddenEditorContainer
            }
          >
            {tab.renderEditor()}
          </div>
        ))}
      </div>
      <Tabs
        value={currentTab}
        onChange={onChangeTab}
        options={tabs.map(({ value, label }) => ({ value, label }))}
      />
    </Column>
  );
};

export default EditorBottomTabsSwitcher;
