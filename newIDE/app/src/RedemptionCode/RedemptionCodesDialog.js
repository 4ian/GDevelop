// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { LineStackLayout } from '../UI/Layout';
import RedemptionCodeIcon from '../UI/CustomSvgIcons/RedemptionCode';
import Text from '../UI/Text';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import {
  getRedemptionCodes,
  type RedemptionCode,
} from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';
import {
  getPlanIcon,
  getPlanInferredNameFromId,
} from '../Profile/Subscription/PlanCard';
import AlertMessage from '../UI/AlertMessage';

type Props = {|
  onClose: () => void,
|};

const RedemptionCodesDialog = ({ onClose }: Props) => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const [
    redemptionCodes,
    setRedemptionCodes,
  ] = React.useState<?Array<RedemptionCode>>(null);

  React.useEffect(
    () => {
      if (!profile) {
        return;
      }

      const fetchRedemptionCodes = async () => {
        const codes = await getRedemptionCodes(
          getAuthorizationHeader,
          profile.id
        );
        setRedemptionCodes(codes);
      };
      fetchRedemptionCodes();
    },
    [profile, getAuthorizationHeader]
  );

  if (!profile) {
    return null; // Should not be able to open this dialog without a profile.
  }

  return (
    <Dialog
      title={<Trans>Redemption Codes</Trans>}
      maxWidth="md"
      open
      onRequestClose={onClose}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          onClick={onClose}
          id="close-button"
          fullWidth
          primary
        />,
      ]}
      flexColumnBody
    >
      <AlertMessage kind="info">
        <Trans>
          To use a code, go to your profile in the subscription section!
        </Trans>
      </AlertMessage>
      <LineStackLayout>
        {<RedemptionCodeIcon />}
        <Text size="sub-title">
          <Trans>Here are your redemption codes:</Trans>
        </Text>
      </LineStackLayout>
      {!redemptionCodes ? (
        <PlaceholderLoader />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>
                <Trans>Code</Trans>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Trans>Subscription Plan</Trans>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Trans>Duration</Trans>
              </TableHeaderColumn>
              <TableHeaderColumn>
                <Trans>Remaining usage</Trans>
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redemptionCodes.map(code => {
              const planId = code.givenSubscriptionPlanId;
              return (
                <TableRow key={code.code}>
                  <TableRowColumn>
                    <Text noMargin allowSelection>
                      {code.code}
                    </Text>
                  </TableRowColumn>
                  <TableRowColumn>
                    {planId && (
                      <LineStackLayout noMargin alignItems="center">
                        {getPlanIcon({
                          planId,
                          logoSize: 20,
                        })}
                        <Text>{getPlanInferredNameFromId(planId)}</Text>
                      </LineStackLayout>
                    )}
                  </TableRowColumn>
                  <TableRowColumn>
                    <Text>
                      <Trans>
                        {Math.round(code.durationInDays / 30)} months
                      </Trans>
                    </Text>
                  </TableRowColumn>
                  <TableRowColumn>
                    <Text>
                      {code.remainingUsageCount ? (
                        code.remainingUsageCount === 1 ? (
                          <Trans>{code.remainingUsageCount} use left</Trans>
                        ) : (
                          <Trans>{code.remainingUsageCount} uses left</Trans>
                        )
                      ) : (
                        <Trans>No uses left</Trans>
                      )}
                    </Text>
                  </TableRowColumn>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Dialog>
  );
};

export default RedemptionCodesDialog;
