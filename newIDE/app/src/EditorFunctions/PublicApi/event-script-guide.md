One construction per line, nesting by indentation (2 spaces, no tabs). Conditions and actions are `InternalName(arg1, arg2)` calls with only the VISIBLE parameters (skip hidden parameters like "currentScene"). String literals are double-quoted (`"Hello"`); numbers, expressions, operators (`>=`, `+`), object/variable/behavior names and resource names are bare. Trailing optional parameters can be omitted; leave a non-trailing parameter empty by writing nothing between commas. Events run top to bottom, EVERY frame (~60 FPS). Conditions both decide IF the actions run AND pick WHICH object instances the actions affect.

Basics — conditions, instance picking, sub-events, else, trigger once:

```
# `#` = comment. An event header ends with `:`, its body is indented.
if CollisionNP(Player, Coin) and once:      # conditions pick the colliding instances; `once` = Trigger Once (don't re-fire every frame)
  PlaySound(pickup.aac, no, 100, 1)         # resource names bare; yesorno parameter: yes/no
  SetNumberVariable(Score, +, 10)           # scene/global variable: bare name. Value operators: = + - * / (strings: = +; booleans: True/False/Toggle)
  Delete(Coin)                              # only the picked (colliding) Coin is deleted
  if NumberVariable(Score, >=, 100):        # indented event = sub-event: runs only if parent ran, inherits its picked instances
    Show(WinText)                           # + Hide(Obj). Legacy aliases exist ("Montre"=Show, "Cache"=Hide, "MettreX"=SetX...): both work
else if NumberVariable(Lives, >, 0):        # `else`/`else if` = previous event's conditions were NOT met (picking is not carried over)
  SetNumberVariable(Lives, -, 1)
else:
  Scene("GameOver", no)                     # scene names are strings
always:                                     # no conditions: runs every frame, on ALL instances
  SetX(Player, +, 200 * TimeDelta())        # per-frame numeric change: scale by TimeDelta()
if BooleanVariable(GodMode, True):          # boolean check: ALWAYS pass the value to check (True or False); object variable: BooleanObjectVariable(Player, IsInvincible, True)
  SetBooleanVariable(GodMode, False)        # set a boolean: True/False/Toggle; object variable: SetBooleanObjectVariable(Player, IsInvincible, Toggle)
if StringVariable(GameState, =, "playing"): # string variable check (value = string expression); also SetStringVariable(GameState, =, "paused")
  SetNumberVariable(Inventory.Slots[SelectedSlot].Ammo, -, 1)   # structure/array children: dot access at any depth; [expression] = child by key/index computed at runtime (here from the SelectedSlot variable)
```

Progressive filtering, inversion (`not`), `or`, behaviors:

```
if IsCursorOnObject(Square) and PosX(Square, <, 100):   # each object condition further filters the picked Squares
  Delete(Square)                            # deleted: only the hovered Squares with x < 100
if PosY(Square, >, 800):                    # checking an object value: ALWAYS an object condition (or the behavior's, like Scene3D::Base3DBehavior::Z(Obj, Object3D, <, -150)) - it tests AND picks each instance
  Delete(Square)                            # NEVER `if BuiltinCommonInstructions::CompareNumbers(Square.Y(), >, 800):` - it reads ONE arbitrary Square, picks NOTHING, and the actions would then hit ALL Squares
for each Square:                            # EXCEPTIONAL: no object condition exists for a custom formula - then compare INSIDE a `for each`, so each instance is checked one by one
  if BuiltinCommonInstructions::CompareNumbers(abs(Square.X() - Player.X()) + abs(Square.Y() - Player.Y()), <, 100):   # inside the loop, expressions read THIS Square
    Delete(Square)                          # (whenever an object condition exists, prefer it: it needs no `for each` at all)
if MouseButtonFromTextPressed("Left") and not IsCursorOnObject(RedSquare):
  Rotate(RedSquare, 100)                    # `not` on an object condition picks the instances NOT matching it
