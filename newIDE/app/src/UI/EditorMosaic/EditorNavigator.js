// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type Editor } from '.';
import { Column, Line } from '../Grid';
import FlatButton from '../FlatButton';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Background from '../Background';

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

    return (
      <Column noMargin expand>
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
                    icon={<ArrowBack />}
                  />
                )}
                {transition.nextLabel && transition.nextEditor && (
                  <FlatButton
                    label={transition.nextLabel}
                    onClick={() => {
                      if (transition.nextEditor)
                        setCurrentEditorName(transition.nextEditor);
                    }}
                    icon={transition.nextIcon}
                  />
                )}
              </Line>
            </Column>
          </Background>
        )}
        {editors[currentEditorName]
          ? editors[currentEditorName].renderEditor()
          : null}
      </Column>
    );
  }
);
