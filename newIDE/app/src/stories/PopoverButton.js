// @flow
import * as React from 'react';

type ChildrenProps = {| buttonElement: ?HTMLElement, onClose: () => void |};

type Props = {|
  children: (childrenProps: ChildrenProps) => React.Node,
|};

// $FlowFixMe[signature-verification-failure]
export function PopoverButton({ children }: Props) {
  const [buttonElement, setButtonElement] = React.useState(
    (null: ?HTMLElement)
  );

  return (
    <React.Fragment>
      <button
        onClick={event => {
          setButtonElement(event.target);
        }}
      >
        Click to open
      </button>
      {buttonElement &&
        children({
          buttonElement,
          onClose: () => setButtonElement(null),
        })}
    </React.Fragment>
  );
}