if KeyFromTextJustPressed("Space") or HasAnyTouchOrMouseStarted():   # `or` combines conditions (parentheses allowed; `and` binds tighter than `or`)
  PlatformBehavior::SimulateJumpKey(Player, PlatformerObject)        # behavior instruction: object first, then the behavior name on the object
if CollisionNP(Bullet, Shootable):          # `Shootable` = an OBJECT group of the scene (here containing Enemy and Wall), usable wherever an object is. A condition on a group filters EVERY object of the group: when the bullet only hits a Wall, the Enemy list is left EMPTY here and in all the sub-events
  Delete(Bullet)
  if PickedInstancesCount(Wall, >, 0):      # so a `Distance(Enemy, Wall, 200)` or a `for each Enemy` here would run on NO Enemy (nothing happens, silently)
    PickAllInstances(Enemy)                 # `PickAllInstances(Obj)` picks ALL the instances of an object again: needed before filtering the instances of a member the parent left out (splash damage, chain reactions...)
    if Distance(Enemy, Wall, 200):
      Delete(Enemy)
```

Timers — reset in one event, compare in a SEPARATE top-level event. A timer compare is false until the timer was reset; never reset every frame (gate it), never nest the compare under the event that resets it:

```
if SceneInstancesCount(Enemy, =, 0) and once:
  ResetTimer("WinTimer")                    # starts (or restarts) the scene timer - timer names are strings
if CompareTimer("WinTimer", >, 2):
  Scene("Level 8", no)
always:
  TextContainerCapability::TextContainerBehavior::SetValue(CountdownText, Text, =, ToString(TimerElapsedTime("WinTimer")))   # number in a string: wrap with ToString() (never needed for variables)
if CompareObjectTimer(Enemy, "attack", >, 1.5):           # object timers are per-instance (picks the Enemies whose timer exceeds 1.5s)
  ResetObjectTimer(Enemy, "attack")
```

Order matters (events and actions run in order, immediately): read/use an object BEFORE deleting it, and put one-shot consequences in the SAME event (a later event re-checking the condition would not run anymore):

```
if CollisionNP(Player, Enemy) and once:
  Create(Explosion, Player.CenterX(), Player.CenterY(), "")   # read positions BEFORE Delete (afterwards the instance is gone)
  Delete(Player)
  Montre(GameOverText)
  await Wait(2)                             # `await`: the following actions run after this asynchronous action finishes
  Scene("Game Scene", no)
```

Loops — repeat (N times within one frame), for each instance, while; local variables:

```
if SceneJustBegins():                           # "at the beginning of the scene"
  local number Spacing = 120                # typed local (number/string/boolean/array/structure), scoped to this whole
  repeat 5 times index I:                   # event (even its own conditions) and its sub-events. `index I` = loop counter local (starts at 0)
    Create(Coin, 100 + I * Spacing, RandomInRange(200, 300), "")   # last param = layer name ("" = base layer). The created instance is picked: following actions of the event affect it
if CollisionNP(Player, KillAllBonus):
  SetNumberObjectVariable(Enemy, Life, =, 0)              # object variable of ALL Enemy instances (none picked yet here)
  for each Enemy if NumberObjectVariable(Enemy, Life, =, 0):  # per-instance loop; optional `if` clause = conditions of the loop. Usually NOT needed:
    Create(Explosion, Enemy.CenterX(), Enemy.CenterY(), "")   # a normal event already acts on all picked instances - loop only for per-instance positions/expressions.
for each Enemy order by Enemy.Distance(Player) asc limit 3 index ClosestIndex:
  SetNumberObjectVariable(Enemy, Rank, =, ClosestIndex + 1)   # `once` is NOT per-instance in a for each: use object variables
while NumberVariable(Energy, >, 0):         # repeats without interruption while true (in-frame algorithms only)
  SetNumberVariable(Energy, -, 1)
for each child in Fruits value FruitColor key FruitName:    # iterate a structure/array variable's children
  local string FruitName = ""               # declare the iterator locals first in the body
  local string FruitColor = ""
  TextContainerCapability::TextContainerBehavior::SetValue(FruitsText, Text, +, FruitName + ": " + FruitColor + NewLine())
