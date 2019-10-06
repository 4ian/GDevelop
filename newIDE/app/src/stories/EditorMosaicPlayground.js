// @flow
import * as React from 'react';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import EditorMosaic from '../UI/EditorMosaic';
import FixedHeightFlexContainer from './FixedHeightFlexContainer';
import { Line, Column } from '../UI/Grid';

type OpenEditorFunction = (
  editorName: string,
  position: 'start' | 'end',
  slipPercentage: number
) => void;

type Props = {|
  renderButtons: ({| openEditor: OpenEditorFunction |}) => React.Node,
  renderEditorMosaic: ({
    editorRef: { current: EditorMosaic | null },
  }) => React.Node,
|};

export default ({ renderButtons, renderEditorMosaic }: Props) => {
  const editorRef = React.useRef((null: ?EditorMosaic));
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
