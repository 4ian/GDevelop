// @flow
import * as React from 'react';
import { mapFor } from '../../Utils/MapFor';
import { type VariableDeclarationContext } from '../SelectionHandler';
import { type ScreenType } from '../../UI/Responsive/ScreenTypeMeasurer';
import { type WindowSizeType } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { VariableDeclaration } from './VariableDeclaration';

type Props = {|
  variablesContainer: gdVariablesContainer,
  onVariableDeclarationClick: VariableDeclarationContext => void,
  onVariableDeclarationDoubleClick: VariableDeclarationContext => void,
  className?: string,
  style?: Object,
  disabled: boolean,

  screenType: ScreenType,
  windowSize: WindowSizeType,

  idPrefix: string,
|};

export default function VariableDeclarationsList({
  variablesContainer,
  onVariableDeclarationClick,
  onVariableDeclarationDoubleClick,
  className,
  style,
  disabled,
  screenType,
  windowSize,
  idPrefix,
}: Props) {
  const instructions = mapFor(0, variablesContainer.count(), i => {
    const variable = variablesContainer.getAt(i);
    const variableName = variablesContainer.getNameAt(i);
    const variableDeclarationContext = {
      variablesContainer,
      variableName,
    };

    return (
      <VariableDeclaration
        variableName={variableName}
        variable={variable}
        key={variable.ptr}
        onClick={() => onVariableDeclarationClick(variableDeclarationContext)}
        onDoubleClick={() =>
          onVariableDeclarationDoubleClick(variableDeclarationContext)
        }
        selected={false}
        disabled={disabled}
        screenType={screenType}
        windowSize={windowSize}
        id={`${idPrefix}-variable-${i}`}
      />
    );
  });

  return (
    <div className={className} style={style} id={`${idPrefix}-variables`}>
      {instructions}
    </div>
  );
}
