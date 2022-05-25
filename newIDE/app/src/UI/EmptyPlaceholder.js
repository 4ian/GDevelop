// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Container from '@material-ui/core/Container';
import { CircularProgress } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import { ColumnStackLayout } from './Layout';
import RaisedButton from '../UI/RaisedButton';
import { Column, LargeSpacer } from './Grid';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import TutorialButton from './TutorialButton';

type Props = {|
  title: React.Node,
  description: React.Node,
  actionLabel: React.Node,
  helpPagePath?: string,
  tutorialId?: string,
  actionButtonId?: string,
  onAdd: () => void,
  isLoading?: boolean,
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
        <Text size="title" align="center">
          {props.title}
        </Text>
        <Text align="center" noMargin>
          {props.description}
        </Text>
        <LargeSpacer />
        <ColumnStackLayout alignItems="center" noMargin>
          <RaisedButton
            label={props.actionLabel}
            primary
            onClick={props.onAdd}
            disabled={!!props.isLoading}
            icon={props.isLoading ? <CircularProgress size={24} /> : <Add />}
            id={props.actionButtonId}
          />
          {props.tutorialId ? (
            <TutorialButton
              tutorialId={props.tutorialId}
              label="Watch tutorial"
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
