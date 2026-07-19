/**
 * @jest-environment jsdom
 */
// @noflow
import { createBoneLabelElement } from './Model3DBoneLabelUtils';

describe('Model3DBoneLabelUtils', () => {
  it('copies the canonical bone name on click or keyboard activation', () => {
    const onCopy = jest.fn();
    const element = createBoneLabelElement({
      displayName: 'Hand.Socket',
      canonicalName: 'Hand.Socket',
      onCopy,
    });

    expect(element.style.pointerEvents).toBe('auto');
    expect(element.style.cursor).toBe('copy');
    expect(element.tabIndex).toBe(0);
    expect(element.getAttribute('role')).toBe('button');

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
      onCopy,
    });
    parent.appendChild(element);

    element.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    element.click();

    expect(onParentPointerDown).not.toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onCopy).toHaveBeenCalledWith('Hand');
  });
});
