// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Container from '@material-ui/core/Container';
import { ColumnStackLayout } from './Layout';
import { LineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import { Column, Line, LargeSpacer } from './Grid';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import TutorialButton from './TutorialButton';
import CircularProgress from './CircularProgress';
import Add from './CustomSvgIcons/Add';

type Props = {|
  title: React.Node,
  description: React.Node,
  helpPagePath?: string,
  tutorialId?: string,
  isLoading?: boolean,
  actionButtonId?: string,
  actionLabel: React.Node,
  actionIcon?: React.Node,
  onAction: () => void,
  secondaryActionLabel?: React.Node,
  secondaryActionIcon?: React.Node,
  onSecondaryAction?: () => void,
|};

const DefaultHelpButton = ({ helpPagePath }: { helpPagePath?: string }) => (
  <HelpButton label={<Trans>Read the doc</Trans>} helpPagePath={helpPagePath} />
);

/**
 * A placeholder for when there is no content to display.
 * Also take a look at EmptyMessage for a less visible message.
 */
export const EmptyPlaceholder = (props: Props) => (
  <Column alignItems="center">
    <Container
      style={{
        maxWidth: '480px',
        whiteSpace: 'normal',
      }}
    >
      <Column>
        <Text size="block-title" align="center">
          {props.title}
        </Text>
        <Text align="center" noMargin>
          {props.description}
        </Text>
        <LargeSpacer />
        <ColumnStackLayout alignItems="center" noMargin>
          <LineStackLayout noMargin>
            {props.secondaryActionLabel && props.onSecondaryAction && (
              <FlatButton
                label={props.secondaryActionLabel}
                primary
                onClick={props.onSecondaryAction}
                disabled={!!props.isLoading}
                leftIcon={props.secondaryActionIcon}
              />
            )}
            <RaisedButton
              label={props.actionLabel}
              primary
              onClick={props.onAction}
              disabled={!!props.isLoading}
              icon={
                props.isLoading ? (
                  <CircularProgress size={24} />
                ) : props.actionIcon ? (
                  props.actionIcon
                ) : (
                  <Add />
                )
              }
              id={props.actionButtonId}
            />
          </LineStackLayout>
          {props.tutorialId ? (
            <TutorialButton
              tutorialId={props.tutorialId}
              label={<Trans>Watch tutorial</Trans>}
              renderIfNotFound={
                <DefaultHelpButton helpPagePath={props.helpPagePath} />
              }
            />
          ) : (
            <DefaultHelpButton helpPagePath={props.helpPagePath} />
          )}
        </ColumnStackLayout>
      </Column>
    </Container>
  </Column>
);
