/** @typedef {{state: {name: string}, setIsExistingResource: () => void}} ExternalEditorHeaderObject */

/**
 * @returns {ExternalEditorHeaderObject}
 */
export const createExternalEditorHeader = ({
  parentElement,
  editorContentDocument,
  onSaveChanges,
  onCancelChanges,
  name,
}) => {
  const state = {
    name,
    isExistingResource: false,
  };

  const root = editorContentDocument.createElement('span');
  root.className = 'leftSide';
  parentElement.appendChild(root);

  const rightButtons = editorContentDocument.createElement('span');
  parentElement.appendChild(rightButtons);
  rightButtons.className = 'rightButtons';

  const nameInput = editorContentDocument.createElement('input');
  nameInput.type = 'text';
  nameInput.value = name;
  root.appendChild(nameInput);
  nameInput.addEventListener('input', () => {
    render();
  });

  const saveButton = editorContentDocument.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.className = 'primary';
  rightButtons.appendChild(saveButton);
  saveButton.addEventListener('click', () => {
    onSaveChanges();
  });

  const cancelButton = editorContentDocument.createElement('button');
  cancelButton.textContent = 'Cancel';
  rightButtons.appendChild(cancelButton);
  cancelButton.addEventListener('click', onCancelChanges);

  const duplicateButton = editorContentDocument.createElement('button');
  duplicateButton.textContent = 'Duplicate';
  rightButtons.appendChild(duplicateButton);
  duplicateButton.addEventListener('click', () => {
    state.isExistingResource = false;
    render();
  });

  const render = () => {
    state.name = nameInput.value;
    nameInput.disabled = state.isExistingResource;
  };

  render();
  return {
    state,
    setIsExistingResource: () => {
      state.isExistingResource = true;
      render();
    },
  };
};
