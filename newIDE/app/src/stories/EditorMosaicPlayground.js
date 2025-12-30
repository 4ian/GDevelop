// @flow
import * as React from 'react';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import { type EditorMosaicInterface } from '../UI/EditorMosaic';
import FixedHeightFlexContainer from './FixedHeightFlexContainer';
import { Line, Column } from '../UI/Grid';
import { type EditorNavigatorInterface } from '../UI/EditorMosaic/EditorNavigator';

type OpenEditorFunction = (
  editorName: string,
  position: 'left' | 'right' | 'bottom'
) => void;

type Props = {|
  renderButtons: ({| openEditor: OpenEditorFunction |}) => React.Node,
  renderEditorMosaic: ({
    editorRef: {
      current: EditorMosaicInterface | EditorNavigatorInterface | null,
    },
  }) => React.Node,
|};

const EditorMosaicPlayground = ({
  renderButtons,
  renderEditorMosaic,
}: Props) => {
  const editorRef = React.useRef<
    EditorMosaicInterface | EditorNavigatorInterface | null
  >(null);
  const openEditor = (
    editorName: string,
    position: 'left' | 'right' | 'bottom'
  ) => {
    if (editorRef.current && editorRef.current.toggleEditor)
      editorRef.current.toggleEditor(editorName, position);
    else if (editorRef.current && editorRef.current.openEditor)
      editorRef.current.openEditor(editorName);
    else {
      console.error(
        'EditorMosaicPlayground: editorRef.current is not a valid editor mosaic or editor navigator'
      );
    }
  };

  return (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={400}>
        <Column expand>
          {renderButtons({ openEditor })}
          <Line expand>{renderEditorMosaic({ editorRef })}</Line>
        </Column>
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  );
};
export default EditorMosaicPlayground;
