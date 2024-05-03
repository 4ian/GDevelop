// @flow
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Popper from '@material-ui/core/Popper';
import muiZIndex from '@material-ui/core/styles/zIndex';
import ButtonBase from '@material-ui/core/ButtonBase';
import { type ExpressionAutocompletion } from '../../../ExpressionAutocompletion';
import Text from '../../../UI/Text';
import ScrollView, { type ScrollViewInterface } from '../../../UI/ScrollView';
import { getVisibleParameterTypes } from './FormatExpressionCall';
import { type ParameterRenderingServiceType } from '../ParameterFieldCommons';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import { Column, Line, Spacer } from '../../../UI/Grid';
import ObjectsRenderingService from '../../../ObjectsRendering/ObjectsRenderingService';
import Paper from '../../../UI/Paper';
import { mapVector } from '../../../Utils/MapFor';
import { Trans } from '@lingui/macro';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import { getVariableTypeToIcon } from '../../../VariablesList/VariableTypeSelector';

const gd: libGDevelop = global.gd;

const defaultTextStyle = {
  // Break words if they are too long to fit on a single line.
  overflow: 'hidden',
  overflowWrap: 'break-word',
};

const autocompletionIconSizeStyle = {
  maxWidth: 16,
  maxHeight: 16,
};

const getTypeToIcon = (type: string) => {
  // Reuse variable icons for property types.
  if (type === 'number') {
    return getVariableTypeToIcon()[gd.Variable.Number];
  } else if (type === 'boolean') {
    return getVariableTypeToIcon()[gd.Variable.Boolean];
  } else {
    return getVariableTypeToIcon()[gd.Variable.String];
  }
};

const AutocompletionIcon = React.memo(({ src }) => {
  const {
    palette: { type: paletteType },
  } = React.useContext(GDevelopThemeContext);

  const shouldInvertGrayScale =
    paletteType === 'dark' &&
    (src.startsWith('data:image/svg+xml') || src.includes('_black'));
  return (
    <img
      src={src}
      alt=""
      style={{
        ...autocompletionIconSizeStyle,
        filter: shouldInvertGrayScale ? 'grayscale(1) invert(1)' : undefined,
      }}
    />
  );
});

const formatParameterTypesString = (
  parameterRenderingService: ParameterRenderingServiceType,
  i18n: I18nType,
  enumeratedExpressionMetadata: EnumeratedInstructionOrExpressionMetadata
) => {
  return getVisibleParameterTypes(enumeratedExpressionMetadata)
    .map(type => {
      const userFriendlyName = parameterRenderingService.getUserFriendlyTypeName(
        type
      );

      return userFriendlyName ? i18n._(userFriendlyName) : type;
    })
    .join(', ');
};

const AutocompletionRow = React.forwardRef(
  (
    {
      icon,
      iconSrc,
      label,
      parametersLabel,
      isSelected,
      onClick,
    }: {|
      icon: React.Node | null,
      iconSrc: string | null,
      label: string,
      parametersLabel: string | null,
      isSelected: boolean,
      onClick: () => void,
    |},
    ref
  ) => {
    const trimmedLabel = label.length > 46 ? label.substr(0, 46) + '…' : label;

    return (
      <ButtonBase
        style={styles.button}
        onPointerDown={e =>
          // Prevent default behavior that gives the focus to the button and makes
          // the field lose focus, hence closing the autocompletion displayer.
          e.preventDefault()
        }
        onClick={onClick}
        ref={ref}
      >
        {icon || (iconSrc ? <AutocompletionIcon src={iconSrc} /> : null)}
        <Spacer />
        <Text style={defaultTextStyle} noMargin align="left">
          {isSelected ? <b>{trimmedLabel}</b> : trimmedLabel}
          {parametersLabel && (
            <>
              (<i>{parametersLabel}</i>)
            </>
          )}
        </Text>
      </ButtonBase>
    );
  }
);

const isParameterVisible = (
  expressionMetadata: gdExpressionMetadata,
  parameterIndex: number
): boolean => {
  const parameter = expressionMetadata.getParameter(parameterIndex);
  return (
    !parameter.isCodeOnly() &&
    // This filters parameters that are implicit because of the context
    // (MyObject.MyBehavior::).
    // Free functions have an instanceContainer as first parameter,
    // their first object parameter are kept.
    (parameterIndex !== 0 || parameter.getType() !== 'object') &&
    (parameterIndex !== 1 || parameter.getType() !== 'behavior')
  );
};

type ExpressionDocumentationProps = {|
  expressionMetadata: gdExpressionMetadata,
  i18n: I18nType,
  parameterRenderingService: ParameterRenderingServiceType,
|};

const ExpressionDocumentation = ({
  expressionMetadata,
  i18n,
  parameterRenderingService,
}: ExpressionDocumentationProps) => {
  return (
    <Column noMargin>
      <Text style={defaultTextStyle} size="body2">
        {expressionMetadata.getDescription()}
      </Text>
      {mapVector(
        expressionMetadata.getParameters(),
        (parameter, parameterIndex) =>
          isParameterVisible(expressionMetadata, parameterIndex) && (
            <Text style={defaultTextStyle} size="body2" key={parameterIndex}>
              <i>
                {i18n._(
                  parameterRenderingService.getUserFriendlyTypeName(
                    parameter.getType()
                  )
                )}
              </i>
              {' － ' + parameter.getDescription()}
            </Text>
          )
      )}
    </Column>
  );
};

type Props = {|
  project: ?gdProject,
  expressionAutocompletions: Array<ExpressionAutocompletion>,
  remainingCount: number,
  selectedCompletionIndex: number,
  anchorEl: Element,
  onChoose: (chosenExpressionAutocompletion: ExpressionAutocompletion) => void,
  onScroll: () => void,
  parameterRenderingService: ParameterRenderingServiceType,
|};

