/**
 * Return the help page for the given behavior
 * @param {*} behavior
 */
export const getBehaviorHelpPagePath = behavior => {
  if (!behavior) return null;

  switch (behavior.getTypeName()) {
    case 'DraggableBehavior::Draggable':
      return '/behaviors/draggable';
    case 'PlatformBehavior::PlatformerObjectBehavior':
      return '/behaviors/platformer';
    case 'PlatformBehavior::PlatformBehavior':
      return '/behaviors/platformer';
    default:
      return '';
  }
};
