// @flow

type Props = {| useCumulatedValue: boolean |};

export const useSoftKeyboardBottomOffset = (props?: Props): number => {
  return 0;
};

/**
 * Helper for avoiding the soft keyboard. See also `.avoid-soft-keyboard`.
 */
export const getAvoidSoftKeyboardStyle = (
  softKeyboardBottomOffset: number
): { transform: string, transition: string, willChange: string } => {
  return {
    transform: `translateY(0px)`,
    transition: 'transform 0.2s linear',
    willChange: 'transform',
  };
};
