// @flow
import * as React from 'react';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import EditorMosaic from '../UI/EditorMosaic';
import FixedHeightFlexContainer from './FixedHeightFlexContainer';
import { Line, Column } from '../UI/Grid';
import EditorNavigator from '../UI/EditorMosaic/EditorNavigator';

type OpenEditorFunction = (
  editorName: string,
  position: 'start' | 'end',
  slipPercentage: number
) => void;

type Props = {|
  renderButtons: ({| openEditor: OpenEditorFunction |}) => React.Node,
  renderEditorMosaic: ({
    // $FlowFixMe
    editorRef: { current: EditorMosaic | EditorNavigator | null },
  }) => React.Node,
|};

export default ({ renderButtons, renderEditorMosaic }: Props) => {
  // $FlowFixMe
  const editorRef = React.useRef((null: ?EditorMosaic | ?EditorNavigator));
  const openEditor = (
    editorName: string,
    position: 'start' | 'end',
    slipPercentage: number
  ) => {
    if (editorRef.current)
      editorRef.current.openEditor(editorName, position, slipPercentage);
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
