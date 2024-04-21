// @flow
import * as React from 'react';
import TextButton from '../TextButton';
import Window from '../../Utils/Window';
import { getHelpLink } from '../../Utils/HelpLink';
import { Trans } from '@lingui/macro';
import { useResponsiveWindowSize } from '../Responsive/ResponsiveWindowMeasurer';
import HelpIcon from '../HelpIcon';
import Help from '../CustomSvgIcons/Help';

type PropsType = {
  helpPagePath: ?string,
  label?: React.Node,
  anchor?: string,
};

/**
 * The button that can be used in any dialog to open a help page
 */
const HelpButton = (props: PropsType) => {
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
    <TextButton
      onClick={onClick}
      target="_blank"
      label={props.label || <Trans>Help</Trans>}
      icon={<Help />}
    />
  ) : (
    <HelpIcon size="small" helpPagePath={props.helpPagePath} />
  );
};

export default HelpButton;
