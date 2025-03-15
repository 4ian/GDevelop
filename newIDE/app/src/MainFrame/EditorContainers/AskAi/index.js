// @flow
import * as React from 'react';
import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import { type ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';
import Paper from '../../../UI/Paper';
import { AiRequestChat, type AiRequestChatInterface } from './AiRequestChat';
import {
  addUserMessageToAiRequest,
  createAiRequest,
  getAiRequest,
  type AiRequest,
} from '../../../Utils/GDevelopServices/Generation';
import { delay } from '../../../Utils/Delay';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { Toolbar } from './Toolbar';
import { getSimplifiedProjectJson } from '../../../Utils/SimplifiedProjectJson';

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
    alignItems: 'center',
    minWidth: 0,
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: 'min(100%, 800px)',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    minHeight: 0,
    minWidth: 0,
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
    ({ isActive, setToolbar, project }: Props, ref) => {
      const [
        selectedAiRequest,
        setSelectedAiRequest,
      ] = React.useState<AiRequest | null>(null);

      const onStartNewChat = React.useCallback(() => {
        setSelectedAiRequest(null);
      }, []);

      const canStartNewChat = !!selectedAiRequest;
      const updateToolbar = React.useCallback(
        () => {
          if (setToolbar) {
            setToolbar(
              <Toolbar
                onStartNewChat={onStartNewChat}
                canStartNewChat={canStartNewChat}
              />
            );
          }
        },
        [setToolbar, onStartNewChat, canStartNewChat]
      );

      React.useEffect(updateToolbar, [updateToolbar]);

      React.useImperativeHandle(ref, () => ({
        getProject: noop,
        updateToolbar,
        forceUpdateEditor: noop,
        onEventsBasedObjectChildrenEdited: noop,
        onSceneObjectEdited: noop,
      }));

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

          const simplifiedProjectJson = project
            ? JSON.stringify(getSimplifiedProjectJson(project))
            : null;

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
                    simplifiedProjectJson,
                  })
                : await createAiRequest(getAuthorizationHeader, {
                    userRequest: userRequestText,
                    userId: profile.id,
                    simplifiedProjectJson,
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
          project,
        ]
      );

      return (
        <Paper square background="dark" style={styles.paper}>
          <div style={styles.chatContainer}>
            <AiRequestChat
              ref={aiRequestChatRef}
              aiRequest={selectedAiRequest}
              onSendUserRequest={sendUserRequest}
              isLaunchingAiRequest={isLaunchingAiRequest}
            />
          </div>
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
