// @flow
import axios from 'axios';
import { GDevelopUserApi } from './ApiConfigs';
import { getIDEVersionWithHash } from '../../Version';

export const submitQuestion = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    questionText,
  }: {|
    userId: string,
    questionText: string,
  |}
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopUserApi.baseUrl}/question`,
    {
      questionText,
      editorVersionWithHash: getIDEVersionWithHash(),
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};
