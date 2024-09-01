// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import Paper from '../../../../UI/Paper';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import TextField from '../../../../UI/TextField';
import RaisedButton from '../../../../UI/RaisedButton';
import Add from '../../../../UI/CustomSvgIcons/Add';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import CircularProgress from '../../../../UI/CircularProgress';

const styles = { container: { padding: 24 }, mobileContainer: { padding: 8 } };

type Props = {|
  onCreateStudentAccounts: (quantity: number) => Promise<void>,
  availableSeats: number,
  isCreatingMembers: boolean,
|};

const StudentCreationCard = ({
  availableSeats,
  onCreateStudentAccounts,
  isCreatingMembers,
}: Props) => {
  const [quantity, setQuantity] = React.useState<string>(
    availableSeats.toString()
  );
  const [creationError, setCreationError] = React.useState<React.Node>(null);
  const { isMobile } = useResponsiveWindowSize();
  const quantityAsNumber = parseInt(quantity, 10);

  const onCreateAccounts = React.useCallback(
    async () => {
      if (
        !quantityAsNumber ||
        quantityAsNumber > availableSeats ||
        quantityAsNumber <= 0
      ) {
        return;
      }
      setCreationError(null);
      try {
        await onCreateStudentAccounts(quantityAsNumber);
      } catch (error) {
        console.error(
          'An error occurred while batch creating member accounts:',
          error
        );
        setCreationError(
          <>
            <Trans>An error occurred while creating the accounts.</Trans>{' '}
            <Trans>
              Please check your internet connection or try again later.
            </Trans>
          </>
        );
      }
    },
    [quantityAsNumber, onCreateStudentAccounts, availableSeats]
  );

  return (
    <Paper
      style={isMobile ? styles.mobileContainer : styles.container}
      variant="outlined"
      background="medium"
    >
      <ColumnStackLayout>
        <Text size="block-title" noMargin>
          <Trans>You don't have any students yet.</Trans>
        </Text>
        <Text noMargin>
          <Trans>Start by creating their accounts</Trans>
        </Text>
        {isCreatingMembers ? (
          <LineStackLayout alignItems="center">
            <CircularProgress size={10} />
            <Text style={{ opacity: 0.7 }} noMargin>
              <Trans>Generating your student’s accounts...</Trans>
            </Text>
          </LineStackLayout>
        ) : (
          <LineStackLayout noMargin alignItems="center">
            <TextField
              type="number"
              min={0}
              value={quantity}
              onChange={(e, newQuantity) => setQuantity(newQuantity)}
              translatableHintText={t`Number of students`}
              errorText={creationError}
            />
            <RaisedButton
              primary
              disabled={!quantityAsNumber || quantityAsNumber > availableSeats}
              icon={<Add fontSize="small" />}
              label={
                isMobile ? (
                  <Trans>Create</Trans>
                ) : (
                  <Trans>Create accounts</Trans>
                )
              }
              onClick={onCreateAccounts}
            />
          </LineStackLayout>
        )}
      </ColumnStackLayout>
    </Paper>
  );
};

export default StudentCreationCard;
