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

const UnsavedChangesContext: React$Context<UnsavedChanges> = React.createContext<UnsavedChanges>(
  initialState
);

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
  state: State = { hasUnsavedChanges: false };
  triggerUnsavedChanges: () => void = (): void => {
    if (!this.state.hasUnsavedChanges)
      this.setState({ hasUnsavedChanges: true });
  };

  sealUnsavedChanges: () => void = (): void => {
    if (this.state.hasUnsavedChanges)
      this.setState({ hasUnsavedChanges: false });
  };

  render(): React.Node {
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
