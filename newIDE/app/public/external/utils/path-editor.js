export const createPathEditorHeader = ({
  parentElement,
  editorContentDocument,
  onSaveToGd,
  onCancelChanges,
  projectPath,
  initialResourcePath,
  extension,
  name,
}) => {
  const headerObject = {
    state: {
      name: name,
      visible: true,
    },
  };

  const state = headerObject.state;
  headerObject.root = editorContentDocument.createElement('span');
  headerObject.root.className = 'leftSide';
  parentElement.appendChild(headerObject.root);

  headerObject.rightButtons = editorContentDocument.createElement('span');
  parentElement.appendChild(headerObject.rightButtons);
  headerObject.rightButtons.className = 'rightButtons';

  // create the dom elements of the ui
  headerObject.nameInput = editorContentDocument.createElement('input');
  headerObject.nameInput.type = 'text';
  headerObject.nameInput.value = state.name;
  headerObject.root.appendChild(headerObject.nameInput);

  headerObject.saveButton = editorContentDocument.createElement('button');
  headerObject.saveButton.textContent = 'Save';
  headerObject.saveButton.className = 'primary';
  headerObject.rightButtons.appendChild(headerObject.saveButton);

  headerObject.cancelButton = editorContentDocument.createElement('button');
  headerObject.cancelButton.textContent = 'Cancel';
  headerObject.rightButtons.appendChild(headerObject.cancelButton);

  // From here on we hook the dom with the imported or local methods via event listeners
  headerObject.nameInput.addEventListener('input', () => {
    render(headerObject);
  });
  headerObject.saveButton.addEventListener('click', () => {
    onSaveToGd(headerObject);
  });
  headerObject.cancelButton.addEventListener('click', onCancelChanges);

  /**
   * Disables the path editor
   */
  headerObject.disableNameInput = () => {
    headerObject.nameInput.disabled = true;
  };

  render(headerObject);
  return headerObject;
};

const render = headerObject => {
  headerObject.state.name = headerObject.nameInput.value;
};