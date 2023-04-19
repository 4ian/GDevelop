// @flow
import React from 'react';

const useRefocusField = (fieldRefs: {|
  current: {|
    [identifier: number]: {|
      +focus: (?{| caretPosition: ?('end' | number) |}) => void,
    |},
  |},
|}) => {
  const [fieldToFocus, setFieldToFocus] = React.useState<?{
    identifier: number,
    caretPosition?: ?number,
  }>(null);

  React.useEffect(
    () => {
      if (fieldToFocus) {
        const fieldRef = fieldRefs.current[fieldToFocus.identifier];
        if (fieldRef) {
          fieldRef.focus({ caretPosition: fieldToFocus.caretPosition });
          setFieldToFocus(null);
        }
      }
    },
    // The fieldRefs is a reference, hence it does not need to be added as a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldToFocus]
  );
  return setFieldToFocus;
};

export default useRefocusField;
