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

  headerObject.hideButton = editorContentDocument.createElement('button');
  headerObject.hideButton.textContent = headerObject.state.visible ? '>' : '<';
  parentElement.appendChild(headerObject.hideButton);

  headerObject.saveButton = editorContentDocument.createElement('button');
  headerObject.saveButton.textContent = 'Save';
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
  /**
   * Toggles the path editor
   */
  headerObject.toggle = () => {
    headerObject.state.visible = !headerObject.state.visible;
    render(headerObject);
  };
  headerObject.hideButton.addEventListener('click', () => {
    headerObject.toggle();
    render(headerObject);
  });
  headerObject.cancelButton.addEventListener('click', onCancelChanges);

  /**
   * Disables the path editor
   */
  headerObject.disableNameInput = () => {
    headerObject.nameInput.style.color = '#8bb0b2';
    headerObject.nameInput.style.border = '2px solid black';
    headerObject.nameInput.disabled = true;
  };

  render(headerObject);
  return headerObject;
};

const render = headerObject => {
  const pathEditorVisibility = headerObject.state.visible
    ? 'display:visible'
    : 'display:none;';
  headerObject.rightButtons.style = pathEditorVisibility;
  headerObject.root.style = pathEditorVisibility;

  headerObject.hideButton.textContent = headerObject.state.visible
    ? '>'
    : '...';

  headerObject.hideButton.title = headerObject.state.visible
    ? 'Hide save path options'
    : 'Open save path options';

  headerObject.hideButton.style = headerObject.state.visible
    ? 'opacity: 1; margin-right: 3px;'
    : 'opacity:0.5';

  headerObject.root.parentElement.style = headerObject.state.visible
    ? 'position: relative; display:flex; width:100%'
    : 'position: absolute; display:flex; width:40px; height:40px; right:0';

  headerObject.nameInput.value = headerObject.nameInput.value.replace(
    /[^a-zA-Z0-9_-]/g,
    ''
  ); // Don't allow the user to enter any characters that would lead to an invalid path
  headerObject.state.name = headerObject.nameInput.value;

  headerObject.nameInput.style.width =
    (headerObject.nameInput.value.length + 1) * 10 + 'px';
};