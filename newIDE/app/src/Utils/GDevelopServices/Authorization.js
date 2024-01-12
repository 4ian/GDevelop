// @flow
import axios from 'axios';
import {
  GDevelopAuthorizationWebSocketApi,
  GDevelopAuthorizationApi,
} from './ApiConfigs';

export const FEATURE_FLAG_SSO_LOGIN = false;

const apiClient = axios.create({ baseURL: GDevelopAuthorizationApi.baseUrl });

let webSocket: ?WebSocket;

export const setupAuthenticationWebSocket = ({
  onConnectionEstablished,
  onTokenReceived,
  onError,
}: {|
  onConnectionEstablished: (connectionId: string) => void,
  onTokenReceived: (token: string) => Promise<void>,
  onError: Error => void,
|}) => {
  webSocket = new WebSocket(GDevelopAuthorizationWebSocketApi.baseUrl);
  webSocket.onopen = () => {
    console.info('WebSocket - Open.');
    if (webSocket) {
      webSocket.send(JSON.stringify({ action: 'getConnectionId' }));
    }
  };
  webSocket.onclose = () => {
    console.info('WebSocket - Closed.');
  };
  webSocket.onerror = event => {
    console.error('WebSocket - Error:', event);
    onError(event);
  };

  webSocket.onmessage = event => {
    if (event.data) {
      if (typeof event.data !== 'string') {
        console.error(
          `WebSocket - event data of type ${typeof event.data} not supported.`
        );
        return;
      }
      const messageContent = JSON.parse(event.data);
      if (messageContent.type === 'authenticationResult') {
        const messageData = messageContent.data;
        const token = messageData.token;
        if (!token) {
          console.error('WebSocket - No token received.');
        }
        onTokenReceived(token);
        return;
      }
      if (messageContent.type === 'connectionId') {
        const messageData = messageContent.data;
        const connectionId = messageData.connectionId;
        if (!connectionId) {
          console.error('WebSocket - No connectionId received.');
          return;
        }
        onConnectionEstablished(connectionId);
        return;
      }
    }
  };
  return webSocket;
};

export const terminateWebSocket = () => {
  if (webSocket) {
    webSocket.close();
    webSocket = null;
  }
};

export const generateCustomToken = async (
  userId: string,
  getAuthorizationHeader: () => string,
  options: {|
    connectionId: string,
  |}
): Promise<?void> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    '/action/generate-custom-token',
    options,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};
