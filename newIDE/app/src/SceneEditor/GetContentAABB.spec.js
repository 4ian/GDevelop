// @flow

import Rectangle from '../Utils/Rectangle';
import { getContentAABB } from './GetContentAABB';

describe('getContentAABB', () => {
  it('uses the instances editor bounds in instances editor mode', async () => {
    const instancesEditorAABB = new Rectangle(1, 2, 3, 4, 5, 6);
    const sendMessageWithResponse = jest.fn<[Object], Object>();

    const contentAABB = await getContentAABB({
      gameEditorMode: 'instances-editor',
      previewDebuggerServer: ({ sendMessageWithResponse }: any),
      getInstancesEditorContentAABB: () => instancesEditorAABB,
    });

    expect(contentAABB).toBe(instancesEditorAABB);
    expect(sendMessageWithResponse).not.toHaveBeenCalled();
  });

  it('requests and converts runtime bounds in embedded game mode', async () => {
    const sendMessageWithResponse = jest
      .fn<[Object], Object>()
      .mockResolvedValue({
        payload: {
          minX: -46,
          minY: -26,
          minZ: 0,
          maxX: 46,
          maxY: 36,
          maxZ: 120,
        },
      });

    const contentAABB = await getContentAABB({
      gameEditorMode: 'embedded-game',
      previewDebuggerServer: ({ sendMessageWithResponse }: any),
      getInstancesEditorContentAABB: jest.fn(),
    });

    expect(sendMessageWithResponse).toHaveBeenCalledWith({
      command: 'getContentAABB',
    });
    expect(contentAABB).toEqual(new Rectangle(-46, -26, 46, 36, 0, 120));
  });

  it('returns null when the embedded editor has no content', async () => {
    const sendMessageWithResponse = jest
      .fn<[Object], Object>()
      .mockResolvedValue({ payload: null });

    const contentAABB = await getContentAABB({
      gameEditorMode: 'embedded-game',
      previewDebuggerServer: ({ sendMessageWithResponse }: any),
      getInstancesEditorContentAABB: jest.fn(),
    });

    expect(contentAABB).toBe(null);
  });
});