```

Organization — groups (contain only events), comments, links, disabled events, empty bodies, forces:

```
group "Enemies logic":
  comment "Deal contact damage."            # comment event (no `:`)
  if CollisionNP(Player, Enemy):
    SetNumberObjectVariable(Player, Health, -, Enemy.Power)   # `Enemy.Power` = object variable in an expression
  disabled always:                          # `disabled ` prefix disables an event
    AddForceXY(Player, 100, 0, 0)           # last arg: 0 = instant force (re-add every frame), 1 = permanent (add once, gate with `once`)
  if CollisionNP(Player, Spike):
    pass                                    # `pass` = event with no actions (yet): makes explicit that the next non-indented line is a SEPARATE event
link "MyExternalEvents"                     # link event (no `:`)
```

Inside a function of an extension (custom behavior, custom object or free function: `generate_events` with a `scope` and a `function_name`) there is no scene - the events only see what the function receives. Parameters, properties and extension variables are bare identifiers, like scene variables (a property or an extension variable can be changed, a parameter is read-only); `Object` = the object the behavior is attached to (behavior function) or the custom object itself (object function); `Behavior` = this behavior on `Object`; a property of type Behavior names a required behavior of `Object`; the child objects of a custom object are used by name. Nothing is declared automatically there: an unknown identifier must first be declared as a parameter of the function, a property of the behavior/object, an extension variable (`add_or_edit_variable` with a scope of type `extension`) or a local variable. Private functions of the same extension can be called. Resources come from parameters and properties of resource types (bare names). A function whose `isAsync` setting is on is an asynchronous action (callers can `await` it): its events must run `BuiltinAsync::ResolveAsyncEventsFunction()` once its work is done, or its awaiting callers never resume. The first line of these examples names the function they are written in:

```
# in function TankConfiguration::TankHealth.Hit   (a function of the custom behavior TankHealth: `Damage` is its parameter)
if NumberVariable(Health, >, 0):                    # `Health`, `MaxHealth` = properties of the behavior, `Damage` = parameter: all bare identifiers
  SetNumberVariable(Health, -, Damage)              # a property is changed like a variable; a parameter is only read (in expressions)
  SetNumberVariable(TotalHits, +, 1)                # `TotalHits` = a variable of the extension (declared on the extension, never on a scene)
  Flash::Flash::Flash(Object, FlashOnHit, 0.5)      # `Object` = the object this behavior is attached to; `FlashOnHit` = a property of type Behavior (a required behavior), used where a behavior name is expected
if NumberVariable(Health, <=, 0):
  SetNumberVariable(Health, =, MaxHealth)
```

```
# in function TankConfiguration::TankHealth.Explode   (an asynchronous function of the behavior: its `isAsync` setting is on, so callers can `await` it)
always:
  Flash::Flash::Flash(Object, FlashOnHit, 0.5)
  await Wait(0.5)
  BuiltinAsync::ResolveAsyncEventsFunction()          # marks the asynchronous function as finished: REQUIRED once its work is done (the awaiting callers resume then)
```

```
# in function TankConfiguration::CombinedTank.onCreated   (a lifecycle function of the custom object CombinedTank)
always:
  SetAngle(TankTop_Combined, =, CannonAngle)                      # child objects of the custom object by name; `CannonAngle` = a property of the object
  SetNumberObjectVariable(TankTop_Combined, Angle, =, CannonAngle) # object variables of a child object work as in a scene
  Create(Smoke_Combined, 0, Object.Height() / 2, "")              # child objects live in the custom object's own space: (0, 0) is the object's position (never Object.X()/Object.Y()); `Object` = the custom object itself
```

```
# in function TankConfiguration::ClampAngle   (a free expression function of the extension: `Angle` is its parameter)
if BuiltinCommonInstructions::CompareNumbers(Angle, >=, 360):
  SetReturnNumber(Angle - 360)                      # SetReturnNumber(expr) / SetReturnString(expr) / SetReturnBoolean(yes) set the value returned by an expression/condition function
else:
  SetReturnNumber(Angle)
