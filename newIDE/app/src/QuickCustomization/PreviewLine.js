// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import FlatButton from '../UI/FlatButton';
import { LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';
import { Column } from '../UI/Grid';
import Paper from '../UI/Paper';
import PlaySquared from '../UI/CustomSvgIcons/PlaySquared';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import classes from './PreviewLine.module.css';
import classNames from 'classnames';

type Props = {|
  onLaunchPreview: () => Promise<void>,
|};

const PreviewLine = ({ onLaunchPreview }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <Column noMargin>
      <Paper background="light">
        <div
          className={classNames({
            [classes.previewLine]: true,
          })}
        >
          <Column>
            <LineStackLayout
              alignItems="center"
              justifyContent="space-between"
              expand
            >
              <LineStackLayout
                noMargin
                alignItems="center"
                justifyContent="center"
              >
                <PlaySquared htmlColor={gdevelopTheme.message.valid} />
                <Text noMargin size="body">
                  <Trans>Preview your game</Trans>
                </Text>
              </LineStackLayout>
              <FlatButton
                primary
                label={<Trans>Preview</Trans>}
                onClick={onLaunchPreview}
                leftIcon={<PreviewIcon />}
              />
            </LineStackLayout>
          </Column>
        </div>
      </Paper>
    </Column>
  );
};

export default PreviewLine;
