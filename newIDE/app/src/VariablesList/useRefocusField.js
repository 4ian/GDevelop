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
    [fieldToFocus, fieldRefs]
  );
  return setFieldToFocus;
};

export default useRefocusField;
