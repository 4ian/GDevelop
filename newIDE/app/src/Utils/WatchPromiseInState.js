// @flow
import React from 'react';

export const watchPromiseInState = (
  component: React.Component<*, *>,
  stateField: string,
  fn: () => Promise<any>
) => {
  component.setState({
    [stateField]: true,
  });
  return fn()
    .then(value => {
      component.setState({
        [stateField]: false,
      });
      return value;
    })
    .catch(err => {
      component.setState({
        [stateField]: false,
      });
      throw err;
    });
};
