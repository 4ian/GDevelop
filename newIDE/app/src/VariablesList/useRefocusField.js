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
    // The effect should only be triggered if fieldToFocus is defined.
    // The list of refs should be up to date when the effect executes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldToFocus]
  );
  return setFieldToFocus;
};

export default useRefocusField;