```

JavaScript code events - prefer events; use `js` ONLY for what events cannot express (math on arrays or strings, external APIs, direct Three.js/PixiJS access). The header is `js """` or `js(ObjectOrGroup) """`; the body is JavaScript (never EventScript, so `#` is code there) until a line that is exactly `"""`; a `js` event has no sub-events:

```
js """                                              # `runtimeScene` (gdjs.RuntimeScene) is always available in the code
  runtimeScene.getGame().pause(true);
  // JavaScript comments go inside the body
"""
js(Enemy) """                                       # `js(ObjectOrGroup)`: `objects` = the array of picked instances (gdjs.RuntimeObject) of that object
  for (const enemy of objects) enemy.setX(enemy.getX() + 10);
"""
if KeyFromTextJustPressed("Space"):
  js(Player) """                                    # nests like any event: the code is indented with its event
    objects[0].getBehavior("PlatformerObject").simulateJumpKey();
  """
```

Inside the code: `runtimeScene` (`.getGame()`, `.getLayer("UI")`, `.getVariables().get("Score").getAsNumber()`), `objects` (only with `js(Name)`) and, inside a function of an extension, `eventsFunctionContext`: `getArgument("Damage")` (the value of a non-object parameter), `getObjects("Target")` (the instances of an object parameter), `getBehaviorName("Behavior")` (the real behavior name, for `object.getBehavior(...)`), `createObject("Bullet")`, `returnValue = 42` (the result of an expression/condition function), `task` (an asynchronous action ends with `task.resolve()`), `globalVariablesForExtension` / `sceneVariablesForExtension` (the variables of the extension). `await ActionName(...)` is only for asynchronous actions (`Wait`, an asynchronous function of an extension): on any other action it is an error.

