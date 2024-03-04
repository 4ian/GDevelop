// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type Editor } from '.';
import { Column, Line } from '../Grid';
import FlatButton from '../FlatButton';
import Background from '../Background';
import ChevronArrowLeft from '../CustomSvgIcons/ChevronArrowLeft';
import {
  getAvoidSoftKeyboardStyle,
  useSoftKeyboardBottomOffset,
} from '../MobileSoftKeyboard';

const styles = {
  avoidSoftKeyboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
};

type Props = {|
  initialEditorName: string,
  editors: {
    [string]: Editor,
  },
  transitions: {
    [string]: {|
      nextEditor?: string | (() => string),
      nextLabel?: React.Node,
      nextIcon?: React.Node,
      previousEditor?: string | (() => string),
    |},
  },
  onEditorChanged: (editorName: string) => void,
|};

export type EditorNavigatorInterface = {|
  openEditor: (editorName: string) => void,
|};

// Flow types might have to be changed/removed if upgrading Flow
// (see example at https://github.com/wgao19/flow-notes/blob/master/react/react-memo.md)

export default React.forwardRef<Props, EditorNavigatorInterface>(
  (
    { initialEditorName, editors, transitions, onEditorChanged }: Props,
    ref
  ) => {
    const [currentEditorName, setCurrentEditorName] = React.useState(
      initialEditorName
    );
    const softKeyboardBottomOffset = useSoftKeyboardBottomOffset();
    React.useImperativeHandle(ref, () => ({
      openEditor: editorName => {
        setCurrentEditorName(editorName);
      },
    }));
    React.useEffect(
      () => {
        onEditorChanged(currentEditorName);
      },
      [currentEditorName, onEditorChanged]
    );

    const transition = transitions[currentEditorName];
    let buttonLineJustifyContent = 'space-between';
    if (transition) {
      if (transition.previousEditor && !transition.nextEditor) {
        buttonLineJustifyContent = 'flex-start';
      }
      if (!transition.previousEditor && transition.nextEditor) {
        buttonLineJustifyContent = 'flex-end';
      }
    }

    const editor = editors[currentEditorName];
    const renderedEditorWithKeyboardAvoidanceDiv = editor ? (
      <div
        style={{
          ...styles.avoidSoftKeyboardContainer,
          ...(editor.noSoftKeyboardAvoidance
            ? null
            : getAvoidSoftKeyboardStyle(softKeyboardBottomOffset)),
        }}
      >
        {editor.renderEditor()}
      </div>
    ) : null;

    return (
      <Column noMargin expand noOverflowParent>
        {transition && (
          <Background maxWidth noExpand noFullHeight>
            <Column>
              <Line justifyContent={buttonLineJustifyContent}>
                {transition.previousEditor && (
                  <FlatButton
                    label={<Trans>Back</Trans>}
                    onClick={() => {
                      if (transition.previousEditor)
                        setCurrentEditorName(transition.previousEditor);
                    }}
                    leftIcon={<ChevronArrowLeft />}
                  />
                )}
                {transition.nextLabel && transition.nextEditor && (
                  <FlatButton
                    label={transition.nextLabel}
                    onClick={() => {
                      if (transition.nextEditor)
                        setCurrentEditorName(transition.nextEditor);
                    }}
                    leftIcon={transition.nextIcon}
                  />
                )}
              </Line>
            </Column>
          </Background>
        )}
        {renderedEditorWithKeyboardAvoidanceDiv}
      </Column>
    );
  }
);
