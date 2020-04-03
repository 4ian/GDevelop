// @flow
import * as React from 'react';

export type UnsavedChanges = {|
  hasUnsavedChanges: boolean,
  sealUnsavedChanges: () => void,
  triggerUnsavedChanges: () => void,
|};

const initialState: UnsavedChanges = {
  hasUnsavedChanges: false,
  sealUnsavedChanges: () => {},
  triggerUnsavedChanges: () => {},
};

const UnsavedChangesContext = React.createContext<UnsavedChanges>(initialState);

export default UnsavedChangesContext;

type State = {|
  hasUnsavedChanges: boolean,
|};

type Props = {|
  children?: React.Node,
|};

export class UnsavedChangesContextProvider extends React.Component<
  Props,
  State
> {
  state = { hasUnsavedChanges: false };
  triggerUnsavedChanges = (): void => {
    if (!this.state.hasUnsavedChanges)
      this.setState({ hasUnsavedChanges: true });
  };

  sealUnsavedChanges = (): void => {
    if (this.state.hasUnsavedChanges)
      this.setState({ hasUnsavedChanges: false });
  };

  render() {
    const unsavedChanges: UnsavedChanges = {
      ...this.state,
      triggerUnsavedChanges: this.triggerUnsavedChanges,
      sealUnsavedChanges: this.sealUnsavedChanges,
    };

    return (
      <UnsavedChangesContext.Provider value={unsavedChanges}>
        {this.props.children}
      </UnsavedChangesContext.Provider>
    );
  }
}
