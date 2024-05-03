// @flow
import * as React from 'react';

type Props = {|
  onSubmit: () => void | Promise<void>,
  autoComplete?: 'on' | 'off',
  name: string,
  children: React.Node,
  fullWidth?: boolean,
|};

const Form = ({
  onSubmit,
  autoComplete = 'off', // Default to 'off' to avoid browser autofill.
  name,
  children,
  fullWidth,
}: Props) => {
  return (
    <form
      onSubmit={event => {
        // Prevent browser to navigate on form submission.
        event.preventDefault();
        onSubmit();
      }}
      autoComplete={autoComplete}
      name={name}
      style={{ width: fullWidth ? '100%' : undefined }}
    >
      {children}
      {/*
        This input is needed so that the browser submits the form when
        Enter key is pressed. See https://stackoverflow.com/questions/4196681/form-not-submitting-when-pressing-enter
      */}
      <input type="submit" value="Submit" style={{ display: 'none' }} />
    </form>
  );
};

export default Form;
