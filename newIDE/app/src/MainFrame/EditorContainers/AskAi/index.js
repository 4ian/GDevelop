// @flow
import * as React from 'react';
import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import { type ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';
import Paper from '../../../UI/Paper';
import { Line } from '../../../UI/Grid';
import { AiRequestChat, type AiRequestChatInterface } from './AiRequestChat';
import {
  addUserMessageToAiRequest,
  createAiRequest,
  getAiRequest,
  type AiRequest,
} from '../../../Utils/GDevelopServices/Generation';
import { delay } from '../../../Utils/Delay';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

type Props = {|
  isActive: boolean,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,
|};

const styles = {
  paper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};

export type AskAiEditorInterface = {|
  getProject: () => void,
  updateToolbar: () => void,
  forceUpdateEditor: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext
  ) => void,
|};

const noop = () => {};

export const AskAi = React.memo<Props>(
  React.forwardRef<Props, AskAiEditorInterface>(
    ({ isActive, setToolbar }: Props, ref) => {
      const updateToolbar = React.useCallback(
        () => {
          if (setToolbar) {
            setToolbar(null);
          }
        },
        [setToolbar]
      );

      React.useImperativeHandle(ref, () => ({
        getProject: noop,
        updateToolbar,
        forceUpdateEditor: noop,
        onEventsBasedObjectChildrenEdited: noop,
        onSceneObjectEdited: noop,
      }));

      const [
        selectedAiRequest,
        setSelectedAiRequest,
      ] = React.useState<AiRequest | null>(null);

      const aiRequestChatRef = React.useRef<AiRequestChatInterface | null>(
        null
      );

      const [isLaunchingAiRequest, setIsLaunchingAiRequest] = React.useState(
        false
      );

      const {
        profile,
        getAuthorizationHeader,
        onOpenCreateAccountDialog,
      } = React.useContext(AuthenticatedUserContext);

      const selectedAiRequestId = selectedAiRequest
        ? selectedAiRequest.id
        : null;
      const sendUserRequest = React.useCallback(
        async (userRequestText: string) => {
          if (!profile) {
            onOpenCreateAccountDialog();
            return;
          }

          try {
            setIsLaunchingAiRequest(true);

            let aiRequest;
            try {
              // Either create a new ai request or continue the existing one with a new message.
              aiRequest = selectedAiRequestId
                ? await addUserMessageToAiRequest(getAuthorizationHeader, {
                    aiRequestId: selectedAiRequestId,
                    userId: profile.id,
                    userRequest: userRequestText,
                  })
                : await createAiRequest(getAuthorizationHeader, {
                    userRequest: userRequestText,
                    userId: profile.id,
                  });
            } finally {
              setIsLaunchingAiRequest(false);
            }
            setIsLaunchingAiRequest(false);
            setSelectedAiRequest(aiRequest);
            if (aiRequestChatRef.current) {
              aiRequestChatRef.current.resetUserInput();
            }

            while (aiRequest.status === 'working') {
              await delay(1000);
              aiRequest = await getAiRequest(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId: aiRequest.id,
              });
              setSelectedAiRequest(aiRequest);
            }
          } catch (error) {
            // TODO: store and display error.
            console.log(error);
          }
        },
        [
          getAuthorizationHeader,
          profile,
          onOpenCreateAccountDialog,
          selectedAiRequestId,
        ]
      );

      return (
        <Paper square background="dark" style={styles.paper}>
          <Line expand useFullHeight>
            <AiRequestChat
              ref={aiRequestChatRef}
              aiRequest={selectedAiRequest}
              onSendUserRequest={sendUserRequest}
              isLaunchingAiRequest={isLaunchingAiRequest}
            />
          </Line>
        </Paper>
      );
    }
  ),
  // Prevent any update to the editor if the editor is not active,
  // and so not visible to the user.
  (prevProps, nextProps) => prevProps.isActive || nextProps.isActive
);

export const renderAskAiContainer = (
  props: RenderEditorContainerPropsWithRef
) => (
  <AskAi
    ref={props.ref}
    project={props.project}
    setToolbar={props.setToolbar}
    isActive={props.isActive}
  />
);
