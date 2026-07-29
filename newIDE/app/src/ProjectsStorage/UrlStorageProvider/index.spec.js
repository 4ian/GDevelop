// @flow
import axios from 'axios';
import UrlStorageProvider from '.';

jest.mock('axios');

// $FlowFixMe[method-unbinding] - axios is replaced with a Jest mock.
const axiosGetMock: any = axios.get;

const createOnOpen = () => {
  const operations = UrlStorageProvider.createOperations(
    (({
      setDialog: () => null,
      closeDialog: () => undefined,
      authenticatedUser: {},
    }: any): any)
  );
  if (!operations.onOpen) throw new Error('URL storage must support opening.');
  return operations.onOpen;
};

describe('UrlStorageProvider', () => {
  beforeEach(() => {
    axiosGetMock.mockReset();
  });

  it('opens a legacy single-file example when constants.toml is absent', async () => {
    const projectUrl =
      'https://resources.gdevelop-app.com/examples/platformer/platformer.json';
    const projectContent = { name: 'Platformer' };
    axiosGetMock
      .mockResolvedValueOnce({ data: projectContent })
      .mockRejectedValueOnce({ response: { status: 403 } });

    const result = await createOnOpen()({ fileIdentifier: projectUrl });

    expect(result).toEqual({ content: projectContent });
    expect(axiosGetMock).toHaveBeenNthCalledWith(1, projectUrl);
    expect(axiosGetMock).toHaveBeenNthCalledWith(
      2,
      'https://resources.gdevelop-app.com/examples/platformer/constants.toml'
    );
  });

  it('loads sibling constants and preserves URL authorization parameters', async () => {
    const projectUrl =
      'https://private-assets.gdevelop.io/template/game.json?token=secret';
    const projectContent = { name: 'Private template' };
    axiosGetMock
      .mockResolvedValueOnce({ data: projectContent })
      .mockResolvedValueOnce({
        data: '[game]\ndifficulty = "hard"\n',
      });

    const result = await createOnOpen()({ fileIdentifier: projectUrl });

    expect(result).toEqual({
      content: projectContent,
      constants: { game: { difficulty: 'hard' } },
    });
    expect(axiosGetMock).toHaveBeenNthCalledWith(
      2,
      'https://private-assets.gdevelop.io/template/constants.toml?token=secret'
    );
  });

  it('does not hide non-missing constants.toml failures', async () => {
    axiosGetMock
      .mockResolvedValueOnce({ data: { name: 'Project' } })
      .mockRejectedValueOnce({ response: { status: 500 } });

    await expect(
      createOnOpen()({
        fileIdentifier: 'https://example.com/project.json',
      })
    ).rejects.toEqual({ response: { status: 500 } });
  });

  it('keeps opening data URLs that cannot have sibling files', async () => {
    const projectUrl = 'data:application/json,%7B%22name%22%3A%22Game%22%7D';
    const projectContent = { name: 'Game' };
    axiosGetMock.mockResolvedValueOnce({ data: projectContent });

    await expect(
      createOnOpen()({ fileIdentifier: projectUrl })
    ).resolves.toEqual({ content: projectContent });
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
  });
});
