// @flow
import { t } from '@lingui/macro';

type CreateBoneLabelElementOptions = {|
  displayName: string,
  canonicalName: string,
  onCopy: (boneName: string) => void,
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
  element.setAttribute('aria-label', t`Copy bone name ${canonicalName}`);
  element.title = t`Click to copy bone name`;

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
