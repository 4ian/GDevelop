// @flow

export const getDeprecatedBehaviorsInformation = (
  t: string => string,
): { [string]: {| warning: string |} } => ({
  'PhysicsBehavior::PhysicsBehavior': {
    warning: t(
      'A new physics engine (Physics Engine 2.0) is now available. You should prefer using it for new game. For existing games, note that the two behaviors are not compatible, so you should only use one of them with your objects.'
    ),
  },
});

export const getDeprecatedInstructionInformation = (
  t: string => string,
  type: string
): ?{| warning: string |} => {
  if (type.indexOf('PhysicsBehavior::') === 0) {
    return {
      warning: t(
        `This action is deprecated and should not be used anymore. Instead,
  use for all your objects the behavior called "Physics2" and the
  associated actions (in this case, all objects must be set up to use
  Physics2, you can't mix the behaviors).`
      ),
    };
  }

  return null;
};
