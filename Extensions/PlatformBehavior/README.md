# Platformer Extension technical documentation

## Floor following

### Horizontal search

When the character walks on a platform, he must follow its slope.
The `slopeMaxAngle` property is used to calculate how much the character can move vertically to follow it.
If the platform is too high, the platform is considered to be an obstacle and the character will stop before it.

When there is no obstacle detected by the horizontal search, the movement is done in 1 step and the vertical search is done at the new `x` position.

[![RequestedDeltaX](./diagrams/SlopeFollowingRequestedDeltaX.png)](./diagrams/SlopeFollowingRequestedDeltaX.svgz)

Otherwise, when there is a junction, 2 vertical searches are done:

- one before a potential obstacle (in pink)
- one at the end of the movement

[![RequestedDeltaX](./diagrams/SlopeFollowingClimbFactor.png)](./diagrams/SlopeFollowingClimbFactor.svgz)

This allows to calculate the right slope angle. Indeed, in one step, the angle could appear lower (the dotted line).
Which means that the character could climb it during 1 frame and then stop.

[![RequestedDeltaX](./diagrams/SlopeFollowingClimbFactorMean.png)](./diagrams/SlopeFollowingClimbFactorMean.svgz)

For further details on the implementation, please take a look at the comments in:
- the function `gdjs.PlatformerObjectRuntimeBehavior._moveX`
- the function `gdjs.PlatformerObjectRuntimeBehavior.OnFloor.beforeMovingY`

### Vertical search

The aim of the vertical search is to find the highest platform where the character can land.
There are 2 constraints:

- `allowedMinDeltaY` how much the character can go upward
- `allowedMaxDeltaY` how much the character can go downward

During the search, these 2 constraints can tighten around the character.
If they become incompatible, it means that the character can't go through the hole,
it will go back to its original position and lose its speed.

There are also more obvious obstacles that cover the character in the middle and end the search directly.

[![RequestedDeltaX](./diagrams/SlopeFollowingResult.png)](./diagrams/SlopeFollowingResult.svgz)

Obstacles can eventually encompass the character. So platforms edges don't have any collision with character.
To detect such cases, 2 flags are used:

- `foundOverHead` when an edge is over `headMaxY`
- `foundUnderHead` when an edge is under `floorMinY`

[![RequestedDeltaX](./diagrams/SlopeFollowingContext.png)](./diagrams/SlopeFollowingContext.svgz)

For further details on the implementation, please take a look at the comments in:
- the function `gdjs.PlatformerObjectRuntimeBehavior._findHighestFloorAndMoveOnTop`
- the class `gdjs.PlatformerObjectRuntimeBehavior.FollowConstraintContext`
