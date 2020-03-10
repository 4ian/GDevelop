import * as React from 'react';
export const UnsavedChangesContext = React.createContext();

export default class UnsavedChangesContextProvider extends React.Component {
  state = { hasUnsavedChanges: false };
  toggleUnsavedChanges: () => {};

  render() {
    return (
      <UnsavedChangesContext.Provider value={{ ...this.state }}>
        {this.props.children}
      </UnsavedChangesContext.Provider>
    );
  }
}
