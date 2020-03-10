import * as React from 'react';
export const UnsavedChangesContext = React.createContext();

export default class UnsavedChangesContextProvider extends React.Component {
  state = { hasUnsavedChanges: false };
  triggerUnsavedChanges = () => {
    if (!this.state.hasUnsavedChanges)
      this.setState({ hasUnsavedChanges: true });
  };

  sealUnsavedChanges = () => {
    if (this.state.hasUnsavedChanges)
      this.setState({ hasUnsavedChanges: false });
  };

  componentDidUpdate() {
    console.log('context state', this.state);
  }

  render() {
    return (
      <UnsavedChangesContext.Provider
        value={{
          ...this.state,
          triggerUnsavedChanges: this.triggerUnsavedChanges,
          sealUnsavedChanges: this.sealUnsavedChanges,
        }}
      >
        {this.props.children}
      </UnsavedChangesContext.Provider>
    );
  }
}
