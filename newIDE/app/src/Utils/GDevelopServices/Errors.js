// @flow
import { type $AxiosError } from 'axios';

export type ExtractedErrorStatusAndCode = {|
  status: number,
  code: ?string,
|};

/**
 * Given any error, check if the error is an error thrown by Axios, if it contains a response from the server,
 * and if so, try to get the HTTP status and the code returned by the GDevelop API.
 * If the error is not an axios error or does not contain a response, `null` is returned.
 */
export const extractGDevelopApiErrorStatusAndCode = (
  error: Error | $AxiosError<any> | null
): ?ExtractedErrorStatusAndCode => {
  if (!error) return null;
  if (typeof error != 'object') return null;

  if (
    // Ensure a response was received
    typeof error.response === 'object' &&
    error.response &&
    // Ensure status exists (https://axios-http.com/docs/handling_errors)
    typeof error.response.status === 'number'
  ) {
    return {
      status: error.response.status,
      code:
        // Ensure data exists (https://axios-http.com/docs/handling_errors)
        typeof error.response.data === 'object' &&
        error.response.data &&
        typeof error.response.data.code === 'string'
          ? error.response.data.code
          : null,
    };
  }

  return null;
};
