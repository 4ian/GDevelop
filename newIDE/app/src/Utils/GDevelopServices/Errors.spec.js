// @flow
import { extractGDevelopApiErrorStatusAndCode } from './Errors';

describe('Errors', () => {
  test('Can extract status and code from a GDevelop API error', () => {
    // $FlowExpectedError - faking error objects to test the function resilience.
    expect(extractGDevelopApiErrorStatusAndCode(undefined)).toEqual(null);
    expect(
      extractGDevelopApiErrorStatusAndCode(new Error('Generic error'))
    ).toEqual(null);
    // $FlowExpectedError - faking error objects to test the function resilience.
    expect(extractGDevelopApiErrorStatusAndCode({})).toEqual(null);
    // $FlowExpectedError - faking error objects to test the function resilience.
    expect(extractGDevelopApiErrorStatusAndCode({ response: null })).toEqual(
      null
    );
    // $FlowExpectedError - faking error objects to test the function resilience.
    expect(extractGDevelopApiErrorStatusAndCode({ response: {} })).toEqual(
      null
    );
    expect(
      // $FlowExpectedError - faking error objects to test the function resilience.
      extractGDevelopApiErrorStatusAndCode({ response: { status: 'wrong' } })
    ).toEqual(null);
    expect(
      // $FlowExpectedError - faking error objects to test the function resilience.
      extractGDevelopApiErrorStatusAndCode({ response: { status: 400 } })
    ).toEqual({ status: 400, code: null });
    expect(
      // $FlowExpectedError - faking error objects to test the function resilience.
      extractGDevelopApiErrorStatusAndCode({
        response: { status: 400, data: null },
      })
    ).toEqual({ status: 400, code: null });
    expect(
      // $FlowExpectedError - faking error objects to test the function resilience.
      extractGDevelopApiErrorStatusAndCode({
        response: { status: 400, data: {} },
      })
    ).toEqual({ status: 400, code: null });
    expect(
      // $FlowExpectedError - faking error objects to test the function resilience.
      extractGDevelopApiErrorStatusAndCode({
        response: { status: 400, data: { code: 0xbad } },
      })
    ).toEqual({ status: 400, code: null });
    expect(
      // $FlowExpectedError - faking error objects to test the function resilience.
      extractGDevelopApiErrorStatusAndCode({
        response: { status: 400, data: { code: 'code/of-the-error' } },
      })
    ).toEqual({ status: 400, code: 'code/of-the-error' });
  });
});
