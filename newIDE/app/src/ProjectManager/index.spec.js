// @flow
import { getGameRootTreeViewItemDescription } from './GameRootTreeViewItem';

const i18n = ({
  _: message => (typeof message === 'string' ? message : message.id),
}: any);

describe('ProjectManager game root item', () => {
  it('shows the project label and creates a new game from its add button', () => {
    const onCreateProject = jest.fn<[], void>();
    const description = getGameRootTreeViewItemDescription(
      i18n,
      onCreateProject
    );

    expect(description.label).toBe('Project');

    const createNewGameButton = description.rightButton;
    expect(createNewGameButton.id).toBe('create-new-game-button');
    expect(createNewGameButton.label).toBe('Create New Game');

    if (createNewGameButton.click) createNewGameButton.click();
    expect(onCreateProject).toHaveBeenCalledTimes(1);
  });
});
