// @flow
import * as React from 'react';
import ListIcon from '../../../UI/ListIcon';
import { type ExtensionMemberKind } from '../../../Utils/Extension/ExtensionChangesToKeep';

const getFunctionIconUrl = (functionType: string | null): string => {
  switch (functionType) {
    case 'Action':
    case 'ActionWithOperator':
      return 'res/functions/action_black.svg';
    case 'Condition':
      return 'res/functions/condition_black.svg';
    case 'Expression':
    case 'StringExpression':
    case 'ExpressionAndCondition':
      return 'res/functions/expression_black.svg';
    default:
      return 'res/functions/function.svg';
  }
};

const getIconUrl = (
  kind: ExtensionMemberKind,
  functionType: string | null
): string => {
  switch (kind) {
    case 'extension-settings':
      return 'res/functions/extension_black.svg';
    case 'function':
      return getFunctionIconUrl(functionType);
    case 'behavior':
      return 'res/functions/behavior_black.svg';
    case 'object':
    case 'object-children':
    default:
      return 'res/functions/object2d_black.svg';
  }
};

const ExtensionMemberIcon = ({
  kind,
  functionType,
  size,
}: {|
  kind: ExtensionMemberKind,
  functionType: string | null,
  size?: number,
|}): React.Node => (
  <ListIcon
    iconSize={size || 20}
    src={getIconUrl(kind, functionType)}
    isGDevelopIcon
    useExactIconSize
    padding={0}
  />
);

export default ExtensionMemberIcon;
