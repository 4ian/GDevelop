// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import { t } from '@lingui/macro';
import EditorMosaic from '../../../UI/EditorMosaic';
import FlatButton from '../../../UI/FlatButton';
import EditorMosaicPlayground from '../../EditorMosaicPlayground';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/EditorMosaic',
};

const Default = (): React.Node => (
  <EditorMosaicPlayground
    renderButtons={({ openEditor }) => (
      <FlatButton
        onClick={() => openEditor('thirdEditor', 'bottom')}
        label="Open the third editor"
      />
    )}
    renderEditorMosaic={({ editorRef }) => (
      <EditorMosaic
        ref={editorRef}
        centralNodeId="secondEditor"
        editors={{
          firstEditor: {
            type: 'primary',
            title: t`First editor`,
            toolbarControls: [],
            renderEditor: () => (
              <div>
                This is the first editor (left), with title bar but no controls
                to close the window.
              </div>
            ),
          },
          secondEditor: {
            type: 'primary',
            noTitleBar: true,
            renderEditor: () => (
              <div>
                This is the second editor ("central"), without title bar.
              </div>
            ),
          },
          thirdEditor: {
            type: 'secondary',
            title: t`Third editor`,
            renderEditor: () => <div>This is the third editor (bottom).</div>,
          },
        }}
        initialNodes={{
          direction: 'column',
          first: {
            direction: 'row',
            first: 'firstEditor',
            second: 'secondEditor',
            splitPercentage: 25,
          },
          second: 'thirdEditor',
          splitPercentage: 65,
        }}
      />
    )}
  />
);

export { Default as ___________Default };
Default.storyName = 'default';
