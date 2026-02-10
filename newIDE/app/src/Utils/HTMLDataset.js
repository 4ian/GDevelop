// @flow

import { toKebabCase } from './StringHelpers';

export type HTMLDataset = {| [key: string]: ?string |};

// $FlowFixMe[signature-verification-failure]
export const dataObjectToProps = (object: ?HTMLDataset) =>
  object
    ? Object.entries(object).reduce((acc, [key, value]) => {
        if (value) {
          // $FlowFixMe[prop-missing]
          acc[`data-${toKebabCase(key)}`] = value;
        }
        return acc;
      }, {})
    : undefined;