const styles = {
  container: {
    width: 370,
    maxHeight: 150,
    display: 'flex',
    overflowX: 'hidden',
  },
  button: {
    width: '100%',
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'flex-start',
  },
  tooManyTextContainer: {
    width: '100%',
  },
  popperStyle: {
    // Ensure the popper is above everything (modal, dialog, snackbar, tooltips, etc).
    // There will be only one ExpressionAutocompletionsDisplay opened at a time, so it's fair to put the
    // highest z index. If this is breaking, check the z-index of material-ui.
    zIndex: muiZIndex.tooltip + 100,
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
};

export default function ExpressionAutocompletionsDisplayer({
  project,
  expressionAutocompletions,
  remainingCount,
  selectedCompletionIndex,
  anchorEl,
  onChoose,
  onScroll,
  parameterRenderingService,
}: Props) {
  const scrollView = React.useRef((null: ?ScrollViewInterface));
  const selectedAutocompletionElement = React.useRef(
    (null: ?React$Component<any, any>)
  );
  React.useEffect(
    () => {
      if (scrollView.current && selectedAutocompletionElement.current) {
        scrollView.current.scrollTo(selectedAutocompletionElement.current);
      }
    },
    [scrollView, selectedAutocompletionElement, selectedCompletionIndex]
  );

  if (expressionAutocompletions.length === 0) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <Popper
          style={styles.popperStyle}
          open
          anchorEl={anchorEl}
          placement="bottom-start"
          disablePortal={
            // We can use a portal to display this component, because even if it
            // used inside a modal, which has a focus trap, it's entirely
            // controlled by the parent component.
            false
          }
        >
          <Paper
            variant="outlined"
            square
            style={styles.container}
            background="light"
          >
            <ScrollView ref={scrollView} onScroll={onScroll}>
              {expressionAutocompletions.map(
                (expressionAutocompletion, index) => {
                  const isSelected = selectedCompletionIndex === index;
                  const ref = isSelected
                    ? selectedAutocompletionElement
                    : undefined;

                  const parametersLabel = expressionAutocompletion.enumeratedExpressionMetadata
                    ? formatParameterTypesString(
                        parameterRenderingService,
                        i18n,
                        expressionAutocompletion.enumeratedExpressionMetadata
                      )
                    : null;

                  const label = expressionAutocompletion.completion;
                  const iconSrc =
                    expressionAutocompletion.kind === 'Expression'
                      ? expressionAutocompletion.enumeratedExpressionMetadata
                          .iconFilename
                      : expressionAutocompletion.kind === 'Object'
                      ? project && expressionAutocompletion.objectConfiguration
                        ? ObjectsRenderingService.getThumbnail(
                            project,
                            expressionAutocompletion.objectConfiguration
                          )
                        : 'res/types/object.png'
                      : expressionAutocompletion.kind === 'Behavior'
                      ? project && expressionAutocompletion.behaviorType
                        ? gd.MetadataProvider.getBehaviorMetadata(
                            project.getCurrentPlatform(),
                            expressionAutocompletion.behaviorType
                          ).getIconFilename()
                        : 'res/types/behavior.png'
                      : null;

                  const IconComponent =
                    expressionAutocompletion.kind === 'Variable'
                      ? getVariableTypeToIcon()[
                          expressionAutocompletion.variableType
                        ]
                      : expressionAutocompletion.kind === 'Property'
                      ? getTypeToIcon(
                          gd.ValueTypeMetadata.getPrimitiveValueType(
                            gd.ValueTypeMetadata.convertPropertyTypeToValueType(
                              expressionAutocompletion.propertyType
                            )
                          )
                        )
                      : expressionAutocompletion.kind === 'Parameter'
                      ? getTypeToIcon(
                          gd.ValueTypeMetadata.getPrimitiveValueType(
                            expressionAutocompletion.parameterType
                          )
                        )
                      : null;
                  const icon = IconComponent ? (
                    <IconComponent style={autocompletionIconSizeStyle} />
                  ) : null;

                  if (expressionAutocompletion.kind === 'Expression') {
                    if (expressionAutocompletion.isExact) return null;
                  }

                  return (
                    <AutocompletionRow
                      key={index}
                      icon={icon}
                      iconSrc={iconSrc}
                      label={label}
                      parametersLabel={parametersLabel}
                      onClick={() => onChoose(expressionAutocompletion)}
                      isSelected={isSelected}
                      ref={ref}
                    />
                  );
                }
              )}
              {remainingCount > 0 && (
                <Column justifyContent="flex-start">
                  <Text>
                    <Trans>And others...</Trans>
                  </Text>
                </Column>
              )}
            </ScrollView>
          </Paper>
          {selectedCompletionIndex !== null &&
            expressionAutocompletions[selectedCompletionIndex].kind ===
              'Expression' &&
            !expressionAutocompletions[selectedCompletionIndex].isExact && (
              <Paper
                variant="outlined"
                square
                style={styles.container}
                background="light"
              >
                <ScrollView autoHideScrollbar>
                  <Column>
                    <Line noMargin expand alignItems="center">
                      <ExpressionDocumentation
                        expressionMetadata={
                          expressionAutocompletions[selectedCompletionIndex]
                            .enumeratedExpressionMetadata.metadata
                        }
                        i18n={i18n}
                        parameterRenderingService={parameterRenderingService}
                      />
                    </Line>
                  </Column>
                </ScrollView>
              </Paper>
            )}
        </Popper>
      )}
    </I18n>
  );
}
