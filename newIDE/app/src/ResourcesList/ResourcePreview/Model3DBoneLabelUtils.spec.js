/**
 * @jest-environment jsdom
 */
// @noflow
import {
  createBoneJointTooltipElement,
  createBoneLabelElement,
  hideBoneJointTooltip,
  showBoneJointTooltip,
} from './Model3DBoneLabelUtils';

describe('Model3DBoneLabelUtils', () => {
  it('copies the canonical bone name on click or keyboard activation', () => {
    const onCopy = jest.fn();
    const element = createBoneLabelElement({
      displayName: 'Hand.Socket',
      canonicalName: 'Hand.Socket',
      copyAriaLabel: 'Copy bone name Hand.Socket',
      copyTooltip: 'Click to copy bone name',
      onCopy,
    });

    expect(element.style.pointerEvents).toBe('auto');
    expect(element.style.cursor).toBe('copy');
    expect(element.tabIndex).toBe(0);
    expect(element.getAttribute('role')).toBe('button');
    expect(element.getAttribute('aria-label')).toBe(
      'Copy bone name Hand.Socket'
    );
    expect(element.title).toBe('Click to copy bone name');
    expect(element.title).not.toBe('[object Object]');

    element.click();
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    element.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    expect(onCopy).toHaveBeenCalledTimes(3);
    expect(onCopy).toHaveBeenNthCalledWith(1, 'Hand.Socket');
    expect(onCopy).toHaveBeenNthCalledWith(2, 'Hand.Socket');
    expect(onCopy).toHaveBeenNthCalledWith(3, 'Hand.Socket');
  });

  it('does not expose a synthetic display label as a copyable bone name', () => {
    const onCopy = jest.fn();
    const element = createBoneLabelElement({
      displayName: 'Bone 3',
      canonicalName: '',
      copyAriaLabel: '',
      copyTooltip: '',
      onCopy,
    });

    expect(element.textContent).toBe('Bone 3');
    expect(element.style.pointerEvents).toBe('none');
    expect(element.getAttribute('role')).toBe(null);
    element.click();
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('stops pointer events from reaching the preview controls', () => {
    const onCopy = jest.fn();
    const parent = document.createElement('div');
    const onParentPointerDown = jest.fn();
    const onParentClick = jest.fn();
    parent.addEventListener('pointerdown', onParentPointerDown);
    parent.addEventListener('click', onParentClick);
    const element = createBoneLabelElement({
      displayName: 'Hand',
      canonicalName: 'Hand',
      copyAriaLabel: 'Copy bone name Hand',
      copyTooltip: 'Click to copy bone name',
      onCopy,
    });
    parent.appendChild(element);

    element.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    element.click();

    expect(onParentPointerDown).not.toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onCopy).toHaveBeenCalledWith('Hand');
  });

  it('shows the complete bone name in a non-interactive tooltip', () => {
    const parent = document.createElement('div');
    Object.defineProperty(parent, 'clientWidth', { value: 400 });
    const element = createBoneJointTooltipElement();
    parent.appendChild(element);
    const fullBoneName = 'mixamorig:RightForeArmTwist.WithSuffix';

    showBoneJointTooltip({
      element,
      displayName: fullBoneName,
      x: 320,
      y: 180,
      offset: 12,
    });

    expect(element.getAttribute('role')).toBe('tooltip');
    expect(element.getAttribute('translate')).toBe('no');
    expect(element.textContent).toBe(fullBoneName);
    expect(element.style.left).toBe('320px');
    expect(element.style.top).toBe('168px');
    expect(element.style.transform).toBe('translate(-100%, -100%)');
    expect(element.style.display).toBe('block');
    expect(element.style.whiteSpace).toBe('nowrap');
    expect(element.style.pointerEvents).toBe('none');

    hideBoneJointTooltip(element);
    expect(element.style.display).toBe('none');

    showBoneJointTooltip({
      element,
      displayName: fullBoneName,
      x: 20,
      y: 20,
      offset: 12,
    });
    expect(element.style.top).toBe('32px');
    expect(element.style.transform).toBe('translate(0, 0)');
  });
});
