// @flow

type CreateBoneLabelElementOptions = {|
  displayName: string,
  canonicalName: string,
  copyAriaLabel: string,
  copyTooltip: string,
  onCopy: (boneName: string) => void,
|};

type ShowBoneJointTooltipOptions = {|
  element: HTMLDivElement,
  displayName: string,
  x: number,
  y: number,
  offset: number,
|};

/**
 * Create a bone label for the CSS2D preview overlay.
 *
 * Only canonical names are copyable. Preview-only synthetic labels are not
 * valid attachment keys and deliberately remain non-interactive.
 */
export const createBoneLabelElement = ({
  displayName,
  canonicalName,
  copyAriaLabel,
  copyTooltip,
  onCopy,
}: CreateBoneLabelElementOptions): HTMLDivElement => {
  const element = document.createElement('div');
  element.textContent = displayName;
  element.setAttribute('translate', 'no');
  element.style.marginLeft = '6px';
  element.style.padding = '2px 5px';
  element.style.border = '1px solid rgba(87, 218, 255, 0.9)';
  element.style.borderRadius = '3px';
  element.style.backgroundColor = 'rgba(15, 20, 28, 0.88)';
  element.style.color = '#ffffff';
  element.style.fontFamily = 'sans-serif';
  element.style.fontSize = '11px';
  element.style.lineHeight = '14px';
  element.style.whiteSpace = 'nowrap';

  if (!canonicalName) {
    element.style.pointerEvents = 'none';
    return element;
  }

  element.style.pointerEvents = 'auto';
  element.style.cursor = 'copy';
  element.style.userSelect = 'none';
  element.tabIndex = 0;
  element.setAttribute('role', 'button');
  element.setAttribute('aria-label', copyAriaLabel);
  element.title = copyTooltip;

  const stopPointerPropagation = (event: Event) => {
    // Keep label interactions from manipulating the orbit controls behind it.
    event.stopPropagation();
  };
  const copyBoneName = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    onCopy(canonicalName);
  };
  element.addEventListener('pointerdown', stopPointerPropagation);
  element.addEventListener('mousedown', stopPointerPropagation);
  element.addEventListener('click', copyBoneName);
  element.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') copyBoneName(event);
  });

  return element;
};

export const createBoneJointTooltipElement = (): HTMLDivElement => {
  const element = document.createElement('div');
  element.setAttribute('role', 'tooltip');
  element.setAttribute('translate', 'no');
  element.style.position = 'absolute';
  element.style.zIndex = '3';
  element.style.display = 'none';
  element.style.padding = '4px 7px';
  element.style.border = '1px solid rgba(87, 218, 255, 0.9)';
  element.style.borderRadius = '3px';
  element.style.backgroundColor = 'rgba(15, 20, 28, 0.96)';
  element.style.color = '#ffffff';
  element.style.fontFamily = 'sans-serif';
  element.style.fontSize = '12px';
  element.style.lineHeight = '16px';
  element.style.whiteSpace = 'nowrap';
  element.style.pointerEvents = 'none';
  element.style.transform = 'translate(-50%, -100%)';
  return element;
};

export const showBoneJointTooltip = ({
  element,
  displayName,
  x,
  y,
  offset,
}: ShowBoneJointTooltipOptions) => {
  const parentWidth = element.parentElement
    ? element.parentElement.clientWidth
    : 0;
  let translateX = '-50%';
  if (parentWidth > 0 && x < parentWidth / 4) {
    translateX = '0';
  } else if (parentWidth > 0 && x > (parentWidth * 3) / 4) {
    translateX = '-100%';
  }
  const showBelowJoint = y - offset < 24;
  element.textContent = displayName;
  element.style.left = `${x}px`;
  element.style.top = `${showBelowJoint ? y + offset : y - offset}px`;
  element.style.transform = `translate(${translateX}, ${
    showBelowJoint ? '0' : '-100%'
  })`;
  element.style.display = 'block';
};

export const hideBoneJointTooltip = (element: HTMLDivElement) => {
  element.style.display = 'none';
};
