// @flow
import * as React from 'react';

export type UnsavedChanges = {|
  hasUnsavedChanges: boolean,
  sealUnsavedChanges: () => void,
  triggerUnsavedChanges: () => void,
|};

const UnsavedChangesContext = React.createContext<UnsavedChanges>();

export default UnsavedChangesContext;

export class UnsavedChangesContextProvider extends React.Component {
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
    const initialContextValues: UnsavedChanges = {
      ...this.state,
      triggerUnsavedChanges: this.triggerUnsavedChanges,
      sealUnsavedChanges: this.sealUnsavedChanges,
    };

    return (
      <UnsavedChangesContext.Provider
        value={{
          ...initialContextValues,
        }}
      >
        {this.props.children}
      </UnsavedChangesContext.Provider>
    );
  }
}
