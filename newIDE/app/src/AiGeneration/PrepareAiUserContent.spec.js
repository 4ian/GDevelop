// @flow
import axios from 'axios';
import { prepareAiUserContent } from './PrepareAiUserContent';
import { createAiUserContentPresignedUrls } from '../Utils/GDevelopServices/Generation';

jest.mock('axios');
jest.mock('../Utils/GDevelopServices/Generation', () => ({
  createAiUserContentPresignedUrls: jest.fn(),
}));

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

const getAuthorizationHeader = () => Promise.resolve('fake-authorization');
// Big enough to be uploaded instead of sent inline.
const simplifiedProjectJson = JSON.stringify({ name: 'x'.repeat(20000) });

describe('prepareAiUserContent', () => {
  beforeEach(() => {
    // $FlowFixMe[method-unbinding]
    mockFn(axios.put).mockResolvedValue({});
    mockFn(createAiUserContentPresignedUrls).mockImplementation(
      (getAuthorizationHeader, { userId }) =>
        Promise.resolve({
          gameProjectJsonSignedUrl: `https://example.com/${userId}`,
          gameProjectJsonUserRelativeKey: `game-project-json/uploaded-by-${userId}`,
          projectSpecificExtensionsSummaryJsonSignedUrl: null,
          projectSpecificExtensionsSummaryJsonUserRelativeKey: null,
          eventsJsonSignedUrl: null,
          eventsJsonUserRelativeKey: null,
        })
    );
  });

  it('uploads the same project again for another account', async () => {
    // The key of an upload is relative to its user: another account can't
    // read it, even in the same editor session.
    const firstUserContent = await prepareAiUserContent({
      getAuthorizationHeader,
      userId: 'first-user',
      simplifiedProjectJson,
      projectSpecificExtensionsSummaryJson: null,
    });
    const secondUserContent = await prepareAiUserContent({
      getAuthorizationHeader,
      userId: 'second-user',
      simplifiedProjectJson,
      projectSpecificExtensionsSummaryJson: null,
    });

    expect(firstUserContent.gameProjectJsonUserRelativeKey).toBe(
      'game-project-json/uploaded-by-first-user'
    );
    expect(secondUserContent.gameProjectJsonUserRelativeKey).toBe(
      'game-project-json/uploaded-by-second-user'
    );
    // $FlowFixMe[method-unbinding]
    expect(axios.put).toHaveBeenCalledTimes(2);
  });
});
