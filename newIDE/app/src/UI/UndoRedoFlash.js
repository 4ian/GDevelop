// @flow
import './UndoRedoFlash.css';

const flashClassName = 'undo-redo-property-flash';
const flashDurationInMs = 1600; // Same as in `UndoRedoFlash.css`.

/**
 * Play the flash animation of an element, restarting it if needed.
 * The class is removed once played: a CSS animation starts again every
 * time its element is displayed again (like when coming back to a tab).
 */
export const flashElement = (element: HTMLElement) => {
  element.classList.remove(flashClassName);
  void element.offsetWidth; // Reflow, so that re-adding the class restarts the animation.
  element.classList.add(flashClassName);

  const removeFlash = () => {
    element.classList.remove(flashClassName);
    element.removeEventListener('animationend', removeFlash);
  };
  element.addEventListener('animationend', removeFlash);
  // `animationend` is not fired for an element hidden in the meantime.
  setTimeout(removeFlash, flashDurationInMs + 100);
};
