/** @typedef {{state: {name: string, isOverwritingExistingResource: boolean}, setOverwriteExistingResource: () => void}} ExternalEditorHeaderObject */

/**
 * @param {{parentElement: HTMLElement, editorContentDocument: Document, onSaveChanges: () => void, onCancelChanges: () => void, name: string}} options
 * @returns {ExternalEditorHeaderObject}
 */
export const createExternalEditorHeader = ({
  parentElement,
  editorContentDocument,
  onSaveChanges,
  onCancelChanges,
  name,
}) => {
  /** @type {string | null} */
  let existingResourceName = null;
  const state = {
    name,
    isOverwritingExistingResource: false,
  };

  const leftSide = editorContentDocument.createElement('span');
  leftSide.className = 'leftSide';
  parentElement.appendChild(leftSide);

  const overwriteOrNewSelect = editorContentDocument.createElement('select');
  {
    const overwriteOption = document.createElement('option');
    overwriteOption.value = 'overwrite';
    overwriteOption.text = 'Overwrite';
    overwriteOrNewSelect.appendChild(overwriteOption);
  }
  {
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.text = 'New';
    overwriteOrNewSelect.appendChild(newOption);
  }
  leftSide.appendChild(overwriteOrNewSelect);
  overwriteOrNewSelect.addEventListener('change', () => {
    state.isOverwritingExistingResource =
      overwriteOrNewSelect.value === 'overwrite';

    if (state.isOverwritingExistingResource) {
      state.name = existingResourceName;
    }

    update();
  });

  const nameInput = editorContentDocument.createElement('input');
  nameInput.type = 'text';
  nameInput.value = name;
  leftSide.appendChild(nameInput);
  nameInput.addEventListener('input', () => {
    state.name = nameInput.value;
    update();
  });

  const rightButtons = editorContentDocument.createElement('span');
  parentElement.appendChild(rightButtons);
  rightButtons.className = 'rightButtons';

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

  const update = () => {
    nameInput.value = state.name;
    nameInput.disabled = state.isOverwritingExistingResource;
    overwriteOrNewSelect.value = state.isOverwritingExistingResource
      ? 'overwrite'
      : 'new';
    overwriteOrNewSelect.disabled = !existingResourceName;
  };

  update();
  return {
    state,
    setOverwriteExistingResource: () => {
      existingResourceName = name;
      state.isOverwritingExistingResource = true;
      update();
    },
  };
};
