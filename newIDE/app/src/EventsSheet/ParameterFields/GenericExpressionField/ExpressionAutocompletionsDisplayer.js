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

const defaultTextStyle = {
  // Break words if they are too long to fit on a single line.
  overflow: 'hidden',
  overflowWrap: 'break-word',
};

const AutocompletionIcon = React.memo(({ src }) => (
  <img
    alt=""
    src={src}
    style={{
      maxWidth: 16,
      maxHeight: 16,
    }}
  />
));

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

const DisplayedTextAutocompletion = React.forwardRef(
  (
    {
      expressionAutocompletion,
      isSelected,
      onClick,
    }: {|
      expressionAutocompletion: ExpressionAutocompletion,
      isSelected: boolean,
      onClick: () => void,
    |},
    ref
  ) => (
    <ButtonBase
      style={styles.button}
      onPointerDown={() => {
        // Trigger the onClick on the mouse/touch down
        // to avoid the blur event of the text field to discard the autocompletions.
        onClick();
      }}
      ref={ref}
    >
      <Text style={defaultTextStyle} noMargin align="left">
        {isSelected ? (
          <b>{expressionAutocompletion.completion}</b>
        ) : (
          expressionAutocompletion.completion
        )}
      </Text>
    </ButtonBase>
  )
);

const DisplayedExpressionAutocompletion = React.forwardRef(
  (
    {
      expressionAutocompletion,
      isSelected,
      onClick,
      i18n,
      parameterRenderingService,
    }: {|
      expressionAutocompletion: ExpressionAutocompletion,
      isSelected: boolean,
      onClick: () => void,
      i18n: I18nType,
      parameterRenderingService: ParameterRenderingServiceType,
    |},
    ref
  ) => {
    if (!expressionAutocompletion.enumeratedExpressionMetadata) return null;

    const title = isSelected ? (
      <b>{expressionAutocompletion.completion}</b>
    ) : (
      expressionAutocompletion.completion
    );

    return (
      <ButtonBase
        style={styles.button}
        onPointerDown={() => {
          // Trigger the onClick on the mouse/touch down
          // to avoid the blur event of the text field to discard the autocompletions.
          onClick();
        }}
        ref={ref}
      >
        <AutocompletionIcon
          src={
            expressionAutocompletion.enumeratedExpressionMetadata.iconFilename
          }
        />
        <Spacer />
        <Text style={defaultTextStyle} noMargin align="left">
          {title}(
          <i>
            {formatParameterTypesString(
              parameterRenderingService,
              i18n,
              expressionAutocompletion.enumeratedExpressionMetadata
            )}
          </i>
          )
        </Text>
      </ButtonBase>
    );
  }
);

const DisplayedObjectAutocompletion = React.forwardRef(
  (
    {
      project,
      expressionAutocompletion,
      isSelected,
      onClick,
    }: {|
      project: ?gdProject,
      expressionAutocompletion: ExpressionAutocompletion,
      isSelected: boolean,
      onClick: () => void,
    |},
    ref
  ) => {
    const thumbnail =
      project && expressionAutocompletion.object
        ? ObjectsRenderingService.getThumbnail(
            project,
            expressionAutocompletion.object.getConfiguration()
          )
        : 'res/types/object.png';

    const title = isSelected ? (
      <b>{expressionAutocompletion.completion}</b>
    ) : (
      expressionAutocompletion.completion
    );

    return (
      <ButtonBase
        style={styles.button}
        onPointerDown={() => {
          // Trigger the onClick on the mouse/touch down
          // to avoid the blur event of the text field to discard the autocompletions.
          onClick();
        }}
        ref={ref}
      >
        <AutocompletionIcon src={thumbnail} />
        <Spacer />
        <Text style={defaultTextStyle} noMargin align="left">
          {title}
        </Text>
      </ButtonBase>
    );
  }
);

const DisplayedBehaviorAutocompletion = React.forwardRef(
  (
    {
      expressionAutocompletion,
      isSelected,
      onClick,
    }: {|
      expressionAutocompletion: ExpressionAutocompletion,
      isSelected: boolean,
      onClick: () => void,
    |},
    ref
  ) => {
    const title = isSelected ? (
      <b>{expressionAutocompletion.completion}</b>
    ) : (
      expressionAutocompletion.completion
    );
    return (
      <ButtonBase
        style={styles.button}
        onPointerDown={() => {
          // Trigger the onClick on the mouse/touch down
          // to avoid the blur event of the text field to discard the autocompletions.
          onClick();
        }}
        ref={ref}
      >
        <AutocompletionIcon src={'res/types/behavior.png'} />
        <Spacer />
        <Text style={defaultTextStyle} noMargin align="left">
          {title}
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
            <Text style={defaultTextStyle} size="body2">
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

                  return expressionAutocompletion.kind === 'Text' ||
                    expressionAutocompletion.kind === 'FullExpression' ||
                    expressionAutocompletion.kind === 'Variable' ? (
                    <DisplayedTextAutocompletion
                      key={index}
                      expressionAutocompletion={expressionAutocompletion}
                      isSelected={isSelected}
                      onClick={() => onChoose(expressionAutocompletion)}
                      ref={ref}
                    />
                  ) : expressionAutocompletion.kind === 'Expression' ? (
                    !expressionAutocompletion.isExact && (
                      <DisplayedExpressionAutocompletion
                        key={index}
                        expressionAutocompletion={expressionAutocompletion}
                        onClick={() => onChoose(expressionAutocompletion)}
                        isSelected={isSelected}
                        i18n={i18n}
                        parameterRenderingService={parameterRenderingService}
                        ref={ref}
                      />
                    )
                  ) : expressionAutocompletion.kind === 'Object' ? (
                    <DisplayedObjectAutocompletion
                      key={index}
                      project={project}
                      expressionAutocompletion={expressionAutocompletion}
                      onClick={() => onChoose(expressionAutocompletion)}
                      isSelected={isSelected}
                      ref={ref}
                    />
                  ) : expressionAutocompletion.kind === 'Behavior' ? (
                    <DisplayedBehaviorAutocompletion
                      key={index}
                      expressionAutocompletion={expressionAutocompletion}
                      onClick={() => onChoose(expressionAutocompletion)}
                      isSelected={isSelected}
                      ref={ref}
                    />
                  ) : null;
                }
              )}
              {remainingCount > 0 && (
                <Column justifyContent="flex-start">
                  <Text>And others...</Text>
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
