// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

import Text from './Text';
import Link from './Link';

type BreadcrumbStep =
  | {| label: MessageDescriptor |}
  | {| label: MessageDescriptor, onClick: () => void, href: string |};

type Props = {|
  steps: Array<BreadcrumbStep>,
|};

const Breadcrumbs = ({ steps }: Props) => {
  return (
    <I18n>
      {({ i18n }) => (
        <MuiBreadcrumbs separator=">" aria-label="breadcrumb">
          {steps.map((step, index) =>
            step.onClick ? (
              <Link
                onClick={step.onClick}
                href={step.href}
                key={`breadcrumb${index}`}
              >
                {i18n._(step.label)}
              </Link>
            ) : (
              <Text key={`breadcrumb${index}`} noMargin>
                {i18n._(step.label)}
              </Text>
            )
          )}
        </MuiBreadcrumbs>
      )}
    </I18n>
  );
};

export default Breadcrumbs;
