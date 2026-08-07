// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../UI/Text';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import { LineStackLayout } from '../../UI/Layout';
import classNames from 'classnames';
import classes from './FunctionCallsGroup.module.css';

type Props = {|
  children: React.Node,
  mode?: 'chat' | 'agent' | 'orchestrator',
|};

export const FunctionCallsGroup = ({
  children,
  mode,
}: Props): React.MixedElement => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isOrchestratorMode = mode === 'orchestrator';

  return (
    <div className={classes.container}>
      {!isOrchestratorMode && (
        <div
          className={classes.header}
          onClick={() => setIsCollapsed(!isCollapsed)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsCollapsed(!isCollapsed);
            }
          }}
        >
          <LineStackLayout noMargin alignItems="center">
            {isCollapsed ? (
              <ChevronArrowRight fontSize="small" />
            ) : (
              <ChevronArrowBottom fontSize="small" />
            )}
            <Text noMargin size="body-small" color="secondary">
              <Trans>Implementation</Trans>
            </Text>
          </LineStackLayout>
        </div>
      )}
      {(isOrchestratorMode || !isCollapsed) && (
        <div
          className={classNames({
            [classes.content]: true,
            [classes.contentIndented]: !isOrchestratorMode,
          })}
        >
          {children}
        </div>
      )}
    </div>
  );
};
