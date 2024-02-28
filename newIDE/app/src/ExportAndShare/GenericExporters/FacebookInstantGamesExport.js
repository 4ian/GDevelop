// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Text from '../../UI/Text';
import { Column, Line } from '../../UI/Grid';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Facebook from '../../UI/CustomSvgIcons/Facebook';
import { useResponsiveWindowSize } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import Help from '../../UI/CustomSvgIcons/Help';
import Check from '../../UI/CustomSvgIcons/Check';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import { type ExportFlowProps } from '../ExportPipeline.flow';

const getIconStyle = ({ isMobile }: {| isMobile: boolean |}) => {
  return {
    height: isMobile ? 30 : 48,
    width: isMobile ? 30 : 48,
    margin: 10,
  };
};

export const ExplanationHeader = () => {
  const { isMobile } = useResponsiveWindowSize();
  const iconStyle = getIconStyle({ isMobile });

  return (
    <Column noMargin>
      <Line>
        <Text>
          <Trans>
            Prepare your game for Facebook Instant Games so that it can be play
            on Facebook Messenger. GDevelop will create a compressed file that
            you can upload on your Facebook Developer account.
          </Trans>
        </Text>
      </Line>
      <Line justifyContent="center">
        <Facebook color="secondary" style={iconStyle} />
      </Line>
    </Column>
  );
};

type FacebookInstantGamesExportFlowProps = {|
  ...ExportFlowProps,
  exportPipelineName: string,
|};

export const ExportFlow = ({
  disabled,
  launchExport,
  isExporting,
  exportPipelineName,
}: FacebookInstantGamesExportFlowProps) => (
  <Line justifyContent="center">
    <RaisedButton
      label={
        !isExporting ? (
          <Trans>Package game files</Trans>
        ) : (
          <Trans>Packaging...</Trans>
        )
      }
      primary
      id={`launch-export-${exportPipelineName}-button`}
      onClick={launchExport}
      disabled={disabled || isExporting}
    />
  </Line>
);

export const DoneFooter = ({
  renderGameButton,
}: {|
  renderGameButton: () => React.Node,
|}) => {
  const openLearnMore = () => {
    Window.openExternalURL(
      getHelpLink('/publishing/publishing-to-facebook-instant-games')
    );
  };

  return (
    <Column noMargin alignItems="center">
      <LineStackLayout noMargin justifyContent="center" alignItems="center">
        <Check fontSize="small" />
        <Text>
          <Trans>Done!</Trans>
        </Text>
      </LineStackLayout>
      <Text>
        <Trans>
          You can now create a game on Facebook Instant Games, if not already
          done, and upload the generated archive.
        </Trans>
      </Text>
      <ColumnStackLayout justifyContent="center">
        <Line justifyContent="center">{renderGameButton()}</Line>
        <FlatButton
          label={<Trans>Learn more about Instant Games publication</Trans>}
          primary
          onClick={openLearnMore}
          leftIcon={<Help />}
        />
      </ColumnStackLayout>
    </Column>
  );
};

export const facebookInstantGamesExporter = {
  key: 'facebookinstantgamesexport',
  tabName: <Trans>Instant Games</Trans>,
  name: <Trans>Facebook Instant Games</Trans>,
  helpPage: '/publishing/publishing-to-facebook-instant-games',
};