Most-used instructions, with their exact signatures (each `behavior` argument = the behavior's name as set on that object; extension behaviors like Tween/Health/Flash/FireBullet/Pathfinding must be added to the object first):

```
if SceneJustBegins():
  ActivateBehavior(Enemy, Flash, no)                      # enable/disable any behavior of an object
  SetXY(Player, =, 100, =, 200)                           # same operator+value pattern: SetX, SetY, SetCenter, SetAngle, SetZOrder, SetWidth, SetHeight
  Opacity(Ghost, =, 128)                                  # Sprite-only opacity action (0=transparent, 255=opaque)
  OpacityCapability::OpacityBehavior::SetValue(Title, Opacity, =, 128)   # opacity for any capable object ("Opacity" = built-in capability behavior)
  ChangeColor(Ghost, "128;128;255")                       # tint a Sprite (multiplies the image colors)
  HideLayer("UI")                                         # + ShowLayer("UI"); condition: LayerVisible("UI")
  ZoomCamera(2)                                           # optional trailing layer + camera arguments omitted
always:
  CenterCameraOnObject(Player)                            # 2D camera follow; camera expressions: CameraX(), CameraY()
  SeparateFromObjects(Player, Wall)                       # push Player out of Wall collision masks ("solid walls" without physics)
if AnimatableCapability::AnimatableBehavior::HasAnimationEnded(Player, Animation):   # "Animation" = capability behavior of sprites/3D models; name condition: ...::Name(Player, Animation, =, "Attack")
  AnimatableCapability::AnimatableBehavior::SetName(Player, Animation, =, "Idle")    # set the animation by name
  FlippableCapability::FlippableBehavior::FlipX(Player, Flippable, yes)              # "Flippable" = capability behavior too
```

```
if KeyFromTextJustPressed("t") or ButtonStates::ButtonFSM::IsClicked(StartButton, ButtonFSM):   # ButtonStates = clickable behavior for any object. "Button" objects: PanelSpriteButton::PanelSpriteButton::IsClicked(MenuButton)
  Tween::TweenBehavior::AddObjectScaleTween3(Chest, Tween, "grow", 2, "easeInOutQuad", 0.5)     # "Tween" behavior: tween id, target value, easing, duration (s)
  Tween::TweenBehavior::AddObjectPositionTween2(Ghost, Tween, "move", 400, 300, "linear", 1)    # also AddObjectOpacityTween2 (to 0-255), AddObjectAngleTween2, AddObjectPositionXTween2/AddObjectPositionYTween2, AddObjectColorTween2 (to "R;G;B")
if Tween::HasFinished(Chest, Tween, "grow"):
  Tween::RemoveTween(Chest, Tween, "grow")
if MouseButtonFromTextReleased("Left"):
  PickNearest(Worker, CursorX(), CursorY())                                       # keep only the instance nearest to the point
  PathfindingBehavior::SetDestination(Worker, Pathfinding, CursorX(), CursorY())  # move avoiding objects that have PathfindingObstacleBehavior
if Distance(Enemy, Player, 300):                          # picks the Enemies closer than 300px from Player
  AddForceTowardObject(Enemy, Player, 80, 0)              # also AddForceAL(Enemy, 45, 80, 0): angle, speed, multiplier
if PlatformBehavior::IsFalling(Player, PlatformerObject): # other platformer conditions: IsOnFloor, IsJumping, IsMoving. Top-down: TopDownMovementBehavior::IsMoving, Simulate(Left/Right/Up/Down)Key
  AnimatableCapability::AnimatableBehavior::SetName(Player, Animation, =, "Fall")
```

```
if CollisionNP(Bullet, Enemy):
  Health::Health::Hit(Enemy, Health, 10)                  # "Health" behavior; also Heal(Enemy, Health, 10); conditions IsDead/IsJustDamaged(Enemy, Health); expressions Enemy.Health::Health(), Enemy.Health::MaxHealth()
  Flash::Flash::Flash(Enemy, Flash, 0.5)                  # blink for 0.5s ("Flash" behavior)
  Delete(Bullet)
if Health::Health::IsDead(Enemy, Health):
  Delete(Enemy)
if KeyFromTextPressed("f"):
  FireBullet::FireBullet::Fire(Player, FireBullet, Player.X(), Player.Y(), Bullet, Player.Angle(), 400)   # "FireBullet" behavior handles fire rate/ammo; Bullet = the object to fire
if KeyFromTextJustPressed("Space"):
  Physics2::ApplyImpulse(Ball, Physics2, 0, -2, Ball.Physics2::MassCenterX(), Ball.Physics2::MassCenterY())   # physics objects: move with Physics2/Physics3D forces/impulses (N-scale values), never built-in forces
if SystemInfo::IsMobile():                                # also SystemInfo::HasTouchScreen()
  Show(TouchControls)
```

Parameter cheat sheet: relational operators `< > = <= >= !=`; layer: `""` (base layer) or a string; color: rgb format `"255;128;0"`; keys: `"a"`…`"z"`, `"Num0"`…`"Num9"`, `"Space"`, `"Return"`, `"Escape"`, `"Left"/"Up"/"Right"/"Down"`, `"LShift"`, `"LControl"`…; mouse: `"Left"`/`"Right"`; camera: `0`; common expressions: `Player.X()`, `Enemy.Behavior::Func()`, `MyVar`, `Object.MyObjectVar`, `RandomInRange(a, b)`, `ToString(n)`, `ToNumber(s)`, `TimeDelta()`, `NewLine()`, `CursorX()`, `CursorY()`. Compare any two GLOBAL expressions (variables, timers, camera...): `BuiltinCommonInstructions::CompareNumbers(a, relOp, b)` / `CompareStrings(a, relOp, b)` - NEVER on an object expression like `Rock.Object3D::Z()` (it reads ONE arbitrary instance and picks nothing, so the actions would apply to ALL instances): use the object's own condition instead (`PosX(Rock, <, -150)`, `Scene3D::Base3DBehavior::Z(Rock, Object3D, <, -150)`...). Everything is case-sensitive. For a 3D object created with `Create`, also set its Z: `Scene3D::Base3DBehavior::SetZ(Obj, Object3D, =, 0)` (read it with `Obj.Object3D::Z()`).

Every event needs a header line ending with `:` (use `always:` for no conditions; a `js` event's header ends with `"""` instead); body order: local variables (which will be accessible in the conditions too), then actions, then sub-events. Write `pass` as the only body line of an event that has nothing in its body (events are always rendered this way when read).
