// @flow
import * as React from 'react';
import TextButton from '../TextButton';
import Window from '../../Utils/Window';
import { getHelpLink } from '../../Utils/HelpLink';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import HelpIcon from '../HelpIcon';
import Help from '../CustomSvgIcons/Help';

type PropsType = {
  helpPagePath: ?string,
  label?: React.Node,
  anchor?: string,
  scopeName?: MessageDescriptor,
};

/**
 * The button that can be used in any dialog to open a help page
 */
const HelpButton = (props: PropsType): null | React.Node => {
  const { isMobile } = useResponsiveWindowSize();
  if (!props.helpPagePath) return null;
  const helpLink = getHelpLink(props.helpPagePath, props.anchor);
  if (!helpLink) return null;

  const onClick = () => {
    if (props.helpPagePath) {
      Window.openExternalURL(helpLink);
    }
  };

  return !isMobile ? (
    <I18n>
      {({ i18n }) => {
        const scopeName = props.scopeName ? i18n._(props.scopeName) : null;
        return (
          <TextButton
            onClick={onClick}
            target="_blank"
            label={
              props.label ||
              (scopeName ? <Trans>See {scopeName}</Trans> : <Trans>Help</Trans>)
            }
            icon={<Help />}
          />
        );
      }}
    </I18n>
  ) : (
    <HelpIcon size="small" helpPagePath={props.helpPagePath} />
  );
};

export default HelpButton;
