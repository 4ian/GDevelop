// @flow

import { toKebabCase } from './StringHelpers';

export type HTMLDataset = {| [key: string]: ?string |};

export const dataObjectToProps = (object: ?HTMLDataset): void | {} =>
  object
    ? Object.entries(object).reduce((acc, [key, value]) => {
        if (value) {
          // $FlowFixMe[prop-missing]
          acc[`data-${toKebabCase(key)}`] = value;
        }
        return acc;
      }, {})
    : undefined;
