// @flow
import { GDevelopAuthorizationWebSocketApi } from './ApiConfigs';

let webSocket: ?WebSocket;

export const setupAuthenticationWebSocket = ({
  onConnectionEstablished,
  onTokenReceived,
  onError,
  onTimeout,
}: {|
  onConnectionEstablished: (connectionId: string) => void,
  onTokenReceived: ({|
    provider: 'apple' | 'google' | 'github',
    data: any,
  |}) => Promise<void>,
  onError: Error => void,
  onTimeout: () => void,
|}) => {
  webSocket = new WebSocket(GDevelopAuthorizationWebSocketApi.baseUrl);
  const timeoutId = setTimeout(onTimeout, 10000);
  webSocket.onopen = () => {
    console.info('WebSocket - Open.');
    if (webSocket) {
      webSocket.send(JSON.stringify({ action: 'getConnectionId' }));
    }
  };
  webSocket.onclose = () => {
    console.info('WebSocket - Closed.');
    clearTimeout(timeoutId);
  };
  webSocket.onerror = event => {
    console.error('WebSocket - Error:', event);
    clearTimeout(timeoutId);
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
        onTokenReceived(messageData);
        return;
      }
      if (messageContent.type === 'connectionId') {
        const messageData = messageContent.data;
        const connectionId = messageData.connectionId;
        if (!connectionId) {
          console.error('WebSocket - No connectionId received.');
          return;
        }
        clearTimeout(timeoutId);
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
