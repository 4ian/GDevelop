// @flow

import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import Rectangle from '../Utils/Rectangle';

export const getContentAABB = async ({
  gameEditorMode,
  previewDebuggerServer,
  getInstancesEditorContentAABB,
}: {|
  gameEditorMode: 'embedded-game' | 'instances-editor',
  previewDebuggerServer: ?PreviewDebuggerServer,
  getInstancesEditorContentAABB: () => Rectangle | null,
|}): Promise<Rectangle | null> => {
  if (gameEditorMode === 'instances-editor') {
    return getInstancesEditorContentAABB();
  }
  if (!previewDebuggerServer) return null;

  const answer = await previewDebuggerServer.sendMessageWithResponse({
    command: 'getContentAABB',
  });
  if (!answer.payload) return null;

  return new Rectangle(
    answer.payload.minX,
    answer.payload.minY,
    answer.payload.maxX,
    answer.payload.maxY,
    answer.payload.minZ,
    answer.payload.maxZ
  );
};
