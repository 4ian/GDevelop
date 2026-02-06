// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { LineStackLayout } from '../UI/Layout';
import RedemptionCodeIcon from '../UI/CustomSvgIcons/RedemptionCode';
import Text from '../UI/Text';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
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
} from '../Profile/Subscription/PlanSmallCard';
import { formatDurationOfRedemptionCode } from './Utils';

type Props = {|
  onClose: () => void,
  onSelectCode?: (code: string) => void,
|};

const RedemptionCodesDialog = ({ onClose, onSelectCode }: Props) => {
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
              {onSelectCode && <TableHeaderColumn />}
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
                      {formatDurationOfRedemptionCode(code.durationInDays)}
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
                  {onSelectCode && (
                    <TableRowColumn>
                      {code.remainingUsageCount > 0 && (
                        <RaisedButton
                          label={<Trans>Use</Trans>}
                          primary
                          onClick={() => onSelectCode(code.code)}
                        />
                      )}
                    </TableRowColumn>
                  )}
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
