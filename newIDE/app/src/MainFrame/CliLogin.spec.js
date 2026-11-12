// @flow
import { getCliLoginForm } from './CliLogin';

describe('CliLogin', () => {
  it('gives the account set in the environment', () => {
    expect(
      getCliLoginForm({
        GDEVELOP_CLI_EMAIL: ' test@example.com ',
        GDEVELOP_CLI_PASSWORD: ' pass word ',
      })
    ).toEqual({ email: 'test@example.com', password: ' pass word ' });
  });

  it('gives nothing without both the email and the password', () => {
    expect(getCliLoginForm({})).toBe(null);
    expect(getCliLoginForm({ GDEVELOP_CLI_EMAIL: 'test@example.com' })).toBe(
      null
    );
    expect(
      getCliLoginForm({ GDEVELOP_CLI_EMAIL: '', GDEVELOP_CLI_PASSWORD: 'p' })
    ).toBe(null);
  });
});
