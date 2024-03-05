// @flow
export const useSoftKeyboardBottomOffset = () => {
  return 0;
};

export const getAvoidSoftKeyboardStyle = (softKeyboardBottomOffset: number) => {
  return {
    transform: `translateY(0px)`,
    transition: 'transform 0.2s linear',
    willChange: 'transform',
  };
};
