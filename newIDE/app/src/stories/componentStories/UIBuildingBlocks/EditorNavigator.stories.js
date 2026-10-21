// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import '../../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import { t } from '@lingui/macro';
import paperDecorator from '../../PaperDecorator';
import FlatButton from '../../../UI/FlatButton';
import EditorMosaicPlayground from '../../EditorMosaicPlayground';
import EditorNavigator from '../../../UI/EditorMosaic/EditorNavigator';
import '../../../UI/Theme/Global/Scrollbar.css';
import '../../../UI/Theme/Global/Animation.css';

export default {
  title: 'UI Building Blocks/EditorNavigator',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <EditorMosaicPlayground
    renderButtons={({ openEditor }) => (
      <React.Fragment>
        <FlatButton
          onClick={() => openEditor('thirdEditor', 'bottom')}
          label="Open the third editor"
        />
        <FlatButton
          onClick={() => openEditor('noTransitionsEditor', 'bottom')}
          label="Open the editor without transitions"
        />
      </React.Fragment>
    )}
    renderEditorMosaic={({ editorRef }) => (
      <EditorNavigator
        ref={editorRef}
        initialEditorName="firstEditor"
        transitions={{
          firstEditor: {
            nextLabel: 'Second Editor',
            nextEditor: 'secondEditor',
          },
          secondEditor: {
            previousEditor: 'firstEditor',
            nextLabel: 'Third Editor',
            nextEditor: 'thirdEditor',
          },
          thirdEditor: {
            previousEditor: 'secondEditor',
          },
        }}
        editors={{
          firstEditor: {
            type: 'primary',
            title: t`First editor`,
            toolbarControls: [],
            renderEditor: () => <div>This is the first editor.</div>,
          },
          secondEditor: {
            type: 'primary',
            noTitleBar: true,
            renderEditor: () => <div>This is the second editor.</div>,
          },
          thirdEditor: {
            type: 'secondary',
            title: t`Third editor`,
            renderEditor: () => <div>This is the third editor.</div>,
          },
          noTransitionsEditor: {
            type: 'secondary',
            title: t`Editor without transitions`,
            renderEditor: () => (
              <div>This is an editor without transitions.</div>
            ),
          },
        }}
        onEditorChanged={action('Editor was changed')}
      />
    )}
  />
);

export { Default as ____________Default };
Default.storyName = 'default';
