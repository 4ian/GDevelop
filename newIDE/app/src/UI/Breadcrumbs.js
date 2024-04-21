// @flow
import * as React from 'react';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';

import Text from './Text';
import Link from './Link';

type BreadcrumbStep =
  | {| label: React.Node |}
  | {| label: React.Node, onClick: () => void, href: string |};

type Props = {|
  steps: Array<BreadcrumbStep>,
|};

const Breadcrumbs = ({ steps }: Props) => {
  return (
    <MuiBreadcrumbs separator=">" aria-label="breadcrumb">
      {steps.map((step, index) =>
        step.onClick ? (
          <Link
            onClick={step.onClick}
            href={step.href}
            key={`breadcrumb${index}`}
          >
            {step.label}
          </Link>
        ) : (
          <Text key={`breadcrumb${index}`} noMargin>
            {step.label}
          </Text>
        )
      )}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
