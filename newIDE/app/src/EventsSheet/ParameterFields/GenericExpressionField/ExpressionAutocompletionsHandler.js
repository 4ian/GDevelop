// @flow
import { type ExpressionAutocompletion } from '../../../ExpressionAutocompletion';
import {
  shouldCloseOrCancel,
  shouldValidate,
  shouldFocusNextField,
} from '../../../UI/KeyboardShortcuts/InteractionKeys';
import ListIcon from '../../../UI/ListIcon';
import SvgIcon from '@material-ui/core/SvgIcon';
import { type MessageDescriptor } from '../../../Utils/i18n/MessageDescriptor.flow';

export type AutocompletionAction = {
  id: string,
  translatableValue: MessageDescriptor,
  // $FlowFixMe[prop-missing]
  renderIcon: () => React.Element<typeof ListIcon | typeof SvgIcon>,
  onClick: () => void,
};

export type AutocompletionsState = {|
  autocompletions: Array<ExpressionAutocompletion>,
  additionalActions: Array<AutocompletionAction>,
  selectedCompletionIndex: number,
  renderEverything: boolean,
|};

export const getAutocompletionsInitialState = (): AutocompletionsState => {
  return {
    autocompletions: [],
    additionalActions: [],
    selectedCompletionIndex: 0,
    // By default, only render some completions.
    // This is to avoid rendering a lot (100+) completions,
    // risking a lag/frame drops, just for them to be discarded afterwards,
    // at each keystroke of the user.
    renderEverything: false,
  };
};

/**
 * The number of completions to be displayed in the DOM by default
 * when no scroll or key press is made. This allows to quickly display only
 * a few completions (fast rendering), and render everything only when
 * the user starts to explore them.
 */
const DEFAULT_RENDERED_COUNT = 7;

export const getNonRenderedCount = (state: AutocompletionsState): number => {
  if (state.renderEverything) return 0;

  return Math.max(0, state.autocompletions.length - DEFAULT_RENDERED_COUNT);
};

export const getRenderedAutocompletions = (
  state: AutocompletionsState
): Array<ExpressionAutocompletion> => {
  const nonRenderedCount = getNonRenderedCount(state);
  return nonRenderedCount === 0
    ? state.autocompletions
    : state.autocompletions.slice(0, DEFAULT_RENDERED_COUNT);
};

export const setNewAutocompletions = (
  state: AutocompletionsState,
  autocompletions: Array<ExpressionAutocompletion>,
  additionalActions: Array<AutocompletionAction> = []
): AutocompletionsState => {
  const completionsChanged =
    state.autocompletions.length !== autocompletions.length;

  // Reset the selected completion only if completions changed.
  const selectedCompletionIndex = completionsChanged
    ? 0
    : state.selectedCompletionIndex;

  return {
    autocompletions,
    additionalActions,
    selectedCompletionIndex,
    renderEverything: completionsChanged ? false : state.renderEverything,
  };
};

export const handleAutocompletionsScroll = (
  state: AutocompletionsState
): AutocompletionsState => {
  // If there is a scroll, we need to render all the completions.
  return {
    ...state,
    renderEverything: true,
  };
};

export const handleAutocompletionsKeyDown = (
  state: AutocompletionsState,
  {
    event,
    onUpdateAutocompletions,
    onInsertAutocompletion,
  }: {|
    event: SyntheticKeyboardEvent<>,
    onUpdateAutocompletions: () => void,
    onInsertAutocompletion: ExpressionAutocompletion => void,
  |}
): AutocompletionsState => {
  if (
    event.key === 'ArrowDown' ||
    event.key === 'ArrowUp' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight'
  ) {
    onUpdateAutocompletions();
  }

  const length = state.autocompletions.length + state.additionalActions.length;

  if (length === 0) return state;

  if (event.key === 'ArrowDown') {
    event.preventDefault();

    return {
      ...state,
      // If there is a browsing in the autocompletions,
      // we need to render all the completions.
      renderEverything: true,
      selectedCompletionIndex: (state.selectedCompletionIndex + 1) % length,
    };
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();

    return {
      ...state,
      // If there is a browsing in the autocompletions,
      // we need to render all the completions.
      renderEverything: true,
      selectedCompletionIndex:
        (length + state.selectedCompletionIndex - 1) % length,
    };
  } else if (shouldCloseOrCancel(event)) {
    // Stop propagation to avoid closing the modal the
    // field is contained in.
    event.preventDefault();
    event.stopPropagation();

    return getAutocompletionsInitialState();
  } else if (shouldValidate(event) || shouldFocusNextField(event)) {
    const autocompletion = state.autocompletions[state.selectedCompletionIndex];
    if (autocompletion) {
      // Don't prevent the default behavior when an exact completion is shown,
      // the user should be able to freely move to the next line.
      if (autocompletion.isExact) return state;
      onInsertAutocompletion(autocompletion);

      // Stop propagation to avoid closing the modal the
      // field is contained in.
      event.stopPropagation();
    }

    // Avoid entering a new line or tabbing to the next field.
    event.preventDefault();
  }

  return state;
};
